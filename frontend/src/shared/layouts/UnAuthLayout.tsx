import { Outlet } from "react-router";

const UnAuthLayout = () => {
  return (
    <div className="w-full h-screen bg-[url(/login-bg.webp)] bg-cover bg-center flex items-center justify-center">
      <div className="w-1/3 h-fit bg-white rounded-lg p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default UnAuthLayout;
