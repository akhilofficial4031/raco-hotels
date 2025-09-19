/* eslint-disable no-unused-vars */
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Drawer, Form, Input, Space } from "antd";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { type Feature } from "../../shared/models/featuers";

const { TextArea } = Input;

const featureSchema = z.object({
  name: z.string().min(1, { message: "Feature name is required" }),
  description: z.string().optional(),
});

interface FeatureFormData {
  name: string;
  description?: string;
}

interface AddEditFeatureProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FeatureFormData) => void;
  feature: Feature | null;
  isSaving: boolean;
}

const AddEditFeature: React.FC<AddEditFeatureProps> = ({
  open,
  onClose,
  onSubmit,
  feature,
  isSaving,
}) => {
  const isEditMode = !!feature;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeatureFormData>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (feature) {
      reset({
        name: feature.name,
        description: feature.description || "",
      });
    } else {
      reset({
        name: "",
        description: "",
      });
    }
  }, [feature, reset, open]);

  const handleFormSubmit = (data: FeatureFormData) => {
    onSubmit(data);
  };

  return (
    <>
      <Drawer
        title={isEditMode ? "Edit Feature" : "Add Feature"}
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
            label="Feature Name"
            required
            validateStatus={errors.name ? "error" : ""}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter feature name" />
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
                  placeholder="Enter feature description (optional)"
                  rows={4}
                />
              )}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default AddEditFeature;
