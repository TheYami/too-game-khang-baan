import type { Metadata } from "next";
import { AdminLogin } from "@/components/AdminLogin";
import { DealsScreen } from "@/components/DealsScreen";
import { isAdminAuthed } from "@/lib/auth/adminSession";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: "เครื่องมือแอดมิน",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAdminAuthed())) return <AdminLogin />;

  return (
    <DealsScreen
      mode="admin"
      headerAction={
        <form action={logoutAction}>
          <button
            type="submit"
            className="h-11 rounded-full border border-cabinet-600 px-4 text-sm font-medium text-cream transition hover:border-ember-400 hover:text-ember-400"
          >
            ออกจากระบบ
          </button>
        </form>
      }
    />
  );
}
