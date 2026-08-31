export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ถ้า Request ขึ้นต้นด้วย /api ให้ Forward (Proxy) ไปยัง Railway Backend
    if (url.pathname.startsWith('/api')) {
      const backendUrl = env.BACKEND_API_URL || 'https://backendcaly-production.up.railway.app';
      const targetUrl = new URL(url.pathname + url.search, backendUrl);

      // สร้าง Request ใหม่ส่งต่อไป Backend โดยคง Method, Headers, และ Body เดิมไว้
      const modifiedRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'follow',
      });

      try {
        const response = await fetch(modifiedRequest);

        // คืนค่า Response กลับมาให้ Frontend พร้อม Headers
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        newHeaders.set('Access-Control-Allow-Headers', '*');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Backend proxy error', details: error.message }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // ถ้าเป็นเส้นทางอื่นๆ ให้เสิร์ฟ Static Assets ของ Frontend จากโฟลเดอร์ dist
    return env.ASSETS.fetch(request);
  },
};
