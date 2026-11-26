import { AppHeader } from "@/components/AppHeader";
import { ArcadeLoader } from "@/components/ArcadeLoader";
import { siteConfig } from "@/config/site";

/** โชว์ระหว่างที่เซิร์ฟเวอร์กำลังเตรียมหน้า (เช่น ตอนเข้า /admin) */
export default function Loading() {
  return (
    <>
      <AppHeader subtitle={siteConfig.tagline} busy />
      <main className="mx-auto max-w-5xl px-4">
        <ArcadeLoader label="กำลังโหลด" />
      </main>
    </>
  );
}
