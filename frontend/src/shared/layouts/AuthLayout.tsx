import { Outlet } from "react-router";

import { Header, Sidebar } from "../components";
import { useSidebar } from "../hooks/useSidebar";

export default function AuthLayout() {
  const { isOpen } = useSidebar();
  return (
    <div className="min-h-screen bg-slate-200">
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
