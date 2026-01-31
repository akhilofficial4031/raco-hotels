// Content Management Types - matching frontend CMS structure

export interface ButtonConfig {
  text: string;
  type?: "primary" | "secondary";
}

export interface ImageConfig {
  src: string;
  alt: string;
}

export interface BadgeConfig {
  src: string;
  alt: string;
}

export interface TopBanner {
  isVisible: boolean;
  text: string;
  linkText: string;
  linkUrl: string;
}

export interface Hero {
  tagline: string;
  title: {
    highlight: string;
    subtitle: string;
  };
  description: string;
  primaryButton: ButtonConfig;
  image: ImageConfig;
}

export interface AboutUs {
  sectionTag: string;
  title: string;
  description: string;
  badge: BadgeConfig;
  primaryButton: ButtonConfig;
  subtitle: string;
  image: ImageConfig;
}

export interface OurStays {
  sectionTag: string;
  title: string;
  title2: string;
  description: string;
}

export interface FeaturedStays {
  title: string;
  description: string;
  primaryButton: ButtonConfig;
}

export interface SignatureSection {
  title: string;
  description: string;
  items: SignatureItems[];
}

export interface SignatureItems {
  title: string;
  description: string;
}

export interface PolicyPages {
  privacyPolicy: string;
  termsAndConditions: string;
  cookiePolicy: string;
}

export interface SignatureExperiencesClub {
  name: string;
  tagline: string;
  title: string;
  description: string;
  buttons: ButtonConfig[];
}

export interface SignatureExperiences {
  sectionTag: string;
  title: string;
  description: string;
  club: SignatureExperiencesClub;
  images: ImageConfig[];
  badge: BadgeConfig;
}

export interface GravityBar {
  sectionTag: string;
  title: string;
  description: string;
  name: string;
  image: ImageConfig;
  buttons: ButtonConfig[];
  badge: BadgeConfig;
}

export interface Restaurant {
  name: string;
  sectionTag: string;
  title: string;
  description: string;
  buttons: ButtonConfig[];
  images: ImageConfig[];
  badge: BadgeConfig;
}

export interface Gallery {
  sectionTag: string;
  title: string;
  images: ImageConfig[];
  buttons: ButtonConfig[];
}

export interface SEO {
  title: string;
  description: string;
  keywords: string;
}

export interface TestimonialItem {
  name: string;
  location: string;
  avatar: string;
  testimonial: string;
  rating?: number;
}

export interface Testimonials {
  sectionTag: string;
  title: string;
  items: TestimonialItem[];
}

export interface HomePageContent {
  topBanner: TopBanner;
  hero: Hero;
  aboutUs: AboutUs;
  ourStays: OurStays;
  featuredStays: FeaturedStays;
  signatureSection: SignatureSection;
  signatureExperiences: SignatureExperiences;
  gravityBar: GravityBar;
  restaurant: Restaurant;
  gallery: Gallery;
  seo: SEO;
  policyPages: PolicyPages;
}

export interface PublicHomePageContent extends HomePageContent {
  testimonials: Testimonials;
}

// Database model type
export interface HomepageContentRecord {
  id: number;
  content: string; // JSON string
  version: number;
  isPublished: number;
  createdAt: string;
  updatedAt: string;
}
