/* eslint-disable no-unused-vars */
import {
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  InputNumber,
  Switch,
  Upload,
  Image,
  message,
  Modal,
} from "antd";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";

import { type Addon } from "@shared/models/addon";
import { type Amenity } from "@shared/models/amenity";
import { type Hotel } from "@shared/models/hotels";
import {
  type RoomTypeWithRelations,
  type CreateRoomTypePayload,
  type RoomTypeFormData,
} from "@shared/models/room-type";

// Simplified interface for image display state
interface ImageDisplayData {
  id: number;
  url: string;
  alt: string;
  sortOrder: number;
}
import { fetcher, mutationFetcher } from "../../utils/swrFetcher";

import type { UploadFile, UploadProps } from "antd";

const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

const roomTypeSchema = z
  .object({
    hotelId: z.number().min(1, { message: "Hotel is required" }).optional(),
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().optional(),
    baseOccupancy: z
      .number()
      .min(1, { message: "Base occupancy must be at least 1" }),
    maxOccupancy: z
      .number()
      .min(1, { message: "Max occupancy must be at least 1" }),
    basePriceCents: z
      .number()
      .min(0, { message: "Base price must be non-negative" }),
    currencyCode: z.string().default("INR"),
    sizeSqft: z.number().min(0).optional(),
    bedType: z.string().optional(),
    smokingAllowed: z.number().min(0).max(1),
    totalRooms: z
      .number()
      .min(1, { message: "Total rooms must be at least 1" }),
    isActive: z.number().min(0).max(1),
    amenityIds: z.array(z.number()).optional(),
    addons: z
      .array(
        z.object({
          id: z.number().optional(),
          addonId: z.number().min(1, { message: "Addon is required" }),
          priceCents: z
            .number()
            .min(0, { message: "Price must be non-negative" }),
        }),
      )
      .optional(),
  })
  .refine((data) => data.maxOccupancy >= data.baseOccupancy, {
    message: "Max occupancy must be greater than or equal to base occupancy",
    path: ["maxOccupancy"],
  })
  .refine((data) => data.hotelId !== undefined, {
    message: "Hotel is required",
    path: ["hotelId"],
  });

interface AddEditRoomTypeProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateRoomTypePayload,
    images?: File[],
    replaceImages?: boolean,
  ) => void;
  roomType: RoomTypeWithRelations | null;
  isSaving: boolean;
}

