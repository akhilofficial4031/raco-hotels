/* eslint-disable no-unused-vars */
import {
  DeleteOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Image,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Upload,
  message,
  type UploadFile,
} from "antd";
import React, { useState, useEffect } from "react";
import {
  Controller,
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
} from "react-hook-form";

import type { CreateAttractionPayload } from "../types/attraction";

const { TextArea } = Input;

// Helper function to generate action from text
const generateAction = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters except spaces
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .trim();
};

// Button form item component
interface ButtonFormItemProps {
  index: number;
  control: Control<CreateAttractionPayload>;
  textFieldName: string;
  typeFieldName: string;
  actionFieldName: string;
  onRemove: () => void;
  setValue: UseFormSetValue<CreateAttractionPayload>;
}

const ButtonFormItem = ({
  index,
  control,
  textFieldName,
  typeFieldName,
  actionFieldName,
  onRemove,
  setValue,
}: ButtonFormItemProps) => {
  const textValue = useWatch({ control, name: textFieldName as any });

  // Auto-generate action when text changes
  useEffect(() => {
    if (textValue) {
      const action = generateAction(textValue);
      setValue(actionFieldName as any, action);
    }
  }, [textValue, actionFieldName, setValue]);

  return (
    <Card className="mb-4" size="small">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Text" className="mb-0">
            <Controller
              name={textFieldName as any}
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter button text" />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={10}>
          <Form.Item label="Type" className="mb-0">
            <Controller
              name={typeFieldName as any}
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select type"
                  options={[
                    { label: "Primary", value: "primary" },
                    { label: "Secondary", value: "secondary" },
                  ]}
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={2}>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={onRemove}
          />
        </Col>
      </Row>
      {textValue && (
        <div className="text-sm text-gray-500 mt-2">
          Action: <code>{generateAction(textValue)}</code>
        </div>
      )}
      {/* Hidden field for action */}
      <Controller
        name={actionFieldName as any}
        control={control}
        render={() => null as any}
      />
    </Card>
  );
};

// Feature button form item component
interface FeatureButtonFormItemProps {
  control: Control<CreateAttractionPayload>;
  errors: any;
  setValue: UseFormSetValue<CreateAttractionPayload>;
}

const FeatureButtonFormItem = ({
  control,
  errors,
  setValue,
}: FeatureButtonFormItemProps) => {
  const textValue = useWatch({ control, name: "content.feature.button.text" });

  // Auto-generate action when text changes
  useEffect(() => {
    if (textValue) {
      const action = generateAction(textValue);
      setValue("content.feature.button.action", action);
    }
  }, [textValue, setValue]);

  return (
    <Card size="small" className="mb-4">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Button Text"
            validateStatus={errors?.feature?.button?.text ? "error" : ""}
            help={errors?.feature?.button?.text?.message}
          >
            <Controller
              name="content.feature.button.text"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter button text" />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Button Type"
            validateStatus={errors?.feature?.button?.type ? "error" : ""}
            help={errors?.feature?.button?.type?.message}
          >
            <Controller
              name="content.feature.button.type"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select type"
                  options={[
                    { label: "Primary", value: "primary" },
                    { label: "Secondary", value: "secondary" },
                  ]}
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
      {textValue && (
        <div className="text-sm text-gray-500 mb-2">
          Action: <code>{generateAction(textValue)}</code>
        </div>
      )}
      {/* Hidden field for action */}
      <Controller
        name="content.feature.button.action"
        control={control}
        render={() => null as any}
      />
    </Card>
  );
};

// Reusable image upload field component
interface ImageUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  onPreview: (file: UploadFile) => Promise<void>;
  beforeUpload: (file: File) => boolean;
  getBase64: (file: File) => Promise<string>;
  imageBaseUrl: string;
}

