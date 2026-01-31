import { UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Upload,
  message,
} from "antd";
import { useEffect, useState } from "react";
import {
  Controller,
  useFieldArray,
  type Control,
  type FieldErrors,
} from "react-hook-form";

import type { UploadFile } from "antd";

const { TextArea } = Input;

interface SimpleSectionsFormProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

interface ImageItem {
  src: string;
  alt: string;
}

interface GalleryImageUploadProps {
  value?: ImageItem[];
  // eslint-disable-next-line no-unused-vars
  onChange(items: ImageItem[]): void;
}

// Helper functions
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

const GalleryImageUpload = ({
  value = [],
  onChange,
}: GalleryImageUploadProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const imageBaseUrl = import.meta.env.VITE_BUCKET_URL;

  // Sync fileList with value (ImageConfig[]) on mount or when value changes externally
  // We check if fileList is empty to avoid overwriting ongoing uploads or local state
  useEffect(() => {
    if (value && value.length > 0 && fileList.length === 0) {
      const validImages = value.filter(
        (img) => img.src && img.src.trim() !== "",
      );
      if (validImages.length > 0) {
        const initialFileList = validImages.map((img, index) => ({
          uid: `-${index}`,
          name: img.alt || `image-${index + 1}`,
          status: "done" as const,
          url: `${imageBaseUrl}/${img.src.replace("r2://", "")}`,
          preview: `${imageBaseUrl}/${img.src.replace("r2://", "")}`,
        }));
        setFileList(initialFileList);
      }
    }
  }, [value]); // Relying on checking fileList length to prevent loops

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.preview || (file.url as string));
    setPreviewVisible(true);
  };

  const handleChange = async ({
    fileList: newFileList,
  }: {
    fileList: UploadFile[];
  }) => {
    setFileList(newFileList);

    // Process files to create ImageConfig array
    // We need to wait for base64 conversion for new files
    const images = await Promise.all(
      newFileList.map(async (file) => {
        if (file.url) {
          return { src: file.url, alt: file.name || "" };
        }
        if (file.originFileObj) {
          const src = await getBase64(file.originFileObj as File);
          return { src, alt: file.name || "" };
        }
        return { src: "", alt: "" };
      }),
    );

    // Filter out any failed/empty conversions if necessary,
    // but we should keep the array in sync with fileList
    const validImages = images.filter((img) => img.src);
    onChange(validImages);
  };

  return (
    <>
      <Upload
        accept="image/jpeg,image/png,image/webp"
        listType="picture-card"
        fileList={fileList}
        beforeUpload={beforeUpload}
        onPreview={handlePreview}
        onChange={handleChange}
        multiple
      >
        <div>
          <UploadOutlined />
          <div style={{ marginTop: 8 }}>Upload</div>
        </div>
      </Upload>
      <div className="text-sm text-gray-500 mt-2">
        • Supported formats: JPEG, PNG, WebP
        <br />• Maximum file size: 10MB
      </div>

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <Image alt="example" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
};

