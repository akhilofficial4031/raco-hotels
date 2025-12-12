/* eslint-disable no-unused-vars */
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Col, Form, Input, Row, Select, message } from "antd";
import React, { useEffect } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";

import { fetcher } from "@utils/swrFetcher";

import AttractionContentForm from "./AttractionContentForm";

import type { HotelListResponse } from "../../hotels/types/hotels";
import type { Attraction, CreateAttractionPayload } from "../types/attraction";

interface AddEditAttractionProps {
  attraction: Attraction | null;
  onSubmit: (attractionData: CreateAttractionPayload) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

// Validation schema
const buttonSchema = z.object({
  text: z.string().min(1, "Button text is required"),
  type: z.enum(["primary", "secondary"]),
  action: z.string().min(1, "Action is required"),
});

const reviewItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  review: z.string().min(1, "Review is required"),
  stars: z.number().min(1).max(5),
});

const attractionSchema = z.object({
  hotelId: z.number().min(1, "Hotel is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  layout: z.enum(["layout_1", "layout_2", "layout_3"], {
    message: "Layout is required",
  }),
  content: z.object({
    hero: z.object({
      title: z.string().min(1, "Hero title is required"),
      subtitle: z.string().min(1, "Hero subtitle is required"),
      imageUrl: z.string().min(1, "Hero image is required"),
    }),
    marqueeTexts: z
      .array(z.string())
      .min(1, "At least one marquee text is required"),
    aboutSection: z.object({
      title: z.string().min(1, "About title is required"),
      description: z.string().min(1, "About description is required"),
      subtext: z.array(z.string()),
      buttons: z.array(buttonSchema),
      images: z.array(z.string()),
    }),
    carouselSection: z.object({
      tag: z.string().min(1, "Carousel tag is required"),
      title: z.string().min(1, "Carousel title is required"),
      subtitle: z.string().min(1, "Carousel subtitle is required"),
      images: z.array(z.string()),
    }),
    feature: z.object({
      tag: z.string().min(1, "Feature tag is required"),
      title: z.string().min(1, "Feature title is required"),
      subtitle: z.string().min(1, "Feature subtitle is required"),
      images: z.array(z.string()),
      button: buttonSchema,
    }),
    reviews: z.object({
      tag: z.string().min(1, "Reviews tag is required"),
      title: z.string().min(1, "Reviews title is required"),
      items: z.array(reviewItemSchema),
    }),
    gallery: z.object({
      tag: z.string().min(1, "Gallery tag is required"),
      title: z.string().min(1, "Gallery title is required"),
      images: z.array(z.string()),
    }),
  }),
});

const AddEditAttraction = ({
  attraction,
  onSubmit,
  onCancel,
  isSaving,
}: AddEditAttractionProps) => {
  // Fetch hotels for dropdown
  const { data: hotelsResponse } = useSWR(
    "/hotels?page=1&limit=100",
    fetcher<HotelListResponse>,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateAttractionPayload>({
    resolver: zodResolver(attractionSchema),
    defaultValues: {
      hotelId: 0,
      name: "",
      slug: "",
      layout: "layout_1",
      content: {
        hero: {
          title: "",
          subtitle: "",
          imageUrl: "",
        },
        marqueeTexts: [""],
        aboutSection: {
          title: "",
          description: "",
          subtext: [],
          buttons: [],
          images: [],
        },
        carouselSection: {
          tag: "",
          title: "",
          subtitle: "",
          images: [],
        },
        feature: {
          tag: "",
          title: "",
          subtitle: "",
          images: [],
          button: {
            text: "",
            type: "primary",
            action: "",
          },
        },
        reviews: {
          tag: "",
          title: "",
          items: [],
        },
        gallery: {
          tag: "",
          title: "",
          images: [],
        },
      },
    },
  });

  const name = watch("name");

  // Populate form data when attraction is loaded (edit mode)
  useEffect(() => {
    if (attraction) {
      reset({
        hotelId: attraction.hotelId,
        name: attraction.name,
        slug: attraction.slug,
        layout: attraction.layout,
        content: attraction.content,
      });
    }
  }, [attraction, reset]);

  // Auto-generate slug from name (only in add mode)
  useEffect(() => {
    if (name && !attraction) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", slug);
    }
  }, [name, setValue, attraction]);

  const handleFormSubmit: SubmitHandler<CreateAttractionPayload> = async (
    data,
  ) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error saving attraction:", error);
      message.error("Failed to save attraction");
    }
  };

  return (
    <div className="w-full">
      <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
        <div className="space-y-6 mx-6">
          {/* Basic Details Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Details
            </h2>
            <Card className="shadow-sm border-gray-200">
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Form.Item
                    label="Name"
                    validateStatus={errors.name ? "error" : ""}
                    help={errors.name?.message}
                    required
                  >
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => <Input size="large" {...field} />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Hotel"
                    validateStatus={errors.hotelId ? "error" : ""}
                    help={errors.hotelId?.message}
                    required
                  >
                    <Controller
                      name="hotelId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          size="large"
                          {...field}
                          placeholder="Select a hotel"
                          options={
                            hotelsResponse?.data.hotels.map((hotel: any) => ({
                              label: hotel.name,
                              value: hotel.id,
                            })) || []
                          }
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Slug"
                    validateStatus={errors.slug ? "error" : ""}
                    help={errors.slug?.message}
                    required
                  >
                    <Controller
                      name="slug"
                      control={control}
                      render={({ field }) => (
                        <Input size="large" {...field} disabled />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Layout"
                    validateStatus={errors.layout ? "error" : ""}
                    help={errors.layout?.message}
                    required
                  >
                    <Controller
                      name="layout"
                      control={control}
                      render={({ field }) => (
                        <Select
                          size="large"
                          {...field}
                          placeholder="Select a layout"
                          options={[
                            { label: "Layout 1", value: "layout_1" },
                            { label: "Layout 2", value: "layout_2" },
                            { label: "Layout 3", value: "layout_3" },
                          ]}
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </div>

          {/* Content Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Content
            </h2>
            <AttractionContentForm
              control={control}
              errors={errors}
              setValue={setValue}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 pb-6 border-t border-gray-200 bg-white mx-6 px-4 mt-6">
          <Button onClick={onCancel} size="large" className="px-8">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isSaving}
            className="px-8"
          >
            {attraction ? "Update" : "Create"} Attraction
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddEditAttraction;
