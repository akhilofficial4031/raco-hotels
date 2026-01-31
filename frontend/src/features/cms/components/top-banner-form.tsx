import { Card, Col, Form, Input, Row, Switch } from "antd";
import { Controller, type Control, type FieldErrors } from "react-hook-form";

interface TopBannerFormProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

function TopBannerForm({ control, errors }: TopBannerFormProps) {
  const topBannerErrors = errors.topBanner as any;

  return (
    <Card
      title={<span className="text-lg font-semibold">Top Banner</span>}
      className="shadow-sm border-gray-200"
    >
      <Row gutter={[24, 16]}>
        <Col span={24}>
          <Form.Item label="Visible">
            <Controller
              name="topBanner.isVisible"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Switch
                  checked={Boolean(value)}
                  onChange={(checked) => onChange(checked)}
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            label="Banner Text"
            validateStatus={topBannerErrors?.text ? "error" : ""}
            help={topBannerErrors?.text?.message}
          >
            <Controller
              name="topBanner.text"
              control={control}
              render={({ field }) => <Input size="large" {...field} />}
            />
          </Form.Item>
        </Col>
        {/* <Col span={12}>
          <Form.Item
            label="Link Text"
            validateStatus={topBannerErrors?.linkText ? "error" : ""}
            help={topBannerErrors?.linkText?.message}
          >
            <Controller
              name="topBanner.linkText"
              control={control}
              render={({ field }) => <Input size="large" {...field} />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Link URL"
            validateStatus={topBannerErrors?.linkUrl ? "error" : ""}
            help={topBannerErrors?.linkUrl?.message}
          >
            <Controller
              name="topBanner.linkUrl"
              control={control}
              render={({ field }) => <Input size="large" {...field} />}
            />
          </Form.Item>
        </Col> */}
      </Row>
    </Card>
  );
}

export default TopBannerForm;
