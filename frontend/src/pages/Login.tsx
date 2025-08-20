import { Button, Input, Alert } from "antd";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate } from "react-router";

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

  const navigate = useNavigate();
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

      // Store user data if needed
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      // Navigate to dashboard or home page
      navigate("/dashboard");
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
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="text-sm text-gray-500 mb-6">
          Please enter your details to login
        </p>

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
                  type="email"
                  size="large"
                  placeholder="Email"
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
                  size="large"
                  placeholder="Password"
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
