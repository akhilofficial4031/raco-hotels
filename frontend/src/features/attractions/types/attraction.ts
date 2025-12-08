import { type PaginationResponse } from "@shared/models/common";

export interface ButtonContent {
  text: string;
  type: "primary" | "secondary";
  action: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface AboutSectionContent {
  title: string;
  description: string;
  subtext: string[];
  buttons: ButtonContent[];
  images: string[];
}

export interface CarouselSectionContent {
  tag: string;
  title: string;
  subtitle: string;
  images: string[];
}

export interface FeatureContent {
  tag: string;
  title: string;
  subtitle: string;
  images: string[];
  button: ButtonContent;
}

export interface ReviewItem {
  name: string;
  review: string;
  stars: number;
}

export interface ReviewsContent {
  tag: string;
  title: string;
  items: ReviewItem[];
}

export interface GalleryContent {
  tag: string;
  title: string;
  images: string[];
}

export interface AttractionContent {
  hero: HeroContent;
  marqueeTexts: string[];
  aboutSection: AboutSectionContent;
  carouselSection: CarouselSectionContent;
  feature: FeatureContent;
  reviews: ReviewsContent;
  gallery: GalleryContent;
}

export interface Attraction {
  id: number;
  hotelId: number;
  name: string;
  slug: string;
  content: AttractionContent;
  createdAt: string;
  updatedAt: string;
  hotelName?: string; // Optional, for display purposes
}

export interface AttractionListResponse {
  data: {
    attractions: Attraction[];
    pagination: PaginationResponse;
  };
}

export interface AttractionListParamStructure {
  page: number;
  limit: number;
  search: string;
  hotelId?: string;
}

export interface AttractionResponse {
  data: {
    attraction: Attraction;
  };
}

export interface CreateAttractionPayload {
  hotelId: number;
  name: string;
  slug: string;
  content: AttractionContent;
}

export type UpdateAttractionPayload = Partial<CreateAttractionPayload>;
