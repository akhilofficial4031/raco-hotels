import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Upload,
  Image,
  message,
} from "antd";
import { useState } from "react";
import { Controller, useFieldArray, type Control } from "react-hook-form";

import { type CreateHotelFormPayload } from "../types/hotels";

import type { UploadFile } from "antd";

interface LocationInfoFormProps {
  control: Control<CreateHotelFormPayload>;
  errors: any;
}

const LocationInfoForm: React.FC<LocationInfoFormProps> = ({
  control,
  errors,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "locationInfo",
  });

  const addLocationInfo = () => {
    append({
      heading: "",
      subHeading: "",
      bulletPoints: [],
      description: "",
      images: [{ alt: "" }],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Location Information</h3>
        <Button
          type="dashed"
          onClick={addLocationInfo}
          icon={<PlusOutlined />}
          size="large"
        >
          Add Location Info
        </Button>
      </div>

      {fields.map((field, index) => (
        <Card
          key={field.id}
          size="small"
          title={`Location Info ${index + 1}`}
          extra={
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => remove(index)}
            />
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Heading"
              validateStatus={
                errors?.locationInfo?.[index]?.heading ? "error" : ""
              }
              help={errors?.locationInfo?.[index]?.heading?.message}
            >
              <Controller
                name={`locationInfo.${index}.heading`}
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>

            <Form.Item
              label="Sub Heading"
              validateStatus={
                errors?.locationInfo?.[index]?.subHeading ? "error" : ""
              }
              help={errors?.locationInfo?.[index]?.subHeading?.message}
            >
              <Controller
                name={`locationInfo.${index}.subHeading`}
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Description"
            validateStatus={
              errors?.locationInfo?.[index]?.description ? "error" : ""
            }
            help={errors?.locationInfo?.[index]?.description?.message}
          >
            <Controller
              name={`locationInfo.${index}.description`}
              control={control}
              render={({ field }) => <Input.TextArea rows={3} {...field} />}
            />
          </Form.Item>

          <BulletPointsForm control={control} locationIndex={index} />

          <ImagesForm control={control} locationIndex={index} />
        </Card>
      ))}
    </div>
  );
};

interface BulletPointsFormProps {
  control: Control<CreateHotelFormPayload>;
  locationIndex: number;
}

const BulletPointsForm: React.FC<BulletPointsFormProps> = ({
  control,
  locationIndex,
}) => {
  return (
    <>
      <Form.Item
        label="Bullet Points"
        help="Enter each bullet point on a new line."
      >
        <Controller
          name={`locationInfo.${locationIndex}.bulletPoints`}
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              value={
                Array.isArray(field.value)
                  ? field.value.join("\n")
                  : field.value || ""
              }
              onChange={(e) => {
                const value = e.target.value;
                // Convert newline-separated string back to array for form state
                const bulletPointsArray = value.split("\n");
                field.onChange(bulletPointsArray);
              }}
              rows={3}
              placeholder={`5 min to beach
Close to metro, with shops nearby
Free WiFi`}
              size="large"
            />
          )}
        />
      </Form.Item>
      <Divider />
    </>
  );
};

interface ImagesFormProps {
  control: Control<CreateHotelFormPayload>;
  locationIndex: number;
}

const ImagesForm: React.FC<ImagesFormProps> = ({ control, locationIndex }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `locationInfo.${locationIndex}.images`,
  });

  // State for each image upload
  const [fileLists, setFileLists] = useState<Record<number, UploadFile[]>>({});
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const imageBaseUrl = import.meta.env.VITE_BUCKET_URL;

  const handleUploadChange = (index: number, info: UploadFile[]) => {
    setFileLists((prev) => ({ ...prev, [index]: info }));
  };

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

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">Images</label>
        <Button
          type="dashed"
          size="small"
          onClick={() => append({ alt: "" })}
          icon={<PlusOutlined />}
        >
          Add Image
        </Button>
      </div>

      {fields.map((field, index) => (
        <Card key={field.id} size="small">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Image {index + 1}</span>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => {
                  remove(index);
                  // Clean up file list state
                  setFileLists((prev) => {
                    const newState = { ...prev };
                    delete newState[index];
                    return newState;
                  });
                }}
              />
            </div>

            {/* Show existing image if in edit mode */}
            {field.url && (
              <div className="mb-2">
                <span className="text-xs text-gray-500 block mb-1">
                  Current Image:
                </span>
                <Image
                  src={`${imageBaseUrl}/${field.url.replace("r2://", "")}`}
                  alt={field.alt || "Location image"}
                  className="w-20 h-20 object-cover rounded"
                  preview={{
                    mask: <EyeOutlined className="text-white" />,
                  }}
                />
              </div>
            )}

            {/* File Upload */}
            <div>
              <span className="text-xs text-gray-500 block mb-1">
                {field.url ? "Replace with new image:" : "Upload image:"}
              </span>
              <Controller
                name={`locationInfo.${locationIndex}.images.${index}.file`}
                control={control}
                render={({ field: fileField }) => (
                  <Upload
                    accept="image/jpeg,image/png,image/webp"
                    listType="picture-card"
                    fileList={fileLists[index] || []}
                    onChange={(info) => {
                      handleUploadChange(index, info.fileList);
                      // Update the form field
                      const file =
                        info.fileList.length > 0 &&
                        info.fileList[0].originFileObj
                          ? info.fileList[0].originFileObj
                          : undefined;
                      fileField.onChange(file);
                    }}
                    onPreview={handlePreview}
                    beforeUpload={beforeUpload}
                    maxCount={1}
                  >
                    {(!fileLists[index] || fileLists[index].length === 0) && (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
                )}
              />
            </div>

            {/* Alt Text */}
            <Controller
              name={`locationInfo.${locationIndex}.images.${index}.alt`}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Alt text for accessibility (required)"
                  size="small"
                />
              )}
            />
          </div>
        </Card>
      ))}

      {/* Image Preview Modal */}
      <Image
        style={{ display: "none" }}
        src={previewImage}
        preview={{
          visible: previewVisible,
          onVisibleChange: (visible) => setPreviewVisible(visible),
        }}
      />

      <div className="text-xs text-gray-500">
        • Supported formats: JPEG, PNG, WebP
        <br />• Maximum file size: 10MB per image
      </div>
    </div>
  );
};

export default LocationInfoForm;
