import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Form, Input } from "antd";
import { Controller, useFieldArray, type Control } from "react-hook-form";

import { type CreateHotelPayload } from "../../../shared/models/hotels";

interface LocationInfoFormProps {
  control: Control<CreateHotelPayload>;
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
      images: [{ url: "", alt: "" }],
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
  control: Control<CreateHotelPayload>;
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
        help="Enter each bullet point separated by commas (e.g., 5 min to beach, Close to metro, Free WiFi)"
      >
        <Controller
          name={`locationInfo.${locationIndex}.bulletPoints`}
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              value={
                Array.isArray(field.value)
                  ? field.value.join(", ")
                  : field.value || ""
              }
              onChange={(e) => {
                const value = e.target.value;
                // Convert comma-separated string back to array for form state
                const bulletPointsArray = value
                  .split(",")
                  .map((point) => point.trim())
                  .filter((point) => point.length > 0);
                field.onChange(bulletPointsArray);
              }}
              rows={3}
              placeholder="5 min to beach, Close to metro, Free WiFi"
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
  control: Control<CreateHotelPayload>;
  locationIndex: number;
}

const ImagesForm: React.FC<ImagesFormProps> = ({ control, locationIndex }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `locationInfo.${locationIndex}.images`,
  });

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">Images</label>
        <Button
          type="dashed"
          size="small"
          onClick={() => append({ url: "", alt: "" })}
          icon={<PlusOutlined />}
        >
          Add Image
        </Button>
      </div>

      {fields.map((field, index) => (
        <Card key={field.id} size="small">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 space-y-2">
              <div className="mb-2">
                <Controller
                  name={`locationInfo.${locationIndex}.images.${index}.url`}
                  control={control}
                  render={({ field }) => (
                    <Input placeholder="Image URL" {...field} />
                  )}
                />
              </div>
              <Controller
                name={`locationInfo.${locationIndex}.images.${index}.alt`}
                control={control}
                render={({ field }) => (
                  <Input placeholder="Alt text" {...field} />
                )}
              />
            </div>
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => remove(index)}
            />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default LocationInfoForm;
