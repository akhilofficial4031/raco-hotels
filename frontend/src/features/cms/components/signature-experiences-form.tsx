import {
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
  Row,
  Select,
  Upload,
  message,
} from "antd";
import { useState } from "react";
import {
  Controller,
  type Control,
  type FieldErrors,
  useFieldArray,
} from "react-hook-form";

import type { HomePageContent } from "../types";

import type { UploadFile } from "antd";

const { TextArea } = Input;
const { Option } = Select;

interface SignatureExperiencesFormProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

function SignatureExperiencesForm({
  control,
  errors,
}: SignatureExperiencesFormProps) {
  const [badgeFileList, setBadgeFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);

  const signatureExperiencesErrors = errors.signatureExperiences as any;

  const {
    fields: buttonFields,
    append: appendButton,
    remove: removeButton,
  } = useFieldArray({
    control,
    name: "signatureExperiences.club.buttons",
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "signatureExperiences.images",
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
    return false;
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
    <Card
      title={
        <span className="text-lg font-semibold">
          Signature Experiences - Club 19
        </span>
      }
      className="shadow-sm border-gray-200"
    >
      <Row gutter={[24, 16]}>
        <Col span={24}>
          <Form.Item
            label="Section Tag"
            validateStatus={
              signatureExperiencesErrors?.sectionTag ? "error" : ""
            }
            help={signatureExperiencesErrors?.sectionTag?.message}
          >
            <Controller
              name="signatureExperiences.sectionTag"
              control={control}
              render={({ field }) => <Input size="large" {...field} />}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Title"
            validateStatus={signatureExperiencesErrors?.title ? "error" : ""}
            help={signatureExperiencesErrors?.title?.message}
          >
            <Controller
              name="signatureExperiences.title"
              control={control}
              render={({ field }) => <Input size="large" {...field} />}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Description"
            validateStatus={
              signatureExperiencesErrors?.description ? "error" : ""
            }
            help={signatureExperiencesErrors?.description?.message}
          >
            <Controller
              name="signatureExperiences.description"
              control={control}
              render={({ field }) => (
                <TextArea rows={4} size="large" {...field} />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Club Information</Divider>

      <Row gutter={[24, 16]}>
        <Col span={12}>
          <Form.Item
            label="Club Name"
            validateStatus={
              signatureExperiencesErrors?.club?.name ? "error" : ""
            }
            help={signatureExperiencesErrors?.club?.name?.message}
          >
            <Controller
              name="signatureExperiences.club.name"
              control={control}
              render={({ field }) => <Input size="large" {...field} />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Club Tagline"
            validateStatus={
              signatureExperiencesErrors?.club?.tagline ? "error" : ""
            }
            help={signatureExperiencesErrors?.club?.tagline?.message}
          >
            <Controller
              name="signatureExperiences.club.tagline"
              control={control}
              render={({ field }) => <Input size="large" {...field} />}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Club Title"
            validateStatus={
              signatureExperiencesErrors?.club?.title ? "error" : ""
            }
            help={signatureExperiencesErrors?.club?.title?.message}
          >
            <Controller
              name="signatureExperiences.club.title"
              control={control}
              render={({ field }) => <Input size="large" {...field} />}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Club Description"
            validateStatus={
              signatureExperiencesErrors?.club?.description ? "error" : ""
            }
            help={signatureExperiencesErrors?.club?.description?.message}
          >
            <Controller
              name="signatureExperiences.club.description"
              control={control}
              render={({ field }) => (
                <TextArea rows={4} size="large" {...field} />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Club Buttons</Divider>

      {buttonFields.map((field, index) => (
        <Row key={field.id} gutter={[16, 16]} className="mb-4">
          <Col span={10}>
            <Form.Item
              label="Button Text"
              validateStatus={
                signatureExperiencesErrors?.club?.buttons?.[index]?.text
                  ? "error"
                  : ""
              }
              help={
                signatureExperiencesErrors?.club?.buttons?.[index]?.text
                  ?.message
              }
            >
              <Controller
                name={`signatureExperiences.club.buttons.${index}.text`}
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Button Type"
              validateStatus={
                signatureExperiencesErrors?.club?.buttons?.[index]?.type
                  ? "error"
                  : ""
              }
              help={
                signatureExperiencesErrors?.club?.buttons?.[index]?.type
                  ?.message
              }
            >
              <Controller
                name={`signatureExperiences.club.buttons.${index}.type`}
                control={control}
                render={({ field }) => (
                  <Select size="large" {...field}>
                    <Option value="primary">Primary</Option>
                    <Option value="secondary">Secondary</Option>
                  </Select>
                )}
              />
            </Form.Item>
          </Col>
          <Col span={2} className="flex items-end">
            <Button
              type="text"
              danger
              icon={<MinusCircleOutlined />}
              onClick={() => removeButton(index)}
            />
          </Col>
        </Row>
      ))}

      <Form.Item>
        <Button
          type="dashed"
          onClick={() => appendButton({ text: "", type: "primary" })}
          block
          icon={<PlusOutlined />}
        >
          Add Button
        </Button>
      </Form.Item>

      <Divider orientation="left">Experience Images</Divider>

      <div className="space-y-4">
        {imageFields.map((field, index) => {
          const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);

          return (
            <Card key={field.id} size="small" className="bg-gray-50">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Image #{index + 1}</h4>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<MinusCircleOutlined />}
                      onClick={() => removeImage(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Image"
                    validateStatus={
                      signatureExperiencesErrors?.images?.[index]?.src
                        ? "error"
                        : ""
                    }
                    help={
                      signatureExperiencesErrors?.images?.[index]?.src?.message
                    }
                  >
                    <Controller
                      name={`signatureExperiences.images.${index}.src`}
                      control={control}
                      render={({ field: imageField }) => (
                        <div className="space-y-4">
                          <Upload
                            accept="image/jpeg,image/png,image/webp"
                            listType="picture-card"
                            fileList={imageFileList}
                            beforeUpload={beforeUpload}
                            onPreview={handlePreview}
                            onChange={async ({ fileList: newFileList }) => {
                              setImageFileList(newFileList);
                              if (
                                newFileList.length > 0 &&
                                newFileList[0].originFileObj
                              ) {
                                const base64 = await getBase64(
                                  newFileList[0].originFileObj as File,
                                );
                                imageField.onChange(base64);
                              } else {
                                imageField.onChange("");
                              }
                            }}
                            maxCount={1}
                          >
                            {imageFileList.length === 0 && (
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
                          {imageField.value && !imageFileList.length && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600 mb-2">
                                Current image:
                              </p>
                              <Image
                                src={imageField.value}
                                alt={`Experience ${index + 1}`}
                                className="max-w-xs rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Alt Text"
                    validateStatus={
                      signatureExperiencesErrors?.images?.[index]?.alt
                        ? "error"
                        : ""
                    }
                    help={
                      signatureExperiencesErrors?.images?.[index]?.alt?.message
                    }
                  >
                    <Controller
                      name={`signatureExperiences.images.${index}.alt`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          size="large"
                          {...field}
                          placeholder="Dining area"
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          );
        })}

        <Button
          type="dashed"
          onClick={() => appendImage({ src: "", alt: "" })}
          block
          icon={<PlusOutlined />}
          size="large"
        >
          Add Experience Image
        </Button>
      </div>

      <Divider orientation="left">Badge</Divider>

      <Row gutter={[24, 16]}>
        <Col span={24}>
          <Form.Item
            label="Badge Image"
            validateStatus={
              signatureExperiencesErrors?.badge?.src ? "error" : ""
            }
            help={signatureExperiencesErrors?.badge?.src?.message}
          >
            <Controller
              name="signatureExperiences.badge.src"
              control={control}
              render={({ field }) => (
                <div className="space-y-4">
                  <Upload
                    accept="image/jpeg,image/png,image/webp"
                    listType="picture-card"
                    fileList={badgeFileList}
                    beforeUpload={beforeUpload}
                    onPreview={handlePreview}
                    onChange={async ({ fileList: newFileList }) => {
                      setBadgeFileList(newFileList);
                      if (
                        newFileList.length > 0 &&
                        newFileList[0].originFileObj
                      ) {
                        const base64 = await getBase64(
                          newFileList[0].originFileObj as File,
                        );
                        field.onChange(base64);
                      } else {
                        field.onChange("");
                      }
                    }}
                    maxCount={1}
                  >
                    {badgeFileList.length === 0 && (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
                  <div className="text-sm text-gray-500">
                    • Supported formats: JPEG, PNG, WebP
                    <br />
                    • Maximum file size: 10MB
                    <br />• PNG recommended for transparency
                  </div>
                  {field.value && !badgeFileList.length && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">
                        Current badge:
                      </p>
                      <Image
                        src={field.value}
                        alt="Current badge"
                        className="max-w-[100px] rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Badge Alt Text"
            validateStatus={
              signatureExperiencesErrors?.badge?.alt ? "error" : ""
            }
            help={signatureExperiencesErrors?.badge?.alt?.message}
          >
            <Controller
              name="signatureExperiences.badge.alt"
              control={control}
              render={({ field }) => (
                <Input
                  size="large"
                  {...field}
                  placeholder="Celebrate your moments"
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Image Preview Modal */}
      <Image
        style={{ display: "none" }}
        src={previewImage}
        preview={{
          visible: previewVisible,
          onVisibleChange: (visible) => setPreviewVisible(visible),
        }}
      />
    </Card>
  );
}

export default SignatureExperiencesForm;
