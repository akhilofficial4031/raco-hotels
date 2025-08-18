import { Outlet } from "react-router";

import { Header, Sidebar } from "../components";
import { useSidebar } from "../hooks/useSidebar";

export default function AuthLayout() {
  const { isOpen } = useSidebar();
  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, var(--color-background) 0%, var(--color-background-secondary) 50%, var(--color-primary-50) 100%)`,
      }}
    >
      <main
        className={`${isOpen ? "ml-60" : "ml-14"} transition-all duration-300`}
      >
        <Sidebar />
        <Header />
        <div className="mt-16 p-6">
          {/* <Breadcrumbs /> */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