const ImageUploadField = ({
  value,
  onChange,
  onPreview,
  beforeUpload,
  getBase64,
  imageBaseUrl,
}: ImageUploadFieldProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  return (
    <div className="space-y-4">
      <Upload
        accept="image/jpeg,image/png,image/webp"
        listType="picture-card"
        fileList={fileList}
        beforeUpload={beforeUpload}
        onPreview={onPreview}
        onChange={async ({ fileList: newFileList }) => {
          setFileList(newFileList);
          if (newFileList.length > 0 && newFileList[0].originFileObj) {
            const base64 = await getBase64(
              newFileList[0].originFileObj as File,
            );
            onChange(base64);
          } else {
            onChange("");
          }
        }}
        maxCount={1}
      >
        {fileList.length === 0 && (
          <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        )}
      </Upload>
      <div className="text-sm text-gray-500">
        • Supported formats: JPEG, PNG, WebP
        <br />• Maximum file size: 10MB
      </div>
      {value && !fileList.length && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">Current image:</p>
          <Image
            src={`${imageBaseUrl}/${value.replace("r2://", "")}`}
            alt="Current"
            className="max-w-xs rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

interface AttractionContentFormProps {
  control: Control<CreateAttractionPayload>;
  errors: FieldErrors<CreateAttractionPayload>;
  setValue: UseFormSetValue<CreateAttractionPayload>;
}

const AttractionContentForm = ({
  control,
  errors,
  setValue,
}: AttractionContentFormProps) => {
  const imageBaseUrl = import.meta.env.VITE_BUCKET_URL;
  const [previewImage, setPreviewImage] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);

  // Field arrays for dynamic lists
  const marqueeTextsArray = useFieldArray({
    control,
    name: "content.marqueeTexts" as any,
  });

  const aboutSubtextArray = useFieldArray({
    control,
    name: "content.aboutSection.subtext" as any,
  });

  const aboutButtonsArray = useFieldArray({
    control,
    name: "content.aboutSection.buttons",
  });

  const aboutImagesArray = useFieldArray({
    control,
    name: "content.aboutSection.images" as any,
  });

  const carouselImagesArray = useFieldArray({
    control,
    name: "content.carouselSection.images" as any,
  });

  const featureImagesArray = useFieldArray({
    control,
    name: "content.feature.images" as any,
  });

  const reviewsArray = useFieldArray({
    control,
    name: "content.reviews.items",
  });

  const galleryImagesArray = useFieldArray({
    control,
    name: "content.gallery.images" as any,
  });

  // Watch actual values for image arrays (to display them)
  const aboutImages =
    useWatch({ control, name: "content.aboutSection.images" }) || [];
  const carouselImages =
    useWatch({ control, name: "content.carouselSection.images" }) || [];
  const featureImages =
    useWatch({ control, name: "content.feature.images" }) || [];
  const galleryImages =
    useWatch({ control, name: "content.gallery.images" }) || [];

  const contentErrors = errors.content as any;

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

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card
        title={<span className="text-lg font-semibold">Hero Section</span>}
        className="shadow-sm border-gray-200"
      >
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item
              label="Title"
              validateStatus={contentErrors?.hero?.title ? "error" : ""}
              help={contentErrors?.hero?.title?.message}
              required
            >
              <Controller
                name="content.hero.title"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Subtitle"
              validateStatus={contentErrors?.hero?.subtitle ? "error" : ""}
              help={contentErrors?.hero?.subtitle?.message}
              required
            >
              <Controller
                name="content.hero.subtitle"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Hero Image"
              validateStatus={contentErrors?.hero?.imageUrl ? "error" : ""}
              help={contentErrors?.hero?.imageUrl?.message}
              required
            >
              <Controller
                name="content.hero.imageUrl"
                control={control}
                render={({ field }) => (
                  <ImageUploadField
                    value={field.value}
                    onChange={field.onChange}
                    onPreview={handlePreview}
                    beforeUpload={beforeUpload}
                    getBase64={getBase64}
                    imageBaseUrl={imageBaseUrl}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Marquee Texts */}
      <Card
        title={<span className="text-lg font-semibold">Marquee Texts</span>}
        className="shadow-sm border-gray-200"
      >
        {marqueeTextsArray.fields.map((field, index) => (
          <Space key={field.id} className="mb-4 w-full" align="baseline">
            <Form.Item className="flex-1 mb-0">
              <Controller
                name={`content.marqueeTexts.${index}`}
                control={control}
                render={({ field }) => (
                  <Input size="large" placeholder="Marquee text" {...field} />
                )}
              />
            </Form.Item>
            <Button
              type="text"
              danger
              icon={<MinusCircleOutlined />}
              onClick={() => marqueeTextsArray.remove(index)}
            />
          </Space>
        ))}
        <Button
          type="dashed"
          onClick={() => marqueeTextsArray.append("")}
          icon={<PlusOutlined />}
          className="w-full"
        >
          Add Marquee Text
        </Button>
      </Card>

      {/* About Section */}
      <Card
        title={<span className="text-lg font-semibold">About Section</span>}
        className="shadow-sm border-gray-200"
      >
        <Row gutter={[24, 16]}>
          <Col span={24}>
            <Form.Item
              label="Title"
              validateStatus={contentErrors?.aboutSection?.title ? "error" : ""}
              help={contentErrors?.aboutSection?.title?.message}
              required
            >
              <Controller
                name="content.aboutSection.title"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Description"
              validateStatus={
                contentErrors?.aboutSection?.description ? "error" : ""
              }
              help={contentErrors?.aboutSection?.description?.message}
              required
            >
              <Controller
                name="content.aboutSection.description"
                control={control}
                render={({ field }) => (
                  <TextArea rows={4} size="large" {...field} />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Subtext</Divider>
        {aboutSubtextArray.fields.map((field, index) => (
          <Space key={field.id} className="mb-4 w-full" align="baseline">
            <Form.Item className="flex-1 mb-0">
              <Controller
                name={`content.aboutSection.subtext.${index}`}
                control={control}
                render={({ field }) => (
                  <Input size="large" placeholder="Subtext" {...field} />
                )}
              />
            </Form.Item>
            <Button
              type="text"
              danger
              icon={<MinusCircleOutlined />}
              onClick={() => aboutSubtextArray.remove(index)}
            />
          </Space>
        ))}
        <Button
          type="dashed"
          onClick={() => aboutSubtextArray.append("")}
          icon={<PlusOutlined />}
          className="w-full mb-4"
        >
          Add Subtext
        </Button>

        <Divider orientation="left">Buttons</Divider>
        {aboutButtonsArray.fields.map((field, index) => (
          <ButtonFormItem
            key={field.id}
            index={index}
            control={control}
            textFieldName={`content.aboutSection.buttons.${index}.text`}
            typeFieldName={`content.aboutSection.buttons.${index}.type`}
            actionFieldName={`content.aboutSection.buttons.${index}.action`}
            onRemove={() => aboutButtonsArray.remove(index)}
            setValue={setValue}
          />
        ))}
        <Button
          type="dashed"
          onClick={() =>
            aboutButtonsArray.append({ text: "", type: "primary", action: "" })
          }
          icon={<PlusOutlined />}
          className="w-full mb-4"
        >
          Add Button
        </Button>

        <Divider orientation="left">Images</Divider>
        <Form.Item label="About Section Images">
          <Upload
            accept="image/jpeg,image/png,image/webp"
            listType="picture-card"
            multiple
            beforeUpload={beforeUpload}
            onPreview={handlePreview}
            onChange={async ({ fileList }) => {
              const base64Images: string[] = [];
              for (const file of fileList) {
                if (file.originFileObj) {
                  const base64 = await getBase64(file.originFileObj as File);
                  base64Images.push(base64);
                }
              }
              aboutImagesArray.remove();
              base64Images.forEach((img) => aboutImagesArray.append(img));
            }}
          >
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
          <div className="text-sm text-gray-500 mt-2">
            • Supported formats: JPEG, PNG, WebP
            <br />
            • Maximum file size: 10MB per image
            <br />• Select multiple images at once
          </div>
          {aboutImagesArray.fields.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">
                Current images ({aboutImagesArray.fields.length}):
              </p>
              <div className="grid grid-cols-4 gap-4">
                {aboutImagesArray.fields.map((field, index) => {
                  const imageUrl = aboutImages[index];
                  if (!imageUrl) return null;

                  const displayUrl = imageUrl.startsWith("data:")
                    ? imageUrl
                    : `${imageBaseUrl}/${imageUrl.replace("r2://", "")}`;

                  return (
                    <div key={field.id} className="relative">
                      <Image
                        src={displayUrl}
                        alt={`About ${index + 1}`}
                        className="rounded-lg"
                      />
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => aboutImagesArray.remove(index)}
                        className="absolute top-0 right-0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Form.Item>
      </Card>

      {/* Carousel Section */}
      <Card
        title={<span className="text-lg font-semibold">Carousel Section</span>}
        className="shadow-sm border-gray-200"
      >
        <Row gutter={[24, 16]}>
          <Col span={8}>
            <Form.Item
              label="Tag"
              validateStatus={
                contentErrors?.carouselSection?.tag ? "error" : ""
              }
              help={contentErrors?.carouselSection?.tag?.message}
              required
            >
              <Controller
                name="content.carouselSection.tag"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Title"
              validateStatus={
                contentErrors?.carouselSection?.title ? "error" : ""
              }
              help={contentErrors?.carouselSection?.title?.message}
              required
            >
              <Controller
                name="content.carouselSection.title"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Subtitle"
              validateStatus={
                contentErrors?.carouselSection?.subtitle ? "error" : ""
              }
              help={contentErrors?.carouselSection?.subtitle?.message}
              required
            >
              <Controller
                name="content.carouselSection.subtitle"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Carousel Images</Divider>
        <Form.Item label="Carousel Images">
          <Upload
            accept="image/jpeg,image/png,image/webp"
            listType="picture-card"
            multiple
            beforeUpload={beforeUpload}
            onPreview={handlePreview}
            onChange={async ({ fileList }) => {
              const base64Images: string[] = [];
              for (const file of fileList) {
                if (file.originFileObj) {
                  const base64 = await getBase64(file.originFileObj as File);
                  base64Images.push(base64);
                }
              }
              carouselImagesArray.remove();
              base64Images.forEach((img) => carouselImagesArray.append(img));
            }}
          >
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
          <div className="text-sm text-gray-500 mt-2">
            • Supported formats: JPEG, PNG, WebP
            <br />
            • Maximum file size: 10MB per image
            <br />• Select multiple images at once
          </div>
          {carouselImagesArray.fields.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">
                Current images ({carouselImagesArray.fields.length}):
              </p>
              <div className="grid grid-cols-4 gap-4">
                {carouselImagesArray.fields.map((field, index) => {
                  const imageUrl = carouselImages[index];
                  if (!imageUrl) return null;

                  const displayUrl = imageUrl.startsWith("data:")
                    ? imageUrl
                    : `${imageBaseUrl}/${imageUrl.replace("r2://", "")}`;

                  return (
                    <div key={field.id} className="relative">
                      <Image
                        src={displayUrl}
                        alt={`Carousel ${index + 1}`}
                        className="rounded-lg"
                      />
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => carouselImagesArray.remove(index)}
                        className="absolute top-0 right-0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Form.Item>
      </Card>

      {/* Feature Section */}
      <Card
        title={<span className="text-lg font-semibold">Feature Section</span>}
        className="shadow-sm border-gray-200"
      >
        <Row gutter={[24, 16]}>
          <Col span={8}>
            <Form.Item
              label="Tag"
              validateStatus={contentErrors?.feature?.tag ? "error" : ""}
              help={contentErrors?.feature?.tag?.message}
              required
            >
              <Controller
                name="content.feature.tag"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Title"
              validateStatus={contentErrors?.feature?.title ? "error" : ""}
              help={contentErrors?.feature?.title?.message}
              required
            >
              <Controller
                name="content.feature.title"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Subtitle"
              validateStatus={contentErrors?.feature?.subtitle ? "error" : ""}
              help={contentErrors?.feature?.subtitle?.message}
              required
            >
              <Controller
                name="content.feature.subtitle"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Feature Button</Divider>
        <FeatureButtonFormItem
          control={control}
          errors={contentErrors}
          setValue={setValue}
        />

        <Divider orientation="left">Feature Images</Divider>
        <Form.Item label="Feature Images">
          <Upload
            accept="image/jpeg,image/png,image/webp"
            listType="picture-card"
            multiple
            beforeUpload={beforeUpload}
            onPreview={handlePreview}
            onChange={async ({ fileList }) => {
              const base64Images: string[] = [];
              for (const file of fileList) {
                if (file.originFileObj) {
                  const base64 = await getBase64(file.originFileObj as File);
                  base64Images.push(base64);
                }
              }
              featureImagesArray.remove();
              base64Images.forEach((img) => featureImagesArray.append(img));
            }}
          >
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
          <div className="text-sm text-gray-500 mt-2">
            • Supported formats: JPEG, PNG, WebP
            <br />
            • Maximum file size: 10MB per image
            <br />• Select multiple images at once
          </div>
          {featureImagesArray.fields.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">
                Current images ({featureImagesArray.fields.length}):
              </p>
              <div className="grid grid-cols-4 gap-4">
                {featureImagesArray.fields.map((field, index) => {
                  const imageUrl = featureImages[index];
                  if (!imageUrl) return null;

                  const displayUrl = imageUrl.startsWith("data:")
                    ? imageUrl
                    : `${imageBaseUrl}/${imageUrl.replace("r2://", "")}`;

                  return (
                    <div key={field.id} className="relative">
                      <Image
                        src={displayUrl}
                        alt={`Feature ${index + 1}`}
                        className="rounded-lg"
                      />
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => featureImagesArray.remove(index)}
                        className="absolute top-0 right-0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Form.Item>
      </Card>

      {/* Reviews Section */}
      <Card
        title={<span className="text-lg font-semibold">Reviews Section</span>}
        className="shadow-sm border-gray-200"
      >
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item
              label="Tag"
              validateStatus={contentErrors?.reviews?.tag ? "error" : ""}
              help={contentErrors?.reviews?.tag?.message}
              required
            >
              <Controller
                name="content.reviews.tag"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Title"
              validateStatus={contentErrors?.reviews?.title ? "error" : ""}
              help={contentErrors?.reviews?.title?.message}
              required
            >
              <Controller
                name="content.reviews.title"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Review Items</Divider>
        {reviewsArray.fields.map((field, index) => (
          <Card key={field.id} className="mb-4" size="small">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Name" className="mb-0">
                  <Controller
                    name={`content.reviews.items.${index}.name`}
                    control={control}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Review" className="mb-0">
                  <Controller
                    name={`content.reviews.items.${index}.review`}
                    control={control}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label="Stars" className="mb-0">
                  <Controller
                    name={`content.reviews.items.${index}.stars`}
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        min={1}
                        max={5}
                        className="w-full"
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => reviewsArray.remove(index)}
                />
              </Col>
            </Row>
          </Card>
        ))}
        <Button
          type="dashed"
          onClick={() =>
            reviewsArray.append({ name: "", review: "", stars: 5 })
          }
          icon={<PlusOutlined />}
          className="w-full"
        >
          Add Review
        </Button>
      </Card>

      {/* Gallery Section */}
      <Card
        title={<span className="text-lg font-semibold">Gallery Section</span>}
        className="shadow-sm border-gray-200"
      >
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item
              label="Tag"
              validateStatus={contentErrors?.gallery?.tag ? "error" : ""}
              help={contentErrors?.gallery?.tag?.message}
              required
            >
              <Controller
                name="content.gallery.tag"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Title"
              validateStatus={contentErrors?.gallery?.title ? "error" : ""}
              help={contentErrors?.gallery?.title?.message}
              required
            >
              <Controller
                name="content.gallery.title"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Gallery Images</Divider>
        <Form.Item label="Gallery Images">
          <Upload
            accept="image/jpeg,image/png,image/webp"
            listType="picture-card"
            multiple
            beforeUpload={beforeUpload}
            onPreview={handlePreview}
            onChange={async ({ fileList }) => {
              const base64Images: string[] = [];
              for (const file of fileList) {
                if (file.originFileObj) {
                  const base64 = await getBase64(file.originFileObj as File);
                  base64Images.push(base64);
                }
              }
              galleryImagesArray.remove();
              base64Images.forEach((img) => galleryImagesArray.append(img));
            }}
          >
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
          <div className="text-sm text-gray-500 mt-2">
            • Supported formats: JPEG, PNG, WebP
            <br />
            • Maximum file size: 10MB per image
            <br />• Select multiple images at once
          </div>
          {galleryImagesArray.fields.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">
                Current images ({galleryImagesArray.fields.length}):
              </p>
              <div className="grid grid-cols-4 gap-4">
                {galleryImagesArray.fields.map((field, index) => {
                  const imageUrl = galleryImages[index];
                  if (!imageUrl) return null;

                  const displayUrl = imageUrl.startsWith("data:")
                    ? imageUrl
                    : `${imageBaseUrl}/${imageUrl.replace("r2://", "")}`;

                  return (
                    <div key={field.id} className="relative">
                      <Image
                        src={displayUrl}
                        alt={`Gallery ${index + 1}`}
                        className="rounded-lg"
                      />
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => galleryImagesArray.remove(index)}
                        className="absolute top-0 right-0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Form.Item>
      </Card>

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
  );
};

export default AttractionContentForm;
