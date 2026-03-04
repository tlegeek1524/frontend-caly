import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
          const decodedPayload = JSON.parse(atob(payload));
          
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

        // เช็คว่า user มีข้อมูล Cal (TDEE) ใน Airtable หรือไม่
        const apiToken = import.meta.env.VITE_AIRTABLE_TOKEN_TDEE;
        const baseId = import.meta.env.VITE_AIRTABLE_BASE_TDEE;
        const tableId = import.meta.env.VITE_AIRTABLE_TABLE_TDEE;
        
        const airtableUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
        
        // ใช้ filterByFormula เพื่อค้นหาเฉพาะ user นี้
        const airtableResponse = await fetch(`${airtableUrl}?filterByFormula=${encodeURIComponent(`line_uid='${profileData.userId}'`)}`, {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        });

        const airtableData = await airtableResponse.json();
        
        // เช็คว่ามี record และมีค่า Cal (TDEE) หรือไม่
        let hasCalData = false;
        if (airtableData.records && airtableData.records.length > 0) {
          const userRecord = airtableData.records[0].fields;
          // เช็คว่ามี Cal และไม่เป็นค่าว่าง
          hasCalData = userRecord.Cal && userRecord.Cal !== '' && userRecord.Cal !== '0';
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
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007aff] mx-auto mb-4"></div>
        <p className="text-[15px] text-[#8e8e93]">กำลังเข้าสู่ระบบ...</p>
      </div>
    </div>
  );
};

export default LineCallback;
