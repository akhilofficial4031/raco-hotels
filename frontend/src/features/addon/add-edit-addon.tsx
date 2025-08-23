/* eslint-disable no-unused-vars */
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Drawer, Form, Input, Select, Space } from "antd";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { type Addon } from "../../shared/models/addon";

const { TextArea } = Input;

const addonSchema = z.object({
  name: z.string().min(1, { message: "Addon name is required" }),
  description: z.string().optional(),
  category: z.string().optional(),
  unitType: z.string().optional(),
});

interface AddonFormData {
  name: string;
  description?: string;
  category?: string;
  unitType?: string;
}

interface AddEditAddonProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddonFormData) => void;
  addon: Addon | null;
  isSaving: boolean;
}

const AddEditAddon: React.FC<AddEditAddonProps> = ({
  open,
  onClose,
  onSubmit,
  addon,
  isSaving,
}) => {
  const isEditMode = !!addon;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddonFormData>({
    resolver: zodResolver(addonSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      unitType: "",
    },
  });

  useEffect(() => {
    if (addon) {
      reset({
        name: addon.name,
        description: addon.description || "",
        category: addon.category || "",
        unitType: addon.unitType || "",
      });
    } else {
      reset({
        name: "",
        description: "",
        category: "",
        unitType: "",
      });
    }
  }, [addon, reset, open]);

  const handleFormSubmit = (data: AddonFormData) => {
    data.unitType = "night";
    onSubmit(data);
  };

  const categories = [
    { value: "bed", label: "Bed" },
    { value: "food", label: "Food" },
    { value: "service", label: "Service" },
    { value: "amenity", label: "Amenity" },
  ];

  // const unitTypes = [
  //   { value: "item", label: "Item" },
  //   { value: "person", label: "Person" },
  //   { value: "night", label: "Night" },
  //   { value: "hour", label: "Hour" },
  // ];

  return (
    <>
      <Drawer
        title={isEditMode ? "Edit Addon" : "Add Addon"}
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
            label="Addon Name"
            required
            validateStatus={errors.name ? "error" : ""}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter addon name" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Description"
            validateStatus={errors.description ? "error" : ""}
            help={errors.description?.message}
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  placeholder="Enter addon description (optional)"
                  rows={4}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Category"
            validateStatus={errors.category ? "error" : ""}
            help={errors.category?.message}
          >
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select a category (optional)"
                  allowClear
                  options={categories}
                />
              )}
            />
          </Form.Item>
          {/* 
          <Form.Item
            label="Unit Type"
            validateStatus={errors.unitType ? "error" : ""}
            help={errors.unitType?.message}
          >
            <Controller
              name="unitType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select unit type (optional)"
                  allowClear
                  options={unitTypes}
                />
              )}
            />
          </Form.Item> */}
        </Form>
      </Drawer>
    </>
  );
};

export default AddEditAddon;
