import { Button, Drawer, Form, Input, Select, Space } from "antd";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type User, type CreateUserPayload } from "../../shared/models/users";
import { useEffect } from "react";

const { Option } = Select;

const userSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  fullName: z.string().min(1, { message: "Full name is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  role: z.enum(["guest", "staff", "admin"]),
  password: z.string().optional(),
});

const addUserSchema = userSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      "Password must contain at least one special character",
    ),
});

interface AddEditUserProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload) => void;
  user: User | null;
  isSaving: boolean;
}

const AddEditUser: React.FC<AddEditUserProps> = ({
  open,
  onClose,
  onSubmit,
  user,
  isSaving,
}) => {
  const isEditMode = !!user;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserPayload>({
    resolver: zodResolver(isEditMode ? userSchema : addUserSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      role: "guest",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        fullName: user.fullName || "",
        phone: user.phone || "",
        role: user.role,
      });
    } else {
      reset({
        email: "",
        fullName: "",
        phone: "",
        role: "guest",
        password: "",
      });
    }
  }, [user, reset, open]);

  const handleFormSubmit = (data: CreateUserPayload) => {
    onSubmit(data);
  };

  return (
    <Drawer
      title={isEditMode ? "Edit User" : "Add User"}
      width={500}
      onClose={onClose}
      open={open}
      styles={{
        body: {
          paddingBottom: 80,
        },
      }}
      footer={
        <Space style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit(handleFormSubmit)}
            type="primary"
            loading={isSaving}
          >
            Save
          </Button>
        </Space>
      }
    >
      <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
        <Form.Item
          label="Full Name"
          required
          validateStatus={errors.fullName ? "error" : ""}
          help={errors.fullName?.message}
        >
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Item>
        <Form.Item
          label="Email"
          required
          validateStatus={errors.email ? "error" : ""}
          help={errors.email?.message}
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Item>
        {!isEditMode && (
          <Form.Item
            label="Password"
            required
            validateStatus={errors.password ? "error" : ""}
            help={errors.password?.message}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => <Input.Password {...field} />}
            />
          </Form.Item>
        )}
        <Form.Item
          label="Phone"
          required
          validateStatus={errors.phone ? "error" : ""}
          help={errors.phone?.message}
        >
          <Controller
            name="phone"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Item>
        <Form.Item
          label="Role"
          required
          validateStatus={errors.role ? "error" : ""}
          help={errors.role?.message}
        >
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select {...field}>
                <Option value="guest">Guest</Option>
                <Option value="staff">Staff</Option>
                <Option value="admin">Admin</Option>
              </Select>
            )}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddEditUser;
