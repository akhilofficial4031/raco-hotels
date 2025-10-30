import { UploadOutlined } from "@ant-design/icons";
import { Card, Col, Form, Image, Input, Row, Upload, message } from "antd";
import { useState } from "react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";

import type { UploadFile } from "antd";

const { TextArea } = Input;

interface AboutUsFormProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

function AboutUsForm({ control, errors }: AboutUsFormProps) {
  const [mainImageFileList, setMainImageFileList] = useState<UploadFile[]>([]);
  const [badgeFileList, setBadgeFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);

  const aboutUsErrors = errors.aboutUs as any;

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
      title={<span className="text-lg font-semibold">About Us Section</span>}
      className="shadow-sm border-gray-200"
    >
      <Row gutter={[24, 16]}>
        <Col span={24}>
          <Form.Item
            label="Section Tag"
            validateStatus={aboutUsErrors?.sectionTag ? "error" : ""}
            help={aboutUsErrors?.sectionTag?.message}
          >
            <Controller
              name="aboutUs.sectionTag"
              control={control}
              render={({ field }) => <Input size="large" {...field} />}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Title"
            validateStatus={aboutUsErrors?.title ? "error" : ""}
            help={aboutUsErrors?.title?.message}
          >
            <Controller
              name="aboutUs.title"
              control={control}
              render={({ field }) => (
                <TextArea rows={3} size="large" {...field} />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Description"
            validateStatus={aboutUsErrors?.description ? "error" : ""}
            help={aboutUsErrors?.description?.message}
          >
            <Controller
              name="aboutUs.description"
              control={control}
              render={({ field }) => (
                <TextArea rows={4} size="large" {...field} />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Badge Image"
            validateStatus={aboutUsErrors?.badge?.src ? "error" : ""}
            help={aboutUsErrors?.badge?.src?.message}
          >
            <Controller
              name="aboutUs.badge.src"
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
            validateStatus={aboutUsErrors?.badge?.alt ? "error" : ""}
            help={aboutUsErrors?.badge?.alt?.message}
          >
            <Controller
              name="aboutUs.badge.alt"
              control={control}
              render={({ field }) => (
                <Input size="large" {...field} placeholder="Best Choice" />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Button Text"
            validateStatus={aboutUsErrors?.primaryButton?.text ? "error" : ""}
            help={aboutUsErrors?.primaryButton?.text?.message}
          >
            <Controller
              name="aboutUs.primaryButton.text"
              control={control}
              render={({ field }) => <Input size="large" {...field} />}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Main Section Image"
            validateStatus={aboutUsErrors?.image?.src ? "error" : ""}
            help={aboutUsErrors?.image?.src?.message}
          >
            <Controller
              name="aboutUs.image.src"
              control={control}
              render={({ field }) => (
                <div className="space-y-4">
                  <Upload
                    accept="image/jpeg,image/png,image/webp"
                    listType="picture-card"
                    fileList={mainImageFileList}
                    beforeUpload={beforeUpload}
                    onPreview={handlePreview}
                    onChange={async ({ fileList: newFileList }) => {
                      setMainImageFileList(newFileList);
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
                    {mainImageFileList.length === 0 && (
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
                    <br />• Recommended size: 1200x800px
                  </div>
                  {field.value && !mainImageFileList.length && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">
                        Current image:
                      </p>
                      <Image
                        src={field.value}
                        alt="Current image"
                        className="max-w-sm rounded-lg"
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
            label="Image Alt Text"
            validateStatus={aboutUsErrors?.image?.alt ? "error" : ""}
            help={aboutUsErrors?.image?.alt?.message}
          >
            <Controller
              name="aboutUs.image.alt"
              control={control}
              render={({ field }) => (
                <Input size="large" {...field} placeholder="Hotel Poolside" />
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

export default AboutUsForm;
