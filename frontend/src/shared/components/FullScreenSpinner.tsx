import { Spin } from "antd";

const FullScreenSpinner = () => {
  return (
    <div className="flex justify-center items-center h-[calc(100vh-100px)]  ">
      <div className="h-full w-full border-gray-900/20">
        <div className="flex justify-center items-center h-full w-full">
          <Spin size="large" />
        </div>
      </div>
    </div>
  );
};

export default FullScreenSpinner;
