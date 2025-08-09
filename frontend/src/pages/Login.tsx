import { Button, Input } from "antd";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => console.log(data);
  console.log(errors);
  return (
    <>
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="text-sm text-gray-500 mb-6">
          Please enter your details to login
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <Input
            type="text"
            size="large"
            placeholder="Username"
            {...register("email", { required: true, maxLength: 100 })}
          />
          <Input
            type="password"
            size="large"
            placeholder="Password"
            {...register("password", { required: true })}
          />
          <Link to="/forgot-password" className="text-blue-400 text-right">
            Forgot Password?
          </Link>

          <Button type="primary" htmlType="submit" size="large">
            Login
          </Button>
        </form>
      </div>
    </>
  );
};

export default Login;
