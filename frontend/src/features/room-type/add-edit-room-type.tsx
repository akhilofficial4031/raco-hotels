/* eslint-disable no-unused-vars */
import { DeleteOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  InputNumber,
  Switch,
} from "antd";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";

import { type Addon } from "../../shared/models/addon";
import { type Amenity } from "../../shared/models/amenity";
import { type Hotel } from "../../shared/models/hotels";
import {
  type RoomTypeWithRelations,
  type CreateRoomTypePayload,
  type RoomTypeFormData,
} from "../../shared/models/room-type";
import { fetcher } from "../../utils/swrFetcher";

const { Option } = Select;
const { TextArea } = Input;

const roomTypeSchema = z
  .object({
    hotelId: z.number().min(1, { message: "Hotel is required" }),
    name: z.string().min(1, { message: "Name is required" }),
    slug: z.string().min(1, { message: "Slug is required" }),
    description: z.string().optional(),
    baseOccupancy: z
      .number()
      .min(1, { message: "Base occupancy must be at least 1" }),
    maxOccupancy: z
      .number()
      .min(1, { message: "Max occupancy must be at least 1" }),
    basePriceCents: z
      .number()
      .min(0, { message: "Base price must be non-negative" }),
    currencyCode: z.string().default("INR"),
    sizeSqft: z.number().min(0).optional(),
    bedType: z.string().optional(),
    smokingAllowed: z.number().min(0).max(1),
    totalRooms: z
      .number()
      .min(1, { message: "Total rooms must be at least 1" }),
    isActive: z.number().min(0).max(1),
    amenityIds: z.array(z.number()).optional(),
    addons: z
      .array(
        z.object({
          id: z.number().optional(),
          addonId: z.number().min(1, { message: "Addon is required" }),
          priceCents: z
            .number()
            .min(0, { message: "Price must be non-negative" }),
        }),
      )
      .optional(),
  })
  .refine((data) => data.maxOccupancy >= data.baseOccupancy, {
    message: "Max occupancy must be greater than or equal to base occupancy",
    path: ["maxOccupancy"],
  });

interface AddEditRoomTypeProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoomTypePayload) => void;
  roomType: RoomTypeWithRelations | null;
  isSaving: boolean;
}

