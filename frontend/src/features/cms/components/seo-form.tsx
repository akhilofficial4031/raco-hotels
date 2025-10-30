import { Card, Col, Form, Input, Row } from "antd";
import { Controller, type Control, type FieldErrors } from "react-hook-form";

import type { HomePageContent } from "../types";

const { TextArea } = Input;

interface SeoFormProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

function SeoForm({ control, errors }: SeoFormProps) {
  const seoErrors = errors.seo as any;

  return (
    <Card
      title={<span className="text-lg font-semibold">SEO Settings</span>}
      className="shadow-sm border-gray-200"
    >
      <Row gutter={[24, 16]}>
        <Col span={24}>
          <Form.Item
            label="Page Title"
            validateStatus={seoErrors?.title ? "error" : ""}
            help={seoErrors?.title?.message}
          >
            <Controller
              name="seo.title"
              control={control}
              render={({ field }) => <Input size="large" {...field} />}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Meta Description"
            validateStatus={seoErrors?.description ? "error" : ""}
            help={seoErrors?.description?.message}
          >
            <Controller
              name="seo.description"
              control={control}
              render={({ field }) => (
                <TextArea rows={4} size="large" {...field} />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Keywords (comma-separated)"
            validateStatus={seoErrors?.keywords ? "error" : ""}
            help={seoErrors?.keywords?.message}
          >
            <Controller
              name="seo.keywords"
              control={control}
              render={({ field }) => (
                <TextArea rows={3} size="large" {...field} />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}

export default SeoForm;
