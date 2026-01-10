import { z } from "zod";

export const ContentBlockSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    hotelId: z.number().int().nullable().openapi({ example: 1 }),
    page: z.string().openapi({ example: "home" }),
    section: z.string().openapi({ example: "hero" }),
    title: z.string().nullable().openapi({ example: "Welcome" }),
    body: z.string().nullable().openapi({ example: "Markdown or HTML" }),
    mediaUrl: z.string().nullable().openapi({ example: "https://cdn/img.jpg" }),
    sortOrder: z.number().int().openapi({ example: 0 }),
    isVisible: z.number().int().openapi({ example: 1 }),
    createdAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
    updatedAt: z.string().openapi({ example: "2024-01-01T00:00:00.000Z" }),
  })
  .openapi("ContentBlock");

export const CreateContentBlockRequestSchema = z
  .object({
    hotelId: z.number().int().optional().openapi({ example: 1 }),
    page: z.string().min(1).openapi({ example: "home" }),
    section: z.string().min(1).openapi({ example: "hero" }),
    title: z.string().optional().openapi({ example: "Welcome" }),
    body: z.string().optional().openapi({ example: "Markdown or HTML" }),
    mediaUrl: z.string().optional().openapi({ example: "https://cdn/img.jpg" }),
    sortOrder: z.number().int().optional().openapi({ example: 0 }),
    isVisible: z.number().int().optional().openapi({ example: 1 }),
  })
  .openapi("CreateContentBlockRequest");

export const UpdateContentBlockRequestSchema =
  CreateContentBlockRequestSchema.partial().openapi(
    "UpdateContentBlockRequest",
  );

export const ContentBlockPathParamsSchema = z
  .object({
    id: z
      .string()
      .transform((v) => parseInt(v, 10))
      .openapi({ example: "1", description: "Content block ID" }),
  })
  .openapi("ContentBlockPathParams");

export const ContentBlockQueryParamsSchema = z
  .object({
    page: z.string().optional().openapi({ example: "home" }),
    section: z.string().optional().openapi({ example: "hero" }),
    hotelId: z.string().optional().openapi({ example: "1" }),
    isVisible: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : undefined))
      .openapi({ example: "1" }),
  })
  .openapi("ContentBlockQueryParams");

export const ContentBlockResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      contentBlock: ContentBlockSchema,
      message: z.string().optional(),
    }),
  })
  .openapi("ContentBlockResponse");

export const ContentBlocksListResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      contentBlocks: z.array(ContentBlockSchema),
      message: z.string().optional(),
    }),
  })
  .openapi("ContentBlocksListResponse");

// Homepage Content Schemas
const ButtonConfigSchema = z.object({
  text: z.string(),
  type: z.enum(["primary", "secondary"]).optional(),
});

const ImageConfigSchema = z.object({
  src: z.string(),
  alt: z.string(),
});

const BadgeConfigSchema = z.object({
  src: z.string(),
  alt: z.string(),
});

export const HomePageContentSchema = z
  .object({
    topBanner: z.object({
      isVisible: z.boolean(),
      text: z.string(),
      linkText: z.string(),
      linkUrl: z.string(),
    }),
    hero: z
      .object({
        tagline: z.string(),
        title: z.object({
          highlight: z.string(),
          subtitle: z.string(),
        }),
        description: z.string(),
        primaryButton: ButtonConfigSchema,
        image: ImageConfigSchema,
      })
      .optional(),
    aboutUs: z
      .object({
        sectionTag: z.string(),
        title: z.string(),
        description: z.string(),
        badge: BadgeConfigSchema,
        primaryButton: ButtonConfigSchema,
        image: ImageConfigSchema,
      })
      .optional(),
    ourStays: z
      .object({
        sectionTag: z.string(),
        title: z.string(),
        description: z.string(),
      })
      .optional(),
    featuredStays: z
      .object({
        title: z.string(),
        description: z.string(),
        primaryButton: ButtonConfigSchema,
      })
      .optional(),
    signatureSection: z
      .object({
        title: z.string(),
        description: z.string(),
        items: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
          }),
        ),
      })
      .optional(),
    signatureExperiences: z
      .object({
        sectionTag: z.string(),
        title: z.string(),
        description: z.string(),
        club: z.object({
          name: z.string(),
          tagline: z.string(),
          title: z.string(),
          description: z.string(),
          buttons: z.array(ButtonConfigSchema),
        }),
        images: z.array(ImageConfigSchema),
        badge: BadgeConfigSchema,
      })
      .optional(),
    gravityBar: z
      .object({
        sectionTag: z.string(),
        title: z.string(),
        description: z.string(),
        name: z.string(),
        image: ImageConfigSchema,
        buttons: z.array(ButtonConfigSchema),
        badge: BadgeConfigSchema,
      })
      .optional(),
    restaurant: z
      .object({
        name: z.string(),
        sectionTag: z.string(),
        title: z.string(),
        description: z.string(),
        buttons: z.array(ButtonConfigSchema),
        images: z.array(ImageConfigSchema),
        badge: BadgeConfigSchema,
      })
      .optional(),
    gallery: z
      .object({
        sectionTag: z.string(),
        title: z.string(),
        images: z.array(ImageConfigSchema),
        buttons: z.array(ButtonConfigSchema),
      })
      .optional(),
    seo: z
      .object({
        title: z.string(),
        description: z.string(),
        keywords: z.string(),
      })
      .optional(),
  })
  .openapi("HomePageContent");

// No query params needed for homepage content
export const HomepageContentQueryParamsSchema = z
  .object({})
  .openapi("HomepageContentQueryParams");

export const HomepageContentResponseSchema = z
  .object({
    success: z.boolean(),
    data: HomePageContentSchema,
    message: z.string().optional(),
  })
  .openapi("HomepageContentResponse");

export const SaveHomepageContentRequestSchema = HomePageContentSchema.openapi(
  "SaveHomepageContentRequest",
);

// Public Homepage Content with Testimonials
const TestimonialItemSchema = z.object({
  name: z.string(),
  location: z.string(),
  avatar: z.string(),
  testimonial: z.string(),
  rating: z.number().int().min(1).max(5).optional(),
});

export const PublicHomePageContentSchema = HomePageContentSchema.extend({
  testimonials: z.object({
    sectionTag: z.string(),
    title: z.string(),
    items: z.array(TestimonialItemSchema),
  }),
}).openapi("PublicHomePageContent");

export const PublicHomepageContentResponseSchema = z
  .object({
    success: z.boolean(),
    data: PublicHomePageContentSchema,
    message: z.string().optional(),
  })
  .openapi("PublicHomepageContentResponse");

// TopBanner specific schema
export const TopBannerSchema = z
  .object({
    isVisible: z.boolean(),
    text: z.string(),
    linkText: z.string(),
    linkUrl: z.string(),
  })
  .openapi("TopBanner");

export const TopBannerResponseSchema = z
  .object({
    success: z.boolean(),
    data: TopBannerSchema,
    message: z.string().optional(),
  })
  .openapi("TopBannerResponse");