function SimpleSectionsForm({ control, errors }: SimpleSectionsFormProps) {
  const ourStaysErrors = errors.ourStays as any;
  const featuredStaysErrors = errors.featuredStays as any;
  const galleryErrors = errors.gallery as any;
  const signatureSectionErrors = errors.signatureSection as any;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "signatureSection.items",
  });

  return (
    <>
      {/* Our Stays Section */}
      <Card
        title={<span className="text-lg font-semibold">Our Stays Section</span>}
        className="shadow-sm border-gray-200 !mb-2"
      >
        <Row gutter={[24, 16]}>
          <Col span={24}>
            <Form.Item
              label="Section Tag"
              validateStatus={ourStaysErrors?.sectionTag ? "error" : ""}
              help={ourStaysErrors?.sectionTag?.message}
            >
              <Controller
                name="ourStays.sectionTag"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Title"
              validateStatus={ourStaysErrors?.title ? "error" : ""}
              help={ourStaysErrors?.title?.message}
            >
              <Controller
                name="ourStays.title"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Title 2"
              validateStatus={ourStaysErrors?.title2 ? "error" : ""}
              help={ourStaysErrors?.title2?.message}
            >
              <Controller
                name="ourStays.title2"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Description"
              validateStatus={ourStaysErrors?.description ? "error" : ""}
              help={ourStaysErrors?.description?.message}
            >
              <Controller
                name="ourStays.description"
                control={control}
                render={({ field }) => (
                  <TextArea rows={4} size="large" {...field} />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Featured Stays Section */}
      <Card
        title={
          <span className="text-lg font-semibold">Featured Stays Section</span>
        }
        className="shadow-sm border-gray-200 !mb-2"
      >
        <Row gutter={[24, 16]}>
          <Col span={24}>
            <Form.Item
              label="Title"
              validateStatus={featuredStaysErrors?.title ? "error" : ""}
              help={featuredStaysErrors?.title?.message}
            >
              <Controller
                name="featuredStays.title"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Description"
              validateStatus={featuredStaysErrors?.description ? "error" : ""}
              help={featuredStaysErrors?.description?.message}
            >
              <Controller
                name="featuredStays.description"
                control={control}
                render={({ field }) => (
                  <TextArea rows={3} size="large" {...field} />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Button Text"
              validateStatus={
                featuredStaysErrors?.primaryButton?.text ? "error" : ""
              }
              help={featuredStaysErrors?.primaryButton?.text?.message}
            >
              <Controller
                name="featuredStays.primaryButton.text"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Gallery Section */}
      <Card
        title={<span className="text-lg font-semibold">Gallery Section</span>}
        className="shadow-sm border-gray-200 !mb-2"
      >
        <Row gutter={[24, 16]}>
          <Col span={24}>
            <Form.Item
              label="Section Tag"
              validateStatus={galleryErrors?.sectionTag ? "error" : ""}
              help={galleryErrors?.sectionTag?.message}
            >
              <Controller
                name="gallery.sectionTag"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Title"
              validateStatus={galleryErrors?.title ? "error" : ""}
              help={galleryErrors?.title?.message}
            >
              <Controller
                name="gallery.title"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Gallery Images"
              validateStatus={galleryErrors?.images ? "error" : ""}
              help={galleryErrors?.images?.message}
            >
              <Controller
                name="gallery.images"
                control={control}
                render={({ field }) => (
                  <GalleryImageUpload
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Signature Section */}
      <Card
        title={<span className="text-lg font-semibold">Signature Section</span>}
        className="shadow-sm border-gray-200 !mb-2"
      >
        <Row gutter={[24, 16]}>
          <Col span={24}>
            <Form.Item
              label="Title"
              validateStatus={signatureSectionErrors?.title ? "error" : ""}
              help={signatureSectionErrors?.title?.message}
            >
              <Controller
                name="signatureSection.title"
                control={control}
                render={({ field }) => <Input size="large" {...field} />}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Description"
              validateStatus={
                signatureSectionErrors?.description ? "error" : ""
              }
              help={signatureSectionErrors?.description?.message}
            >
              <Controller
                name="signatureSection.description"
                control={control}
                render={({ field }) => (
                  <TextArea rows={3} size="large" {...field} />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Signature Items"
              validateStatus={signatureSectionErrors?.items ? "error" : ""}
              help={signatureSectionErrors?.items?.message}
            >
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card
                    key={field.id}
                    size="small"
                    title={`Item ${index + 1}`}
                    extra={
                      <Button
                        type="text"
                        danger
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        Remove
                      </Button>
                    }
                    className="border-gray-200"
                  >
                    <Row gutter={[16, 8]}>
                      <Col span={24}>
                        <Form.Item
                          label="Title"
                          validateStatus={
                            signatureSectionErrors?.items?.[index]?.title
                              ? "error"
                              : ""
                          }
                          help={
                            signatureSectionErrors?.items?.[index]?.title
                              ?.message
                          }
                          className="mb-3"
                        >
                          <Controller
                            name={`signatureSection.items.${index}.title`}
                            control={control}
                            render={({ field }) => <Input {...field} />}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          label="Description"
                          validateStatus={
                            signatureSectionErrors?.items?.[index]?.description
                              ? "error"
                              : ""
                          }
                          help={
                            signatureSectionErrors?.items?.[index]?.description
                              ?.message
                          }
                          className="mb-0"
                        >
                          <Controller
                            name={`signatureSection.items.${index}.description`}
                            control={control}
                            render={({ field }) => (
                              <TextArea rows={2} {...field} />
                            )}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => append({ title: "", description: "" })}
                  className="w-full"
                >
                  Add Signature Item
                </Button>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </>
  );
}

export default SimpleSectionsForm;
