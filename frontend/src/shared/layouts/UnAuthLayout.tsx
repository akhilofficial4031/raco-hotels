import { Outlet } from "react-router";

import GuestGuard from "../components/GuestGuard";

const UnAuthLayout = () => {
  return (
    <GuestGuard>
      <div className="w-full h-screen grid grid-cols-2 bg-black">
        <div className="h-full relative">
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <span className="font-thin text-white">
              Powered by <span className="font-semibold">Raco Group</span>
            </span>
          </div>
          <img
            src="/pattern.jpg"
            alt="login-bg"
            className="object-cover h-full"
          />
        </div>
        <div className="bg-white rounded-l-4xl p-4 flex items-center flex-col h-full justify-center">
          <Outlet />
        </div>
      </div>
    </GuestGuard>
  );
};

export default UnAuthLayout;
