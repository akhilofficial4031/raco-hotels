import { Outlet } from "react-router";

import { Header, Sidebar } from "../components";
import { useSidebar } from "../hooks/useSidebar";

export default function AuthLayout() {
  const { isOpen } = useSidebar();
  return (
    <div>
      <main
        className={`${isOpen ? "ml-60" : "ml-14"} transition-all h-[calc(100vh-64px)] duration-300 mt-16  bg-slate-200 rounded-tl-3xl`}
      >
        <Sidebar />
        <Header />
        <div className="overflow-y-auto h-full px-4">
          <div className="my-4">
            {/* <Breadcrumbs /> */}
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
