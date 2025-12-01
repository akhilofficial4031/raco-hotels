import { UploadOutlined } from "@ant-design/icons";
import { Card, Col, Form, Image, Input, Row, Upload, message } from "antd";
import { useState } from "react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";

import type { UploadFile } from "antd";

const { TextArea } = Input;

interface HeroFormProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

function HeroForm({ control, errors }: HeroFormProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);

  const heroErrors = errors.hero as any;
  const imageBaseUrl = import.meta.env.VITE_BUCKET_URL;

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
    <Card
      title={<span className="text-lg font-semibold">Hero Section</span>}
      className="shadow-sm border-gray-200"
    >
      <Row gutter={[24, 16]}>
        <Col span={24}>
          <Form.Item
            label="Tagline"
            validateStatus={heroErrors?.tagline ? "error" : ""}
            help={heroErrors?.tagline?.message}
          >
            <Controller
              name="hero.tagline"
              control={control}
              render={({ field }) => <Input size="large" {...field} />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Title Highlight"
            validateStatus={heroErrors?.title?.highlight ? "error" : ""}
            help={heroErrors?.title?.highlight?.message}
          >
            <Controller
              name="hero.title.highlight"
              control={control}
              render={({ field }) => <Input size="large" {...field} />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Title Subtitle"
            validateStatus={heroErrors?.title?.subtitle ? "error" : ""}
            help={heroErrors?.title?.subtitle?.message}
          >
            <Controller
              name="hero.title.subtitle"
              control={control}
              render={({ field }) => <Input size="large" {...field} />}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Description"
            validateStatus={heroErrors?.description ? "error" : ""}
            help={heroErrors?.description?.message}
          >
            <Controller
              name="hero.description"
              control={control}
              render={({ field }) => (
                <TextArea rows={4} size="large" {...field} />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Primary Button Text"
            validateStatus={heroErrors?.primaryButton?.text ? "error" : ""}
            help={heroErrors?.primaryButton?.text?.message}
          >
            <Controller
              name="hero.primaryButton.text"
              control={control}
              render={({ field }) => <Input size="large" {...field} />}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Hero Image"
            validateStatus={heroErrors?.image?.src ? "error" : ""}
            help={heroErrors?.image?.src?.message}
          >
            <Controller
              name="hero.image.src"
              control={control}
              render={({ field }) => (
                <div className="space-y-4">
                  <Upload
                    accept="image/jpeg,image/png,image/webp"
                    listType="picture-card"
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    onPreview={handlePreview}
                    onChange={async ({ fileList: newFileList }) => {
                      setFileList(newFileList);
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
                    {fileList.length === 0 && (
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
                    <br />• Recommended size: 1920x1080px
                  </div>
                  {field.value && !fileList.length && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">
                        Current image:
                      </p>
                      <Image
                        src={`${imageBaseUrl}/${field.value.replace("r2://", "")}`}
                        alt="Current hero"
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
            label="Image Alt Text"
            validateStatus={heroErrors?.image?.alt ? "error" : ""}
            help={heroErrors?.image?.alt?.message}
          >
            <Controller
              name="hero.image.alt"
              control={control}
              render={({ field }) => (
                <Input size="large" {...field} placeholder="Hotel Interior" />
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

export default HeroForm;
