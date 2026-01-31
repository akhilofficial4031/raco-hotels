import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Drawer, Form, Input, Select, Space } from "antd";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { capitalize } from "@utils/utility";

import {
  UserStatus,
  type UserStatusType,
  USER_STATUS_VALUES,
} from "../../../../../shared/types/user";
import { type User, type CreateUserPayload } from "../types/users";

const { Option } = Select;

const userSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  fullName: z.string().min(1, { message: "Full name is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  role: z.string().min(1, { message: "Role is required" }),
  status: z.string().min(1, { message: "Status is required" }),
});

interface AddEditUserProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
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
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      role: "staff",
      status: UserStatus.PENDING_ACTIVATION,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        fullName: user.fullName || "",
        phone: user.phone || "",
        role: user.role,
        status: user.status,
      });
    } else {
      reset({
        email: "",
        fullName: "",
        phone: "",
        role: "staff",
        status: UserStatus.PENDING_ACTIVATION,
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
                <Option value="staff">Staff</Option>
                <Option value="admin">Admin</Option>
              </Select>
            )}
          />
        </Form.Item>
        {isEditMode && (
          <Form.Item
            label="Active Status"
            validateStatus={errors.status ? "error" : ""}
            help={errors.status?.message}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  {USER_STATUS_VALUES.map((status: UserStatusType) => (
                    <Option key={status} value={status}>
                      {capitalize(status)}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default AddEditUser;
