import { Empty } from "antd";
import { Link } from "react-router";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
        <h1 className="text-[100px] font-bold text-gray-500 mb-2">404</h1>
        <p className="text-sm text-gray-500 text-center">The page you are looking for does not exist,<br /> or has been removed.</p>
        <Link to="/dashboard" className="text-blue-500 mt-3">Go to Home</Link>
       
    </div>
  );
};

export default NotFound;