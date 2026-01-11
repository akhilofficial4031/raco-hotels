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
  image: ImageConfig;
}

export interface OurStays {
  sectionTag: string;
  title: string;
  description: string;
}

export interface FeaturedStays {
  title: string;
  description: string;
  primaryButton: ButtonConfig;
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

export interface SignatureItems {
  title: string;
  description: string;
}

export interface SignatureSection {
  title: string;
  description: string;
  items: SignatureItems[];
}

export interface SEO {
  title: string;
  description: string;
  keywords: string;
}

export interface PolicyPages {
  privacyPolicy: string;
  termsAndConditions: string;
  cookiePolicy: string;
}

export interface HomePageContent {
  topBanner: TopBanner;
  hero: Hero;
  aboutUs: AboutUs;
  ourStays: OurStays;
  featuredStays: FeaturedStays;
  signatureExperiences: SignatureExperiences;
  gravityBar: GravityBar;
  restaurant: Restaurant;
  gallery: Gallery;
  signatureSection: SignatureSection;
  seo: SEO;
  policyPages: PolicyPages;
}
