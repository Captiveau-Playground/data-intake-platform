"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <main className="min-h-screen lg:ml-[260px]">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </>
  );
}
