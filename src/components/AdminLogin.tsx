"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";
import { AppHeader } from "./AppHeader";

const initialState: LoginState = { error: null };

export function AdminLogin() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <>
      <AppHeader subtitle="เครื่องมือแอดมิน" />
      <main className="mx-auto flex max-w-sm flex-col px-4 pt-16 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <p className="text-center font-pixel text-xl text-gold-400">
          INSERT COIN
        </p>
        <form action={formAction} className="mt-8 flex flex-col gap-3">
          <label htmlFor="admin-password" className="text-sm font-medium text-cream">
            รหัสผ่านแอดมิน
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "admin-password-error" : undefined}
            className="h-12 rounded-2xl border border-cabinet-600 bg-cabinet-800 px-4 text-base text-cream focus:border-ember-400 focus:ring-2 focus:ring-ember-400/30 focus:outline-none"
          />
          {state.error && (
            <p id="admin-password-error" role="alert" className="text-sm text-red-300">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 h-12 rounded-xl bg-ember-500 text-sm font-bold text-cabinet-950 transition hover:bg-ember-400 active:translate-y-0.5 disabled:opacity-60"
          >
            {pending ? "กำลังตรวจสอบ" : "เข้าสู่ระบบ"}
          </button>
        </form>
      </main>
    </>
  );
}
