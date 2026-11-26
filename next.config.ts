import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      // ทางลัดของแอดมิน: เปิด /?admin=true แล้วเด้งไปหน้า /admin (ยังต้องใส่รหัสผ่าน)
      {
        source: "/",
        has: [{ type: "query", key: "admin", value: "true" }],
        destination: "/admin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
