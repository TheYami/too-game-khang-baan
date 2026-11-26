import { ImageResponse } from "next/og";

/**
 * วาดไอคอนแอปเป็น PNG ตามขนาดที่ขอ (ใช้กับ favicon, apple-touch-icon และ manifest)
 * อยากเปลี่ยนโลโก้ แก้ที่นี่ที่เดียว หรือแทนด้วยไฟล์ PNG จริงใน /public ก็ได้
 */
export function renderAppIcon(size: number): ImageResponse {
  const unit = size / 16;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#161b26",
        }}
      >
        {/* ตัวตู้เกม — อยู่ในพื้นที่ปลอดภัยตรงกลาง รองรับไอคอนแบบ maskable */}
        <div
          style={{
            width: unit * 8,
            height: unit * 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "#f5822f",
            borderRadius: unit * 1.2,
            border: `${unit * 0.5}px solid #f7c04a`,
          }}
        >
          <div
            style={{
              marginTop: unit * 0.8,
              width: unit * 5.4,
              height: unit * 3.6,
              display: "flex",
              background: "#161b26",
              borderRadius: unit * 0.5,
            }}
          />
          <div
            style={{
              marginTop: unit * 1.2,
              width: unit * 5.4,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                width: unit * 1.6,
                height: unit * 1.6,
                display: "flex",
                borderRadius: unit,
                background: "#161b26",
              }}
            />
            <div
              style={{
                width: unit * 1.6,
                height: unit * 1.6,
                display: "flex",
                borderRadius: unit,
                background: "#f7c04a",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
