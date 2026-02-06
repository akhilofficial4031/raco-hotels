import type { BaseEntity, BaseFilters } from "./common.interface";

/**
 * Database representation of an attraction
 */
export interface DatabaseAttraction extends BaseEntity {
  hotelId: number;
  name: string;
  slug: string;
  content: string; // JSON string
  layout: string; // Layout type: layout_1, layout_2, layout_3
}

/**
 * Parsed attraction with typed content
 */
export interface Attraction extends Omit<DatabaseAttraction, "content"> {
  content: AttractionContent;
  layout: string; // Layout type: layout_1, layout_2, layout_3
  hotelName?: string; // Optional for joined queries
  hotelSlug?: string | null; // Optional for joined queries
}

/**
 * Attraction content structure
 */
export interface AttractionContent {
  hero: {
    title: string;
    subtitle: string;
    imageUrl: string;
  };
  marqueeTexts: string[];
  aboutSection: {
    title: string;
    description: string;
    subtext: string[];
    buttons: ButtonContent[];
    images: string[];
  };
  carouselSection: {
    tag: string;
    title: string;
    subtitle: string;
    images: string[];
  };
  feature: {
    tag: string;
    title: string;
    subtitle: string;
    images: string[];
    button: ButtonContent;
  };
  reviews: {
    tag: string;
    title: string;
    items: ReviewItem[];
  };
  gallery: {
    tag: string;
    title: string;
    images: string[];
  };
}

export interface ButtonContent {
  text: string;
  type: "primary" | "secondary";
  action: string;
}

export interface ReviewItem {
  name: string;
  review: string;
  stars: number;
}

/**
 * Filters for querying attractions
 */
export interface AttractionFilters extends BaseFilters {
  hotelId?: number;
}

/**
 * Data required to create a new attraction
 */
export interface CreateAttractionData {
  hotelId: number;
  name: string;
  slug: string;
  content: AttractionContent;
  layout: string; // Layout type: layout_1, layout_2, layout_3
}

/**
 * Data that can be updated for an attraction
 */
export interface UpdateAttractionData extends Partial<CreateAttractionData> {}
