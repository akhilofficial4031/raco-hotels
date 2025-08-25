import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Input, Alert } from "antd";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link } from "react-router";

import { useAuth } from "../shared/contexts/AuthContext";
import { type LoginRequest, type LoginResponse } from "../shared/models/login";
import { mutationFetcher, type APIError } from "../utils/swrFetcher";

const Login = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const onSubmit = async (data: LoginRequest) => {
    console.log("Form submitted with data:", data);
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await mutationFetcher<LoginResponse, LoginRequest>(
        "/auth/login",
        {
          arg: {
            method: "POST",
            body: data,
          },
        },
      );

      // Use the auth context login method which handles navigation
      if (response.data.user) {
        login(response.data.user);
      }
    } catch (error) {
      console.error("Login error:", error);
      const apiError = error as APIError;
      let errorMessage = "Login failed. Please try again.";

      if (apiError.info?.message) {
        errorMessage = apiError.info.message;
      } else if (apiError.status === 401) {
        errorMessage = "Invalid email or password.";
      } else if (apiError.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (!navigator.onLine) {
        errorMessage = "No internet connection. Please check your network.";
      }

      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <h2 className="text-4xl font-bold text-gray-800">Raco Hotels</h2>
      <p className="text-sm text-gray-500 mb-6 ">
        Welcome back! Please enter your details to login
      </p>
      <div className="p-4 w-3/5">
        {/* Display API error if any */}
        {apiError && (
          <Alert
            message={apiError}
            type="error"
            showIcon
            closable
            onClose={() => setApiError(null)}
            className="mb-4"
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm text-gray-700">
              Email Address
            </label>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<MailOutlined />}
                  type="email"
                  size="large"
                  placeholder="admin@raco.com"
                  status={errors.email ? "error" : ""}
                />
              )}
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm text-gray-700">
              Password
            </label>
            <Controller
              name="password"
              control={control}
              rules={{
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined />}
                  size="large"
                  placeholder="***********"
                  status={errors.password ? "error" : ""}
                />
              )}
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>

          <Link to="/forgot-password" className="text-blue-400 text-right">
            Forgot Password?
          </Link>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isLoading}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? "Signing In..." : "Login"}
          </Button>
        </form>
      </div>
    </>
  );
};

export default Login;
