import { Outlet } from "react-router";

import { Header, Sidebar } from "../components";
import { useSidebar } from "../hooks/useSidebar";

export default function AuthLayout() {
  const { isOpen } = useSidebar();
  return (
    <div>
      <main
        className={`${isOpen ? "ml-60" : "ml-14"} transition-all h-[calc(100vh-64px)] duration-300 mt-16  bg-slate-200 rounded-tl-3xl relative`}
      >
        <Sidebar />
        <Header />
        <div className="h-4 bg-slate-200 w-[calc(100%-20px)] absolute top-0 left-1 z-30 rounded-tl-3xl"></div>
        <div className="overflow-y-auto h-full p-4">
          <div>
            {/* <Breadcrumbs /> */}
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
