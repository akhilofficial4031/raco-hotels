import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";

import { fetcher } from "@utils/swrFetcher";

import {
  type CreateInquiryPayload,
  type Inquiry,
  type InquiryFormData,
  type InquiryStatus,
} from "../types/inquiry";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const inquirySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  message: z.string().min(1, { message: "Message is required" }),
  status: z.enum(["pending", "addressed", "confirmed"] as const),
  remarks: z.string().optional(),
  attractionSlug: z.string().optional(),
});

interface AddEditInquiryProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (data: CreateInquiryPayload) => void;
  inquiry: Inquiry | null;
  isSaving: boolean;
}

const AddEditInquiry: React.FC<AddEditInquiryProps> = ({
  open,
  onClose,
  onSubmit,
  inquiry,
  isSaving,
}) => {
  const isEditMode = !!inquiry;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      phone: "",
      date: "",
      message: "",
      status: "pending",
      remarks: "",
      attractionSlug: "",
    },
  });

  // Fetch attractions for dropdown - SWR will cache this data automatically
  const { data: attractionsResponse } = useSWR(
    open ? "/attractions?limit=100" : null,
    fetcher<{
      data: { attractions: Array<{ id: number; name: string; slug: string }> };
    }>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 300000, // 5 minutes - prevents duplicate requests
    },
  );

  useEffect(() => {
    if (inquiry) {
      reset({
        name: inquiry.name,
        phone: inquiry.phone,
        date: inquiry.date,
        message: inquiry.message,
        status: inquiry.status,
        remarks: inquiry.remarks || "",
        attractionSlug: "", // We don't have slug in inquiry, only name for display
      });
    } else {
      reset({
        name: "",
        phone: "",
        date: "",
        message: "",
        status: "pending",
        remarks: "",
        attractionSlug: "",
      });
    }
  }, [inquiry, reset]);

  const handleFormSubmit = (data: InquiryFormData) => {
    const payload: CreateInquiryPayload = {
      name: data.name,
      phone: data.phone,
      date: data.date ? dayjs(data.date).format("YYYY-MM-DD") : "",
      message: data.message,
      status: data.status,
      remarks: data.remarks || undefined,
      attractionSlug: data.attractionSlug || undefined,
    };
    onSubmit(payload);
  };

  const statusOptions: {
    label: string;
    value: InquiryStatus;
    color: string;
  }[] = [
    { label: "Pending", value: "pending", color: "orange" },
    { label: "Addressed", value: "addressed", color: "blue" },
    { label: "Confirmed", value: "confirmed", color: "green" },
  ];

  return (
    <Drawer
      title={isEditMode ? "Edit Inquiry" : "Add Inquiry"}
      width={600}
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
          label="Name"
          required
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter full name" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          required
          validateStatus={errors.phone ? "error" : ""}
          help={errors.phone?.message}
        >
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter phone number" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Date"
          required
          validateStatus={errors.date ? "error" : ""}
          help={errors.date?.message}
        >
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => {
                  field.onChange(date ? date.toISOString() : "");
                }}
                className="w-full"
                placeholder="Select date"
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Message"
          required
          validateStatus={errors.message ? "error" : ""}
          help={errors.message?.message}
        >
          <Controller
            name="message"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                rows={4}
                placeholder="Enter inquiry message..."
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Status"
          required
          validateStatus={errors.status ? "error" : ""}
          help={errors.status?.message}
        >
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select {...field} placeholder="Select status">
                {statusOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 bg-${option.color}-500`}
                      />
                      {option.label}
                    </div>
                  </Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Attraction"
          validateStatus={errors.attractionSlug ? "error" : ""}
          help={errors.attractionSlug?.message}
        >
          <Controller
            name="attractionSlug"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select an attraction (optional)"
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {attractionsResponse?.data?.attractions?.map((attraction) => (
                  <Option key={attraction.slug} value={attraction.slug}>
                    {attraction.name}
                  </Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Remarks"
          validateStatus={errors.remarks ? "error" : ""}
          help={errors.remarks?.message}
        >
          <Controller
            name="remarks"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                rows={3}
                placeholder="Add any additional remarks..."
              />
            )}
          />
        </Form.Item>

        {isEditMode && (
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <Text type="secondary" className="text-sm">
              <strong>Created:</strong>{" "}
              {dayjs(inquiry!.createdAt).format("DD MMM YYYY, HH:mm")}
            </Text>
            <br />
            <Text type="secondary" className="text-sm">
              <strong>Last Updated:</strong>{" "}
              {dayjs(inquiry!.updatedAt).format("DD MMM YYYY, HH:mm")}
            </Text>
          </div>
        )}
      </Form>
    </Drawer>
  );
};

export default AddEditInquiry;
