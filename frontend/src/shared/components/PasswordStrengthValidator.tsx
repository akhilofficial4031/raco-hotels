import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { useMemo } from "react";

export interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

export interface PasswordStrengthResult {
  requirements: PasswordRequirement[];
  isValid: boolean;
  score: number;
}

export const usePasswordStrength = (
  password: string,
): PasswordStrengthResult => {
  const requirements: PasswordRequirement[] = useMemo(
    () => [
      {
        label: "At least 8 characters long",
        regex: /.{8,}/,
        met: password.length >= 8,
      },
      {
        label: "At least one lowercase letter (a-z)",
        regex: /[a-z]/,
        met: password.length > 0 && /[a-z]/.test(password),
      },
      {
        label: "At least one uppercase letter (A-Z)",
        regex: /[A-Z]/,
        met: password.length > 0 && /[A-Z]/.test(password),
      },
      {
        label: "At least one number (0-9)",
        regex: /[0-9]/,
        met: password.length > 0 && /[0-9]/.test(password),
      },
      {
        label: "At least one special character (!@#$%^&*)",
        regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        met:
          password.length > 0 &&
          /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      },
    ],
    [password],
  );

  const score = requirements.filter((req) => req.met).length;
  const isValid = score === requirements.length;

  return {
    requirements,
    isValid,
    score,
  };
};

interface PasswordStrengthDropdownProps {
  password: string;
  children: React.ReactNode;
}

export const PasswordStrengthDropdown: React.FC<
  PasswordStrengthDropdownProps
> = ({ password, children }) => {
  const { requirements, isValid } = usePasswordStrength(password);

  const dropdownContent = (
    <div
      className="p-4 min-w-80 bg-white z-50"
      style={{
        zIndex: 9999,
        position: "relative",
        maxHeight: "300px",
        overflowY: "auto",
      }}
    >
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          Your password must meet all of the following requirements:
        </p>
      </div>
      <div className="space-y-2">
        {requirements.map((requirement, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            {requirement.met ? (
              <CheckCircleOutlined className="text-green-500 text-base" />
            ) : (
              <CloseCircleOutlined className="text-red-400 text-base" />
            )}
            <span
              className={requirement.met ? "text-green-700" : "text-gray-600"}
            >
              {requirement.label}
            </span>
          </div>
        ))}
      </div>
      {isValid && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircleOutlined className="text-base" />
            <span className="text-sm font-medium">
              Great! Your password meets all requirements.
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: "password-requirements",
            label: (
              <div style={{ padding: 0, margin: 0 }}>{dropdownContent}</div>
            ),
          },
        ],
      }}
      trigger={["click"]}
      placement="topLeft"
      arrow
    >
      {children}
    </Dropdown>
  );
};

interface PasswordStrengthValidatorProps {
  password: string;
  children: React.ReactNode;
}

export const PasswordStrengthValidator: React.FC<
  PasswordStrengthValidatorProps
> = ({ password, children }) => {
  return (
    <PasswordStrengthDropdown password={password}>
      {children}
    </PasswordStrengthDropdown>
  );
};

// Pure function for password validation (no hooks)
export const validatePasswordStrength = (password: string): boolean => {
  // Early return for empty password
  if (!password || typeof password !== "string") {
    return false;
  }

  // Length validation
  if (password.length < 8 || password.length > 128) {
    return false;
  }

  // Character requirements
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  return hasLowercase && hasUppercase && hasNumber && hasSpecialChar;
};

// Export utility function for form validation
export const validatePasswordStrengthHook = (password: string): boolean => {
  const { isValid } = usePasswordStrength(password);
  return isValid;
};
