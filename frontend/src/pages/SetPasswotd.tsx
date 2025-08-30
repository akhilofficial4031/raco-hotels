import { LockOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Alert, Button, Input, message } from "antd";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useParams } from "react-router";

import {
  PasswordStrengthValidator,
  usePasswordStrength,
  validatePasswordStrength,
} from "../shared/components/PasswordStrengthValidator";
import {
  type SetPasswordFormData,
  type SetPasswordRequest,
  type SetPasswordResponse,
} from "../shared/models/login";
import { mutationFetcher } from "../utils/swrFetcher";

const SetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Check if token is present
  useEffect(() => {
    if (!token || token.trim() === "") {
      setTokenError(
        "Invalid or missing reset token. Please request a new password reset.",
      );
    } else {
      setTokenError(null);
    }
  }, [token]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SetPasswordFormData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = watch("password");
  const { isValid: isPasswordStrong } = usePasswordStrength(
    watchedPassword || "",
  );

  const onSubmit = async (data: SetPasswordFormData) => {
    try {
      setIsLoading(true);
      setApiError(null);

      // Check if token is available
      if (!token) {
        setApiError(
          "Invalid reset token. Please request a new password reset.",
        );
        return;
      }

      // Extract only the fields needed for API call
      const apiData: SetPasswordRequest = {
        token: token,
        password: data.password,
      };

      const response = await mutationFetcher<SetPasswordResponse>(
        "/auth/set-password",
        {
          arg: {
            body: apiData,
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

        {/* Display token error if any */}
        {tokenError && (
          <Alert message={tokenError} type="error" showIcon className="mb-4" />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
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
                  value: 8,
                  message: "Password must be at least 8 characters long",
                },
                maxLength: {
                  value: 128,
                  message: "Password must not exceed 128 characters",
                },
                validate: (value) => {
                  try {
                    if (!validatePasswordStrength(value || "")) {
                      return "Password must meet all requirements: 8-128 characters, uppercase, lowercase, number, and special character";
                    }
                    return true;
                  } catch (error) {
                    console.error("Password validation error:", error);
                    return "Password validation failed. Please try again.";
                  }
                },
              }}
              render={({ field }) => (
                <PasswordStrengthValidator password={field.value || ""}>
                  <Input.Password
                    {...field}
                    prefix={<LockOutlined />}
                    suffix={
                      <QuestionCircleOutlined className="text-gray-400 cursor-pointer" />
                    }
                    size="large"
                    placeholder="***********"
                    status={errors.password ? "error" : ""}
                    autoComplete="new-password"
                    data-password-field="true"
                    onChange={field.onChange}
                  />
                </PasswordStrengthValidator>
              )}
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-sm text-gray-700">
              Confirm Password
            </label>
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: "Please confirm your password",
                deps: ["password"], // Re-validate when password field changes
                validate: (value, formValues) => {
                  const password = formValues.password;
                  if (value !== password) {
                    return "Passwords do not match";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined />}
                  size="large"
                  placeholder="***********"
                  status={errors.confirmPassword ? "error" : ""}
                  autoComplete="new-password"
                />
              )}
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-sm">
                {errors.confirmPassword.message}
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
            disabled={isLoading || !isPasswordStrong || !!tokenError}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Setting Password..." : "Set Password"}
          </Button>
        </form>
      </div>
    </>
  );
};

export default SetPassword;