const AddEditRoomType: React.FC<AddEditRoomTypeProps> = ({
  open,
  onClose,
  onSubmit,
  roomType,
  isSaving,
}) => {
  const isEditMode = !!roomType;
  const [priceInRupees, setPriceInRupees] = useState<number>(0);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RoomTypeFormData>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: {
      hotelId: 0,
      name: "",
      slug: "",
      description: undefined,
      baseOccupancy: 1,
      maxOccupancy: 2,
      basePriceCents: 0,
      currencyCode: undefined,
      sizeSqft: undefined,
      bedType: undefined,
      smokingAllowed: 0,
      totalRooms: 1,
      isActive: 1,
      amenityIds: undefined,
      addons: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addons",
  });

  // Fetch hotels
  const { data: hotelsResponse } = useSWR(
    "/hotels?limit=100",
    fetcher<{ data: { hotels: Hotel[] } }>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  // Fetch amenities
  const { data: amenitiesResponse } = useSWR(
    "/amenities?limit=100",
    fetcher<{ data: { amenities: Amenity[] } }>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  // Fetch addons
  const { data: addonsResponse } = useSWR(
    "/addons?limit=100",
    fetcher<{ data: { addons: Addon[] } }>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  // Watch for name changes to auto-generate slug
  const nameValue = watch("name");

  useEffect(() => {
    if (nameValue && !isEditMode) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", slug);
    }
  }, [nameValue, setValue, isEditMode]);

  // Handle price conversion
  const handlePriceChange = (value: number | null) => {
    const priceInCents = value ? Math.round(value * 100) : 0;
    setValue("basePriceCents", priceInCents);
    setPriceInRupees(value || 0);
  };

  useEffect(() => {
    if (roomType) {
      const amenityIds = roomType.amenities?.map((a) => a.amenityId) || [];
      const addons =
        roomType.addons?.map((a) => ({
          addonId: a.addonId,
          priceCents: a.priceCents,
        })) || [];
      const priceInRupees = roomType.basePriceCents / 100;

      reset({
        hotelId: roomType.hotelId,
        name: roomType.name,
        slug: roomType.slug,
        description: roomType.description || undefined,
        baseOccupancy: roomType.baseOccupancy,
        maxOccupancy: roomType.maxOccupancy,
        basePriceCents: roomType.basePriceCents,
        currencyCode: roomType.currencyCode,
        sizeSqft: roomType.sizeSqft || undefined,
        bedType: roomType.bedType || undefined,
        smokingAllowed: roomType.smokingAllowed,
        totalRooms: roomType.totalRooms,
        isActive: roomType.isActive,
        amenityIds: amenityIds.length ? amenityIds : undefined,
        addons,
      });
      setPriceInRupees(priceInRupees);
    } else {
      reset({
        hotelId: 0,
        name: "",
        slug: "",
        description: undefined,
        baseOccupancy: 1,
        maxOccupancy: 2,
        basePriceCents: 0,
        currencyCode: undefined,
        sizeSqft: undefined,
        bedType: undefined,
        smokingAllowed: 0,
        totalRooms: 1,
        isActive: 1,
        amenityIds: undefined,
        addons: [],
      });
      setPriceInRupees(0);
    }
  }, [roomType, reset, open]);

  const handleFormSubmit = (data: RoomTypeFormData) => {
    const payload: CreateRoomTypePayload = {
      hotelId: data.hotelId,
      name: data.name,
      slug: data.slug,
      description: data.description || undefined,
      baseOccupancy: data.baseOccupancy,
      maxOccupancy: data.maxOccupancy,
      basePriceCents: data.basePriceCents,
      currencyCode: data.currencyCode,
      sizeSqft: data.sizeSqft || undefined,
      bedType: data.bedType || undefined,
      smokingAllowed: data.smokingAllowed,
      totalRooms: data.totalRooms,
      isActive: data.isActive,
      amenityIds: data.amenityIds?.length ? data.amenityIds : undefined,
      addons: data.addons,
    };
    onSubmit(payload);
  };

  return (
    <Drawer
      title={isEditMode ? "Edit Room Type" : "Add Room Type"}
      width={600}
      onClose={onClose}
      open={open}
      styles={{
        body: {
          paddingBottom: 80,
        },
      }}
      footer={
        <Space style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit(handleFormSubmit)}
            type="primary"
            loading={isSaving}
          >
            Save
          </Button>
        </Space>
      }
    >
      <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
        <Form.Item
          label="Hotel"
          required
          validateStatus={errors.hotelId ? "error" : ""}
          help={errors.hotelId?.message}
        >
          <Controller
            name="hotelId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select a hotel"
                showSearch
                optionFilterProp="children"
              >
                {hotelsResponse?.data?.hotels?.map((hotel) => (
                  <Option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Name"
          required
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="e.g., Deluxe King Room" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Slug"
          required
          validateStatus={errors.slug ? "error" : ""}
          help={errors.slug?.message}
        >
          <Controller
            name="slug"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="e.g., deluxe-king-room" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          validateStatus={errors.description ? "error" : ""}
          help={errors.description?.message}
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                rows={3}
                placeholder="Room type description..."
              />
            )}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Base Occupancy"
            required
            validateStatus={errors.baseOccupancy ? "error" : ""}
            help={errors.baseOccupancy?.message}
          >
            <Controller
              name="baseOccupancy"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={1}
                  max={10}
                  className="!w-full"
                  placeholder="1"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Max Occupancy"
            required
            validateStatus={errors.maxOccupancy ? "error" : ""}
            help={errors.maxOccupancy?.message}
          >
            <Controller
              name="maxOccupancy"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={1}
                  max={10}
                  className="!w-full"
                  placeholder="2"
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Base Price (INR)"
          required
          validateStatus={errors.basePriceCents ? "error" : ""}
          help={errors.basePriceCents?.message}
        >
          <InputNumber
            value={priceInRupees}
            onChange={handlePriceChange}
            min={0}
            precision={2}
            className="w-full"
            placeholder="1500.00"
            addonBefore="₹"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Size (sq ft)"
            validateStatus={errors.sizeSqft ? "error" : ""}
            help={errors.sizeSqft?.message}
          >
            <Controller
              name="sizeSqft"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  className="!w-full"
                  placeholder="350"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Bed Type"
            validateStatus={errors.bedType ? "error" : ""}
            help={errors.bedType?.message}
          >
            <Controller
              name="bedType"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="Select bed type" allowClear>
                  <Option value="Single">Single</Option>
                  <Option value="Double">Double</Option>
                  <Option value="Queen">Queen</Option>
                  <Option value="King">King</Option>
                  <Option value="Twin">Twin</Option>
                  <Option value="Sofa Bed">Sofa Bed</Option>
                </Select>
              )}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Total Rooms"
          required
          validateStatus={errors.totalRooms ? "error" : ""}
          help={errors.totalRooms?.message}
        >
          <Controller
            name="totalRooms"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={1}
                className="!w-full"
                placeholder="10"
              />
            )}
          />
        </Form.Item>

        <Form.Item label="Amenities">
          <Controller
            name="amenityIds"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                mode="multiple"
                placeholder="Select amenities"
                showSearch
                optionFilterProp="children"
              >
                {amenitiesResponse?.data?.amenities?.map((amenity) => (
                  <Option key={amenity.id} value={amenity.id}>
                    {amenity.name}
                  </Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>
        <div>
          <div className="flex items-center justify-between space-x-2 mb-2">
            <p>Addons</p>
            <Button
              type="dashed"
              size="small"
              onClick={() => append({ addonId: 0, priceCents: 0 })}
            >
              + Add Addon
            </Button>
          </div>
          <Form.Item>
            {fields.map((field, index) => (
              <div key={field.id} className="!flex !items-center gap-2 !mb-2">
                <Form.Item
                  className="flex-grow !mb-0"
                  validateStatus={
                    errors.addons?.[index]?.addonId ? "error" : ""
                  }
                  help={errors.addons?.[index]?.addonId?.message}
                >
                  <Controller
                    name={`addons.${index}.addonId`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value || null}
                        placeholder="Select an addon"
                        showSearch
                        optionFilterProp="children"
                      >
                        {addonsResponse?.data?.addons?.map((addon) => (
                          <Option key={addon.id} value={addon.id}>
                            {addon.name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  />
                </Form.Item>
                <Form.Item
                  className="!mb-0"
                  validateStatus={
                    errors.addons?.[index]?.priceCents ? "error" : ""
                  }
                  help={errors.addons?.[index]?.priceCents?.message}
                >
                  <Controller
                    name={`addons.${index}.priceCents`}
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        addonBefore="₹"
                        placeholder="Price"
                        min={0}
                        onChange={(value) =>
                          field.onChange(
                            value ? Math.round((value || 0) * 100) : 0,
                          )
                        }
                        value={field.value ? field.value / 100 : 0}
                      />
                    )}
                  />
                </Form.Item>
                <Button
                  type="dashed"
                  danger
                  onClick={() => remove(index)}
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </div>
            ))}
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Smoking Allowed">
            <Controller
              name="smokingAllowed"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value === 1}
                  onChange={(checked) => field.onChange(checked ? 1 : 0)}
                />
              )}
            />
          </Form.Item>

          <Form.Item label="Active">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value === 1}
                  onChange={(checked) => field.onChange(checked ? 1 : 0)}
                />
              )}
            />
          </Form.Item>
        </div>
      </Form>
    </Drawer>
  );
};

export default AddEditRoomType;
