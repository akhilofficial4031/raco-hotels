/* eslint-disable no-unused-vars */
import { UploadOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Upload,
  Image,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";

import LocationInfoForm from "./LocationInfoForm";
import { type FeatureListResponse } from "../../../shared/models";
import { type AmenityListResponse } from "../../../shared/models/amenity";
import {
  type Hotel,
  type HotelImage,
  type CreateHotelPayload,
} from "../../../shared/models/hotels";
import { fetcher } from "../../../utils/swrFetcher";

import type { UploadFile, UploadProps } from "antd";

const { Option } = Select;
const { TextArea } = Input;

// Remove local interface - using the one from models

// Location info validation schema
const locationInfoImageSchema = z.object({
  url: z.string().url("Invalid URL"),
  alt: z.string().min(1, "Alt text is required"),
});

const locationInfoSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  subHeading: z.string().min(1, "Sub heading is required"),
  bulletPoints: z.array(z.string().min(1, "Bullet point cannot be empty")),
  description: z.string().min(1, "Description is required"),
  images: z.array(locationInfoImageSchema),
});

// Main hotel schema
const hotelSchema = z.object({
  name: z.string().min(1, "Hotel name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional(),
  starRating: z.number().min(1).max(5).optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  locationInfo: z.array(locationInfoSchema).optional(),
  amenities: z.array(z.number()).optional(),
  features: z.array(z.number()).optional(),
  isActive: z.number().optional(),
});

interface AddEditHotelProps {
  hotel: Hotel | null;
  onSubmit: (
    hotelData: CreateHotelPayload,
    images?: File[],
    replaceImages?: boolean,
  ) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const AddEditHotel: React.FC<AddEditHotelProps> = ({
  hotel,
  onSubmit,
  onCancel,
  isSaving,
}) => {
  const isEditMode = !!hotel;

  // Image upload state
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<HotelImage[]>([]);
  const [replaceImages, setReplaceImages] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Fetch amenities and features for dropdowns
  const { data: amenitiesData } = useSWR(
    "/amenities",
    fetcher<AmenityListResponse>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
  const amenitityList = amenitiesData?.data.amenities;

  const { data: featuresData } = useSWR(
    "/features",
    fetcher<FeatureListResponse>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
  const featureList = featuresData?.data.features;
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateHotelPayload>({
    resolver: zodResolver(hotelSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      countryCode: "",
      latitude: undefined,
      longitude: undefined,
      timezone: "",
      starRating: undefined,
      checkInTime: "",
      checkOutTime: "",
      locationInfo: [],
      amenities: [],
      features: [],
      isActive: 1,
    },
  });

  useEffect(() => {
    if (hotel) {
      // Extract IDs from amenities - handle both number[] and Amenity[] cases
      const amenityIds = hotel.amenities
        ? hotel.amenities.map((amenity) =>
            typeof amenity === "number" ? amenity : amenity.id,
          )
        : [];

      // Extract IDs from features - handle both number[] and Feature[] cases
      const featureIds = hotel.features
        ? hotel.features.map((feature) =>
            typeof feature === "number" ? feature : feature.id,
          )
        : [];

      // Set existing images if hotel has images property
      if ((hotel as any).images) {
        const images = (hotel as any).images.map((img: any) => ({
          id: img.id,
          url: img.url,
          alt: img.alt || "",
          sortOrder: img.sortOrder || 0,
        }));
        setExistingImages(images);
      }

      const resetData = {
        name: hotel.name || "",
        slug: hotel.slug || "",
        description: hotel.description || "",
        email: hotel.email || "",
        phone: hotel.phone || "",
        addressLine1: hotel.addressLine1 || "",
        addressLine2: hotel.addressLine2 || "",
        city: hotel.city || "",
        state: hotel.state || "",
        postalCode: hotel.postalCode || "",
        countryCode: hotel.countryCode || "",
        latitude: hotel.latitude || undefined,
        longitude: hotel.longitude || undefined,
        timezone: hotel.timezone || "",
        starRating: hotel.starRating || undefined,
        checkInTime: hotel.checkInTime || "",
        checkOutTime: hotel.checkOutTime || "",
        locationInfo: hotel.locationInfo || [],
        amenities: amenityIds,
        features: featureIds,
        isActive: hotel.isActive || 1,
      };

      reset(resetData, { keepDefaultValues: false });
    } else if (!isEditMode) {
      // Reset image state for add mode
      setExistingImages([]);
      setUploadedImages([]);
      setFileList([]);
      setReplaceImages(false);

      reset({
        name: "",
        slug: "",
        description: "",
        email: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        countryCode: "",
        latitude: undefined,
        longitude: undefined,
        timezone: "",
        starRating: undefined,
        checkInTime: "",
        checkOutTime: "",
        locationInfo: [],
        amenities: [],
        features: [],
        isActive: 1,
      });
    }
  }, [hotel, reset, isEditMode]);

  const handleFormSubmit = (formData: CreateHotelPayload) => {
    const cleanedData = {
      ...formData,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      addressLine1: formData.addressLine1 || undefined,
      addressLine2: formData.addressLine2 || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      postalCode: formData.postalCode || undefined,
      countryCode: formData.countryCode || undefined,
      timezone: formData.timezone || undefined,
      checkInTime: formData.checkInTime || undefined,
      checkOutTime: formData.checkOutTime || undefined,
      description: formData.description || undefined,
      locationInfo: formData.locationInfo?.length
        ? formData.locationInfo
        : undefined,
      amenities: formData.amenities?.length ? formData.amenities : undefined,
      features: formData.features?.length ? formData.features : undefined,
    };

    // Pass image data to parent
    onSubmit(
      cleanedData,
      uploadedImages,
      isEditMode ? replaceImages : undefined,
    );
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Image upload handlers
  const handleUploadChange: UploadProps["onChange"] = (info) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);

    // Extract actual files for submission
    const files = newFileList
      .filter((file) => file.status !== "error" && file.originFileObj)
      .map((file) => file.originFileObj as File);
    setUploadedImages(files);
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const beforeUpload = (file: File) => {
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG/WebP files!");
      return false;
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("Image must be smaller than 10MB!");
      return false;
    }
    return false; // Prevent auto upload
  };

  const removeExistingImage = (imageId: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // Don't render form in edit mode until we have hotel data
  if (isEditMode && !hotel) {
    return <div>Loading hotel data...</div>;
  }

  return (
    <div className="w-full">
      <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 gap-4">
          {/* Basic Information */}
          <Card
            title={
              <span className="text-lg font-semibold">Basic Information</span>
            }
            className="shadow-sm border-gray-200"
          >
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  label="Hotel Name"
                  required
                  validateStatus={errors.name ? "error" : ""}
                  help={errors.name?.message}
                >
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        size="large"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setValue("slug", generateSlug(e.target.value));
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Slug"
                  required
                  validateStatus={errors.slug ? "error" : ""}
                  help={errors.slug?.message}
                >
                  <Controller
                    name="slug"
                    control={control}
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Description"
              validateStatus={errors.description ? "error" : ""}
              help={errors.description?.message}
            >
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextArea rows={4} {...field} size="large" />
                )}
              />
            </Form.Item>

            <Row gutter={[24, 16]}>
              <Col span={8}>
                <Form.Item
                  label="Star Rating"
                  validateStatus={errors.starRating ? "error" : ""}
                  help={errors.starRating?.message}
                >
                  <Controller
                    name="starRating"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select rating"
                        size="large"
                      >
                        <Option value={1}>1 Star</Option>
                        <Option value={2}>2 Stars</Option>
                        <Option value={3}>3 Stars</Option>
                        <Option value={4}>4 Stars</Option>
                        <Option value={5}>5 Stars</Option>
                      </Select>
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Check-in Time"
                  validateStatus={errors.checkInTime ? "error" : ""}
                  help={errors.checkInTime?.message}
                >
                  <Controller
                    name="checkInTime"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="time"
                        placeholder="15:00"
                        size="large"
                        className="w-full"
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Check-out Time"
                  validateStatus={errors.checkOutTime ? "error" : ""}
                  help={errors.checkOutTime?.message}
                >
                  <Controller
                    name="checkOutTime"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="time"
                        placeholder="11:00"
                        size="large"
                        className="w-full"
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Contact Information */}
          <Card
            title={
              <span className="text-lg font-semibold">Contact Information</span>
            }
            className="shadow-sm border-gray-200"
          >
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  validateStatus={errors.email ? "error" : ""}
                  help={errors.email?.message}
                >
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Phone"
                  validateStatus={errors.phone ? "error" : ""}
                  help={errors.phone?.message}
                >
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Address Information */}
          <Card
            title={
              <span className="text-lg font-semibold">Address Information</span>
            }
            className="shadow-sm border-gray-200"
          >
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  label="Address Line 1"
                  validateStatus={errors.addressLine1 ? "error" : ""}
                  help={errors.addressLine1?.message}
                >
                  <Controller
                    name="addressLine1"
                    control={control}
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Address Line 2"
                  validateStatus={errors.addressLine2 ? "error" : ""}
                  help={errors.addressLine2?.message}
                >
                  <Controller
                    name="addressLine2"
                    control={control}
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 16]}>
              <Col span={8}>
                <Form.Item
                  label="City"
                  validateStatus={errors.city ? "error" : ""}
                  help={errors.city?.message}
                >
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="State"
                  validateStatus={errors.state ? "error" : ""}
                  help={errors.state?.message}
                >
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Postal Code"
                  validateStatus={errors.postalCode ? "error" : ""}
                  help={errors.postalCode?.message}
                >
                  <Controller
                    name="postalCode"
                    control={control}
                    render={({ field }) => <Input {...field} size="large" />}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 16]}>
              <Col span={8}>
                <Form.Item
                  label="Country Code"
                  validateStatus={errors.countryCode ? "error" : ""}
                  help={errors.countryCode?.message}
                >
                  <Controller
                    name="countryCode"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} size="large" placeholder="US" />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Timezone"
                  validateStatus={errors.timezone ? "error" : ""}
                  help={errors.timezone?.message}
                >
                  <Controller
                    name="timezone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        size="large"
                        placeholder="America/Los_Angeles"
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Latitude"
                  validateStatus={errors.latitude ? "error" : ""}
                  help={errors.latitude?.message}
                >
                  <Controller
                    name="latitude"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        className="!w-full"
                        placeholder="37.789"
                        step={0.000001}
                        size="large"
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  label="Longitude"
                  validateStatus={errors.longitude ? "error" : ""}
                  help={errors.longitude?.message}
                >
                  <Controller
                    name="longitude"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        className="!w-full"
                        placeholder="-122.401"
                        step={0.000001}
                        size="large"
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Location Information */}
          <Card
            title={
              <span className="text-lg font-semibold">Location Details</span>
            }
            className="shadow-sm border-gray-200"
          >
            <LocationInfoForm control={control} errors={errors} />
          </Card>

          {/* Amenities & Features */}
          <Card
            title={
              <span className="text-lg font-semibold">
                Amenities & Features
              </span>
            }
            className="shadow-sm border-gray-200"
          >
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Form.Item
                  label="Amenities"
                  validateStatus={errors.amenities ? "error" : ""}
                  help={errors.amenities?.message}
                >
                  <Controller
                    name="amenities"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        mode="multiple"
                        placeholder="Select amenities"
                        size="large"
                        className="w-full"
                        options={(() => {
                          if (!amenitiesData) return [];
                          if (!Array.isArray(amenitityList)) return [];
                          return amenitityList.map((amenity) => ({
                            value: amenity.id,
                            label: amenity.name,
                          }));
                        })()}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Features"
                  validateStatus={errors.features ? "error" : ""}
                  help={errors.features?.message}
                >
                  <Controller
                    name="features"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        mode="multiple"
                        placeholder="Select features"
                        size="large"
                        className="w-full"
                        options={(() => {
                          if (!featuresData) return [];
                          if (!Array.isArray(featureList)) return [];
                          return featureList.map((feature) => ({
                            value: feature.id,
                            label: feature.name,
                          }));
                        })()}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Hotel Images */}
          <Card
            title={<span className="text-lg font-semibold">Hotel Images</span>}
            className="shadow-sm border-gray-200"
          >
            <div className="space-y-4">
              {/* Existing Images (shown in edit mode when not replacing) */}
              {isEditMode && existingImages.length > 0 && !replaceImages && (
                <div>
                  <h4 className="font-medium mb-3">Current Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <Image
                          src={image.url}
                          alt={image.alt || "Hotel image"}
                          className="w-full h-24 object-cover rounded-lg"
                          preview={{
                            mask: <EyeOutlined className="text-white" />,
                          }}
                        />
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md"
                          onClick={() => removeExistingImage(image.id!)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              <div>
                <h4 className="font-medium mb-3">
                  {isEditMode && !replaceImages
                    ? "Add New Images"
                    : "Upload Images"}
                </h4>
                <Upload
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleUploadChange}
                  onPreview={handlePreview}
                  beforeUpload={beforeUpload}
                  className="upload-list-inline"
                >
                  {fileList.length >= 8 ? null : (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
                <div className="text-sm text-gray-500 mt-2">
                  • Supported formats: JPEG, PNG, WebP
                  <br />
                  • Maximum file size: 10MB per image
                  <br />• Maximum images: 8
                </div>
              </div>

              {/* Image Preview Modal */}
              <Image
                style={{ display: "none" }}
                src={previewImage}
                preview={{
                  visible: previewVisible,
                  onVisibleChange: (visible) => setPreviewVisible(visible),
                }}
              />
            </div>
          </Card>

          {/* Status */}
          <Card
            title={<span className="text-lg font-semibold">Status</span>}
            className="shadow-sm border-gray-200"
          >
            <Form.Item
              label="Status"
              validateStatus={errors.isActive ? "error" : ""}
              help={errors.isActive?.message}
            >
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Select {...field} size="large">
                    <Option value={1}>Active</Option>
                    <Option value={0}>Inactive</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Button onClick={onCancel} size="large" className="px-8">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isSaving}
            className="px-8"
          >
            {isEditMode ? "Update Hotel" : "Create Hotel"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddEditHotel;
