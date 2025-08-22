import { Outlet } from "react-router";

const UnAuthLayout = () => {
  return (
    <div className="w-full h-screen grid grid-cols-2 bg-black">
      <div className="h-full">
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
  );
};

export default UnAuthLayout;
