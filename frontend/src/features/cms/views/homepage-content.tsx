import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, message, Spin, Tabs } from "antd";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler, type FieldErrors } from "react-hook-form";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { z } from "zod";

import { fetcher, mutationFetcher } from "@utils/swrFetcher";

import {
  AboutUsForm,
  HeroForm,
  SeoForm,
  SimpleSectionsForm,
  TopBannerForm,
  // TopBannerForm,
} from "../components";

import type { HomePageContent } from "../types";

// Helper function to save homepage content
const saveHomepageContent = (
  url: string,
  { arg }: { arg: HomePageContent },
) => {
  return mutationFetcher(url, {
    arg: {
      method: "PUT",
      body: arg,
    },
  });
};

// Validation schema
const buttonSchema = z.object({
  text: z.string().min(1, "Button text is required"),
  type: z.enum(["primary", "secondary"]).optional(),
});

const imageSchema = z.object({
  src: z.string(),
  alt: z.string(),
});

const badgeSchema = z.object({
  src: z.string().min(1, "Badge source is required"),
  alt: z.string().min(1, "Alt text is required"),
});

const homepageContentSchema = z.object({
  topBanner: z
    .object({
      isVisible: z.boolean().default(true),
      text: z.string().optional(),
      linkText: z.string().optional(),
      linkUrl: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.isVisible) {
        if (!data.text) {
          ctx.addIssue({
            code: "custom",
            path: ["text"],
            message: "Banner text is required",
          });
        }
        if (!data.linkText) {
          ctx.addIssue({
            code: "custom",
            path: ["linkText"],
            message: "Link text is required",
          });
        }
        if (!data.linkUrl) {
          ctx.addIssue({
            code: "custom",
            path: ["linkUrl"],
            message: "Link URL is required",
          });
        }
      }
    }),
  hero: z
    .object({
      tagline: z.string().min(1, "Tagline is required"),
      title: z.object({
        highlight: z.string().min(1, "Highlight is required"),
        subtitle: z.string().min(1, "Subtitle is required"),
      }),
      description: z.string().min(1, "Description is required"),
      primaryButton: buttonSchema,
      image: imageSchema,
    })
    .optional(),
  aboutUs: z
    .object({
      sectionTag: z.string().min(1, "Section tag is required"),
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      badge: badgeSchema,
      primaryButton: buttonSchema,
      image: imageSchema,
    })
    .optional(),
  ourStays: z
    .object({
      sectionTag: z.string().min(1, "Section tag is required"),
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
    })
    .optional(),
  featuredStays: z
    .object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      primaryButton: buttonSchema,
    })
    .optional(),
  signatureExperiences: z
    .object({
      sectionTag: z.string().min(1, "Section tag is required"),
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      club: z.object({
        name: z.string().min(1, "Club name is required"),
        tagline: z.string().min(1, "Club tagline is required"),
        title: z.string().min(1, "Club title is required"),
        description: z.string().min(1, "Club description is required"),
        buttons: z.array(buttonSchema),
      }),
      images: z.array(imageSchema),
      badge: badgeSchema,
    })
    .optional(),
  gravityBar: z
    .object({
      sectionTag: z.string().min(1, "Section tag is required"),
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      name: z.string().min(1, "Name is required"),
      image: imageSchema,
      buttons: z.array(buttonSchema),
      badge: badgeSchema,
    })
    .optional(),
  restaurant: z
    .object({
      name: z.string().min(1, "Name is required"),
      sectionTag: z.string().min(1, "Section tag is required"),
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      buttons: z.array(buttonSchema),
      images: z.array(imageSchema),
      badge: badgeSchema,
    })
    .optional(),
  gallery: z
    .object({
      sectionTag: z.string().min(1, "Section tag is required"),
      title: z.string().min(1, "Title is required"),
      images: z.array(imageSchema),
      buttons: z.array(buttonSchema),
    })
    .optional(),
  seo: z
    .object({
      title: z.string(),
      description: z.string(),
      keywords: z.string(),
    })
    .optional(),
});

interface ContentResponse {
  success: boolean;
  data: HomePageContent;
}