const AddEditRoomType: React.FC<AddEditRoomTypeProps> = ({
  open,
  onClose,
  onSubmit,
  roomType,
  isSaving,
}) => {
  const isEditMode = !!roomType;
  const [priceInRupees, setPriceInRupees] = useState<number>(0);

  // Image upload state
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ImageDisplayData[]>([]);
  const [replaceImages, setReplaceImages] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [imageValidationError, setImageValidationError] = useState<string>("");

  const imageBaseUrl = import.meta.env.VITE_BUCKET_URL;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RoomTypeFormData>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: {
      hotelId: undefined,
      name: "",
      description: undefined,
      baseOccupancy: 1,
      maxOccupancy: 2,
      basePriceCents: 0,
      currencyCode: undefined,
      sizeSqft: undefined,
      bedType: undefined,
      smokingAllowed: 0,
      totalRooms: 1,
      isActive: 1,
      amenityIds: undefined,
      addons: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addons",
  });

  // Fetch hotels - SWR will cache this data automatically
  const { data: hotelsResponse } = useSWR(
    open ? "/hotels?limit=100" : null,
    fetcher<{ data: { hotels: Hotel[] } }>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 300000, // 5 minutes - prevents duplicate requests
    },
  );

  // Fetch amenities - SWR will cache this data automatically
  const { data: amenitiesResponse } = useSWR(
    open ? "/amenities?limit=100" : null,
    fetcher<{ data: { amenities: Amenity[] } }>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 300000, // 5 minutes - prevents duplicate requests
    },
  );

  // Fetch addons - SWR will cache this data automatically
  const { data: addonsResponse } = useSWR(
    open ? "/addons?limit=100" : null,
    fetcher<{ data: { addons: Addon[] } }>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 300000, // 5 minutes - prevents duplicate requests
    },
  );

  // Handle price conversion
  const handlePriceChange = (value: number | null) => {
    const priceInCents = value ? Math.round(value * 100) : 0;
    setValue("basePriceCents", priceInCents);
    setPriceInRupees(value || 0);
  };

  // Validate images function
  const validateImages = (): boolean => {
    const hasUploadedImages = uploadedImages.length > 0;
    const hasExistingImages = existingImages.length > 0;

    // For create mode: must have uploaded images
    if (!isEditMode && !hasUploadedImages) {
      setImageValidationError("At least one image is required");
      return false;
    }

    // For edit mode: check based on replace mode
    if (isEditMode) {
      if (replaceImages) {
        // If replacing images, must have uploaded images
        if (!hasUploadedImages) {
          setImageValidationError("At least one image is required");
          return false;
        }
      } else {
        // If not replacing, must have either existing or uploaded images
        if (!hasExistingImages && !hasUploadedImages) {
          setImageValidationError("At least one image is required");
          return false;
        }
      }
    }

    // Clear any previous error
    setImageValidationError("");
    return true;
  };

  useEffect(() => {
    if (roomType) {
      const amenityIds = roomType.amenities?.map((a) => a.amenityId) || [];
      const addons =
        roomType.addons?.map((a) => ({
          addonId: a.addonId,
          priceCents: a.priceCents,
        })) || [];
      const priceInRupees = roomType.basePriceCents / 100;

      // Set existing images if room type has images
      if (roomType.images) {
        const images = roomType.images.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt || "",
          sortOrder: img.sortOrder || 0,
        }));
        setExistingImages(images);
      }

      reset({
        hotelId: roomType.hotelId,
        name: roomType.name,
        description: roomType.description || undefined,
        baseOccupancy: roomType.baseOccupancy,
        maxOccupancy: roomType.maxOccupancy,
        basePriceCents: roomType.basePriceCents,
        currencyCode: roomType.currencyCode,
        sizeSqft: roomType.sizeSqft || undefined,
        bedType: roomType.bedType || undefined,
        smokingAllowed: roomType.smokingAllowed,
        totalRooms: roomType.totalRooms,
        isActive: roomType.isActive,
        amenityIds: amenityIds.length ? amenityIds : undefined,
        addons,
      });
      setPriceInRupees(priceInRupees);
      // Clear validation error when room type data is loaded
      setImageValidationError("");
    } else {
      // Reset image state for add mode
      setExistingImages([]);
      setUploadedImages([]);
      setFileList([]);
      setReplaceImages(false);
      setImageValidationError("");

      reset({
        hotelId: undefined,
        name: "",
        description: undefined,
        baseOccupancy: 1,
        maxOccupancy: 2,
        basePriceCents: 0,
        currencyCode: undefined,
        sizeSqft: undefined,
        bedType: undefined,
        smokingAllowed: 0,
        totalRooms: 1,
        isActive: 1,
        amenityIds: undefined,
        addons: [],
      });
      setPriceInRupees(0);
    }
  }, [roomType, reset]);

  // Additional effect to clear validation error when the form is opened
  useEffect(() => {
    if (open && !isEditMode) {
      // Clear any previous validation errors when opening form for new room type
      setImageValidationError("");
    }
  }, [open, isEditMode]);

  // Effect to validate images whenever uploadedImages or existingImages change
  useEffect(() => {
    if (!open) return; // Only validate when form is open

    const hasUploadedImages = uploadedImages.length > 0;
    const hasExistingImages = existingImages.length > 0;

    // Clear validation error when requirements are met
    if (
      hasUploadedImages ||
      (isEditMode && !replaceImages && hasExistingImages)
    ) {
      setImageValidationError("");
    }
  }, [
    uploadedImages,
    existingImages,
    replaceImages,
    isEditMode,
    open,
    imageValidationError,
  ]);

  const handleFormSubmit = (data: RoomTypeFormData) => {
    // Validate images before proceeding
    if (!validateImages()) {
      message.error("At least one image is required");
      return;
    }

    const payload: CreateRoomTypePayload = {
      hotelId: data.hotelId!, // We know it's defined due to validation
      name: data.name,
      description: data.description || undefined,
      baseOccupancy: data.baseOccupancy,
      maxOccupancy: data.maxOccupancy,
      basePriceCents: data.basePriceCents,
      currencyCode: data.currencyCode,
      sizeSqft: data.sizeSqft || undefined,
      bedType: data.bedType || undefined,
      smokingAllowed: data.smokingAllowed,
      totalRooms: data.totalRooms,
      isActive: data.isActive,
      amenityIds: data.amenityIds?.length ? data.amenityIds : undefined,
      addons: data.addons,
    };
    onSubmit(payload, uploadedImages, isEditMode ? replaceImages : undefined);
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

    // Always trigger validation after upload change
    setTimeout(() => {
      const hasUploadedImages = files.length > 0;
      const hasExistingImages = existingImages.length > 0;

      // For create mode: must have uploaded images
      if (!isEditMode && !hasUploadedImages) {
        setImageValidationError("At least one image is required");
        return;
      }

      // For edit mode: check based on replace mode
      if (isEditMode) {
        if (replaceImages) {
          // If replacing images, must have uploaded images
          if (!hasUploadedImages) {
            setImageValidationError("At least one image is required");
            return;
          }
        } else {
          // If not replacing, must have either existing or uploaded images
          if (!hasExistingImages && !hasUploadedImages) {
            setImageValidationError("At least one image is required");
            return;
          }
        }
      }

      // Clear any previous error
      setImageValidationError("");
    }, 0);
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
    confirm({
      title: "Are you sure you want to delete this image?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      onOk: async () => {
        try {
          await mutationFetcher(`/room-types/images/${imageId}`, {
            arg: { method: "DELETE" },
          });
          message.success("Image deleted successfully");
          const newImages = existingImages.filter((img) => img.id !== imageId);
          setExistingImages(newImages);

          // Trigger validation if no images left
          if (newImages.length === 0 && uploadedImages.length === 0) {
            setImageValidationError("At least one image is required");
          }
        } catch (_error) {
          message.error("Failed to delete image");
        }
      },
    });
  };

  return (
    <Drawer
      title={isEditMode ? "Edit Room Type" : "Add Room Type"}
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
          label="Hotel"
          required
          validateStatus={errors.hotelId ? "error" : ""}
          help={errors.hotelId?.message}
        >
          <Controller
            name="hotelId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select a hotel"
                showSearch
                optionFilterProp="children"
              >
                {hotelsResponse?.data?.hotels?.map((hotel) => (
                  <Option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>

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
              <Input {...field} placeholder="e.g., Deluxe King Room" />
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
                rows={3}
                placeholder="Room type description..."
              />
            )}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Base Occupancy"
            required
            validateStatus={errors.baseOccupancy ? "error" : ""}
            help={errors.baseOccupancy?.message}
          >
            <Controller
              name="baseOccupancy"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={1}
                  max={10}
                  className="!w-full"
                  placeholder="1"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Max Occupancy"
            required
            validateStatus={errors.maxOccupancy ? "error" : ""}
            help={errors.maxOccupancy?.message}
          >
            <Controller
              name="maxOccupancy"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={1}
                  max={10}
                  className="!w-full"
                  placeholder="2"
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Base Price (INR)"
          required
          validateStatus={errors.basePriceCents ? "error" : ""}
          help={errors.basePriceCents?.message}
        >
          <InputNumber
            value={priceInRupees}
            onChange={handlePriceChange}
            min={0}
            precision={2}
            className="w-full"
            placeholder="1500.00"
            addonBefore="₹"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Size (sq ft)"
            validateStatus={errors.sizeSqft ? "error" : ""}
            help={errors.sizeSqft?.message}
          >
            <Controller
              name="sizeSqft"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  className="!w-full"
                  placeholder="350"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Bed Type"
            validateStatus={errors.bedType ? "error" : ""}
            help={errors.bedType?.message}
          >
            <Controller
              name="bedType"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="Select bed type" allowClear>
                  <Option value="Single">Single</Option>
                  <Option value="Double">Double</Option>
                  <Option value="Queen">Queen</Option>
                  <Option value="King">King</Option>
                  <Option value="Twin">Twin</Option>
                  <Option value="Sofa Bed">Sofa Bed</Option>
                </Select>
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Total Rooms"
          required
          validateStatus={errors.totalRooms ? "error" : ""}
          help={errors.totalRooms?.message}
        >
          <Controller
            name="totalRooms"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={1}
                className="!w-full"
                placeholder="10"
              />
            )}
          />
        </Form.Item>

        <Form.Item label="Amenities">
          <Controller
            name="amenityIds"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                mode="multiple"
                placeholder="Select amenities"
                showSearch
                optionFilterProp="children"
              >
                {amenitiesResponse?.data?.amenities?.map((amenity) => (
                  <Option key={amenity.id} value={amenity.id}>
                    {amenity.name}
                  </Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>
        <div>
          <div className="flex items-center justify-between space-x-2 mb-2">
            <p>Addons</p>
            <Button
              type="dashed"
              size="small"
              onClick={() => append({ addonId: 0, priceCents: 0 })}
            >
              + Add Addon
            </Button>
          </div>
          <Form.Item>
            {fields.map((field, index) => (
              <div key={field.id} className="!flex !items-center gap-2 !mb-2">
                <Form.Item
                  className="flex-grow !mb-0"
                  validateStatus={
                    errors.addons?.[index]?.addonId ? "error" : ""
                  }
                  help={errors.addons?.[index]?.addonId?.message}
                >
                  <Controller
                    name={`addons.${index}.addonId`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value || null}
                        placeholder="Select an addon"
                        showSearch
                        optionFilterProp="children"
                      >
                        {addonsResponse?.data?.addons?.map((addon) => (
                          <Option key={addon.id} value={addon.id}>
                            {addon.name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  />
                </Form.Item>
                <Form.Item
                  className="!mb-0"
                  validateStatus={
                    errors.addons?.[index]?.priceCents ? "error" : ""
                  }
                  help={errors.addons?.[index]?.priceCents?.message}
                >
                  <Controller
                    name={`addons.${index}.priceCents`}
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        addonBefore="₹"
                        placeholder="Price"
                        min={0}
                        onChange={(value) =>
                          field.onChange(
                            value ? Math.round((value || 0) * 100) : 0,
                          )
                        }
                        value={field.value ? field.value / 100 : 0}
                      />
                    )}
                  />
                </Form.Item>
                <Button
                  type="dashed"
                  danger
                  onClick={() => remove(index)}
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </div>
            ))}
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Smoking Allowed">
            <Controller
              name="smokingAllowed"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value === 1}
                  onChange={(checked) => field.onChange(checked ? 1 : 0)}
                />
              )}
            />
          </Form.Item>

          <Form.Item label="Active">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value === 1}
                  onChange={(checked) => field.onChange(checked ? 1 : 0)}
                />
              )}
            />
          </Form.Item>
        </div>

        {/* Room Type Images */}
        <div className="space-y-4">
          <h4 className="font-medium">
            <span className="text-red-500">*</span> Room Type Images
          </h4>

          {/* Validation Error Message */}
          {imageValidationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm text-red-600">
                <strong>⚠️ {imageValidationError}</strong>
              </div>
            </div>
          )}

          {/* Existing Images (shown in edit mode when not replacing) */}
          {isEditMode && existingImages.length > 0 && !replaceImages && (
            <div>
              <h5 className="font-medium mb-3 text-sm">Current Images</h5>
              <div className="flex flex-wrap gap-4">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <Image
                      src={`${imageBaseUrl}/${image.url.replace("r2://", "")}`}
                      alt={image.alt || "Room type image"}
                      className="w-full !h-20 object-cover rounded-lg"
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
                      onClick={() => removeExistingImage(image.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Replace Images Toggle (only in edit mode) */}
          {isEditMode && existingImages.length > 0 && (
            <div className="mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceImages}
                  onChange={(e) => {
                    setReplaceImages(e.target.checked);
                    // Validate images when toggle changes
                    if (e.target.checked && uploadedImages.length === 0) {
                      setImageValidationError("At least one image is required");
                    } else {
                      setImageValidationError("");
                    }
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Replace all existing images
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Check this to replace all current images with new uploads
              </p>
            </div>
          )}

          {/* Upload New Images */}
          <div>
            <h5 className="font-medium mb-3 text-sm">
              {isEditMode && !replaceImages
                ? "Add New Images"
                : "Upload Images"}
            </h5>
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
      </Form>
    </Drawer>
  );
};

export default AddEditRoomType;
