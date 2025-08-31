import { MailOutlined } from "@ant-design/icons";
import { Alert, Button, Input, message } from "antd";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";

import {
  type ForgotPasswordResponse,
  type ForgotPasswordRequest,
} from "../shared/models/login";
import { mutationFetcher } from "../utils/swrFetcher";

const ForgotPasswordPage = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordRequest) => {
    try {
      setIsLoading(true);
      setApiError(null);
      const response = await mutationFetcher<ForgotPasswordResponse>(
        "/auth/forgot-password",
        {
          arg: {
            body: data,
          },
        },
      );

      message.success(response.message);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-4xl font-bold text-gray-800">Raco Hotels</h2>
      <p className="text-sm text-gray-500 mb-6 ">
        Please enter your email address to reset your password
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

        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
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

          <Link to="/login" className="text-blue-400 text-right">
            Go to Login
          </Link>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isLoading}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
