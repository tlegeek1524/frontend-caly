import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingOverlay from '../../components/Loading/LoadingOverlay';
import { getUserService } from '../../services/user.service';

const LineCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // ป้องกันการรันซ้ำใน React Strict Mode
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const savedState = sessionStorage.getItem('line_login_state');

      if (state !== savedState) {
        console.error('Invalid state parameter');
        navigate('/linelogin');
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        navigate('/linelogin');
        return;
      }

      try {
        const channelId = import.meta.env.VITE_LINE_CHANNEL_ID;
        const channelSecret = import.meta.env.VITE_LINE_CHANNEL_SECRET;
        const callbackUrl = import.meta.env.VITE_LINE_CALLBACK_URL;

        // แลก code เป็น access token
        const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: callbackUrl,
            client_id: channelId,
            client_secret: channelSecret,
          }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
          throw new Error(tokenData.error_description || 'Failed to get access token');
        }

        // ดึงข้อมูลจาก id_token (เหมือนตัวอย่าง PHP)
        let profileData = {
          userId: '',
          name: '',
          picture: '',
          email: '',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token
        };

        if (tokenData.id_token) {
          const payload = tokenData.id_token.split('.')[1];
          // แก้ไขการ decode เพื่อรองรับ UTF-8 (ภาษาไทย, อิโมจิ)
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decodedPayload = JSON.parse(jsonPayload);
          
          profileData.name = decodedPayload.name || '';
          profileData.picture = decodedPayload.picture || '';
          profileData.email = decodedPayload.email || '';
        }

        // ดึงข้อมูล userId จาก profile API
        const profileResponse = await fetch('https://api.line.me/v2/profile', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        const profile = await profileResponse.json();

        if (!profileResponse.ok) {
          throw new Error('Failed to get profile');
        }

        profileData.userId = profile.userId;

        // เช็คว่า user มีข้อมูล Cal (TDEE) หรือไม่
        let hasCalData = false;
        try {
          const userRes = await getUserService(profileData.userId);
          if (userRes.success && userRes.data) {
            const record = userRes.data;
            hasCalData = record && record.cal && record.cal !== 0 && record.cal !== '0';
          }
        } catch (e) {
          console.log('Cannot check user data:', e);
        }

        // เก็บข้อมูล user
        const user = {
          id: profileData.userId,
          name: profileData.name,
          picture: profileData.picture,
          email: profileData.email,
          access_token: profileData.access_token,
          refresh_token: profileData.refresh_token
        };

        localStorage.setItem('user', JSON.stringify(user));
        sessionStorage.removeItem('line_login_state');

        // ถ้ามีข้อมูล Cal (TDEE) ไป dashboard, ถ้าไม่มีไป regis
        if (hasCalData) {
          navigate('/dashboard');
        } else {
          navigate('/regis');
        }
      } catch (err) {
        console.error('Login error:', err);
        navigate('/linelogin');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div 
      className="min-h-screen bg-[#f2f2f7] flex items-center justify-center"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
    >
      <LoadingOverlay show={true} message="กำลังเข้าสู่ระบบและตรวจสอบข้อมูล..." />
    </div>
  );
};

export default LineCallback;
