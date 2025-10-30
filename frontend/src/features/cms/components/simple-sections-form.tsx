import { Card, Col, Form, Input, Row } from "antd";
import { Controller, type Control, type FieldErrors } from "react-hook-form";

import type { HomePageContent } from "../types";

const { TextArea } = Input;

interface SimpleSectionsFormProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

function SimpleSectionsForm({ control, errors }: SimpleSectionsFormProps) {
  const ourStaysErrors = errors.ourStays as any;
  const featuredStaysErrors = errors.featuredStays as any;
  const galleryErrors = errors.gallery as any;

  return (
    <>
      {/* Our Stays Section */}
      <Card
        title={<span className="text-lg font-semibold">Our Stays Section</span>}
        className="shadow-sm border-gray-200"
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
        className="shadow-sm border-gray-200"
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
        className="shadow-sm border-gray-200"
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
        </Row>
      </Card>
    </>
  );
}

export default SimpleSectionsForm;