function HomepageContent() {
  const [activeTab, setActiveTab] = useState("1");

  // Fetch existing content from API
  const {
    data: contentData,
    mutate,
    error,
  } = useSWR("/content/homepage", fetcher<ContentResponse>, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // Save mutation
  const { trigger: saveTrigger, isMutating: isSaving } = useSWRMutation(
    "/content/homepage",
    saveHomepageContent,
    {
      onSuccess: () => {
        message.success("Homepage content saved successfully!");
        mutate();
      },
      onError: (error: Error) => {
        message.error(`Failed to save: ${error.message}`);
      },
    },
  );

  // Show loading or error states
  if (error && !contentData) {
    console.error("Error loading content:", error);
  }

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
    trigger,
  } = useForm({
    resolver: zodResolver(homepageContentSchema) as any,
    mode: "onBlur",
    defaultValues: {
      topBanner: {
        isVisible: true,
        text: "",
        linkText: "",
        linkUrl: "#",
      },
      hero: {
        tagline: "",
        title: {
          highlight: "",
          subtitle: "",
        },
        description: "",
        primaryButton: {
          text: "",
        },
        image: {
          src: "",
          alt: "",
        },
      },
      aboutUs: {
        sectionTag: "",
        title: "",
        description: "",
        badge: {
          src: "",
          alt: "",
        },
        primaryButton: {
          text: "",
        },
        image: {
          src: "",
          alt: "",
        },
      },
      ourStays: {
        sectionTag: "OUR STAYS",
        title: "DISCOVER OUR CURATED COLLECTION OF EXQUISITE STAYS",
        description:
          "In a world that moves too fast, we believe in the art of slow living. Natural textures, warm lighting, and thoughtful spaces create an atmosphere of comfort and timeless elegance.",
      },
      featuredStays: {
        title: "RACO CYBER RESIDENCY",
        description:
          "In a world that moves too fast, we believe in the art of slow living. Natural.",
        primaryButton: {
          text: "View All",
        },
      },
      signatureExperiences: {
        sectionTag: "",
        title: "",
        description: "",
        club: {
          name: "",
          tagline: "",
          title: "",
          description: "",
          buttons: [],
        },
        images: [],
        badge: {
          src: "",
          alt: "",
        },
      },
      gravityBar: {
        sectionTag: "",
        title: "",
        description: "",
        name: "",
        image: {
          src: "",
          alt: "",
        },
        buttons: [],
        badge: {
          src: "",
          alt: "",
        },
      },
      restaurant: {
        name: "",
        sectionTag: "",
        title: "",
        description: "",
        buttons: [],
        images: [],
        badge: {
          src: "",
          alt: "",
        },
      },
      gallery: {
        sectionTag: "GALLERY",
        title: "MOMENTS AT RACO",
        images: [
          { src: "", alt: "" },
          { src: "", alt: "" },
          { src: "", alt: "" },
          { src: "", alt: "" },
        ],
        buttons: [
          {
            text: "Explore More",
            type: "primary" as const,
          },
          {
            text: "Follow Us",
            type: "secondary" as const,
          },
        ],
      },
      seo: {
        title: "",
        description: "",
        keywords: "",
      },
    },
  });

  useEffect(() => {
    if (contentData?.data) {
      // Merge API data with defaults to ensure all required fields exist
      const mergedData = {
        topBanner: contentData.data.topBanner || {
          isVisible: true,
          text: "",
          linkText: "",
          linkUrl: "#",
        },
        hero: contentData.data.hero || undefined,
        aboutUs: contentData.data.aboutUs || undefined,
        ourStays: contentData.data.ourStays || {
          sectionTag: "OUR STAYS",
          title: "DISCOVER OUR CURATED COLLECTION OF EXQUISITE STAYS",
          description:
            "In a world that moves too fast, we believe in the art of slow living.",
        },
        featuredStays: contentData.data.featuredStays || {
          title: "RACO CYBER RESIDENCY",
          description:
            "In a world that moves too fast, we believe in the art of slow living.",
          primaryButton: {
            text: "View All",
          },
        },
        signatureExperiences:
          contentData.data.signatureExperiences || undefined,
        gravityBar: contentData.data.gravityBar || undefined,
        restaurant: contentData.data.restaurant || undefined,
        gallery: contentData.data.gallery || {
          sectionTag: "GALLERY",
          title: "MOMENTS AT RACO",
          images: [
            { src: "", alt: "" },
            { src: "", alt: "" },
            { src: "", alt: "" },
            { src: "", alt: "" },
          ],
          buttons: [
            {
              text: "Explore More",
              type: "primary" as const,
            },
            {
              text: "Follow Us",
              type: "secondary" as const,
            },
          ],
        },
        seo: contentData.data.seo || {
          title: "",
          description: "",
          keywords: "",
        },
      };
      reset(mergedData as any);
    }
  }, [contentData, reset]);

  const handleFormSubmit: SubmitHandler<HomePageContent> = async (formData) => {
    try {
      await saveTrigger(formData);
    } catch (error) {
      console.error("Error saving content:", error);
    }
  };

  const handleFormError = (formErrors: FieldErrors<any>) => {
    console.warn("Form validation errors:", formErrors);
    // Show error message if validation fails
    const errorMessages: string[] = [];

    const flattenErrors = (obj: any, prefix = "") => {
      for (const [key, error] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (error && typeof error === "object") {
          if ("message" in error) {
            errorMessages.push(`${fullKey}: ${(error as any).message}`);
          } else {
            flattenErrors(error, fullKey);
          }
        }
      }
    };

    flattenErrors(formErrors);
    if (errorMessages.length > 0) {
      message.error(`Validation errors: ${errorMessages.join(", ")}`);
      console.error("Detailed errors:", errorMessages);
    }
  };

  const handleSave = async () => {
    const fieldMap: Record<string, (keyof HomePageContent)[]> = {
      "1": ["topBanner"],
      "2": ["hero"],
      "3": ["aboutUs"],
      "4": ["ourStays", "featuredStays"],
      "5": ["signatureExperiences"],
      "6": ["seo"],
    };

    const fieldsToValidate = fieldMap[activeTab];

    if (!fieldsToValidate) {
      return;
    }

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      const formData = getValues();
      await handleFormSubmit(formData);
    } else {
      const tabErrors: FieldErrors<HomePageContent> = {};
      for (const field of fieldsToValidate) {
        if (errors[field]) {
          tabErrors[field] = errors[field] as any;
        }
      }
      handleFormError(tabErrors);
    }
  };

  // Wrapper to ensure proper form submission handling with Ant Design
  const onFormFinish = handleSubmit(handleFormSubmit, handleFormError);

  // Show loading spinner while fetching data
  if (!contentData && !error) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" tip="Loading homepage content..." />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Form layout="vertical" onFinish={onFormFinish}>
        <div className="bg-white p-2 rounded-lg mb-2 border border-gray-200 mx-6">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                label: "Top Banner",
                key: "1",
                children: (
                  <div className="p-4">
                    <TopBannerForm control={control} errors={errors} />
                  </div>
                ),
              },
              {
                label: "Hero Section",
                key: "2",
                children: (
                  <div className="p-4">
                    <HeroForm control={control} errors={errors} />
                  </div>
                ),
              },
              {
                label: "About Us",
                key: "3",
                children: (
                  <div className="p-4">
                    <AboutUsForm control={control} errors={errors} />
                  </div>
                ),
              },
              {
                label: "Our Stays & Featured",
                key: "4",
                children: (
                  <div className="p-4">
                    <SimpleSectionsForm control={control} errors={errors} />
                  </div>
                ),
              },
              // {
              //   label: "Signature Experiences",
              //   key: "5",
              //   children: (
              //     <div className="p-4">
              //       <SignatureExperiencesForm
              //         control={control}
              //         errors={errors}
              //       />
              //     </div>
              //   ),
              // },
              {
                label: "SEO",
                key: "5",
                children: (
                  <div className="p-4">
                    <SeoForm control={control} errors={errors} />
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 pb-6 border-t border-gray-200 bg-white mx-6 px-4">
          <Button
            onClick={() => {
              if (contentData?.data) {
                const mergedData = {
                  topBanner: contentData.data.topBanner || {
                    isVisible: true,
                    text: "",
                    linkText: "",
                    linkUrl: "#",
                  },
                  hero: contentData.data.hero || undefined,
                  aboutUs: contentData.data.aboutUs || undefined,
                  ourStays: contentData.data.ourStays || {
                    sectionTag: "OUR STAYS",
                    title: "DISCOVER OUR CURATED COLLECTION OF EXQUISITE STAYS",
                    description:
                      "In a world that moves too fast, we believe in the art of slow living.",
                  },
                  featuredStays: contentData.data.featuredStays || {
                    title: "RACO CYBER RESIDENCY",
                    description:
                      "In a world that moves too fast, we believe in the art of slow living.",
                    primaryButton: { text: "View All" },
                  },
                  signatureExperiences:
                    contentData.data.signatureExperiences || undefined,
                  gravityBar: contentData.data.gravityBar || undefined,
                  restaurant: contentData.data.restaurant || undefined,
                  gallery: contentData.data.gallery || {
                    sectionTag: "GALLERY",
                    title: "MOMENTS AT RACO",
                    images: [
                      { src: "", alt: "" },
                      { src: "", alt: "" },
                      { src: "", alt: "" },
                      { src: "", alt: "" },
                    ],
                    buttons: [
                      {
                        text: "Explore More",
                        type: "primary" as const,
                      },
                      {
                        text: "Follow Us",
                        type: "secondary" as const,
                      },
                    ],
                  },
                  seo: contentData.data.seo || {
                    title: "",
                    description: "",
                    keywords: "",
                  },
                };
                reset(mergedData as any);
              }
            }}
            size="large"
            className="px-8"
          >
            Reset
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            size="large"
            loading={isSaving}
            className="px-8"
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default HomepageContent;
