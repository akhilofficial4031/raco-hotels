import type { DatabaseAmenity } from "./amenity.interface";
import type { Attraction } from "./attraction.interface";
import type {
  BaseEntity,
  AddressInfo,
  GeoCoordinates,
  ContactInfo,
  BaseFilters,
  ActiveStatusFilter,
  DatabaseMediaReference,
} from "./common.interface";
import type { DatabaseFeature } from "./feature.interface";

/**
 * Database representation of a hotel
 */
export interface DatabaseHotel
  extends BaseEntity,
    AddressInfo,
    GeoCoordinates,
    ContactInfo {
  name: string;
  slug: string | null;
  tagline: string | null;
  aboutTitle: string | null;
  aboutSubtitle: string | null;
  aboutDescription: string | null;
  aboutStatement: string | null;
  description: string | null;
  timezone: string | null;
  starRating: number | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  locationInfo: LocationInfoSection[] | null;
  signature: HotelSignature | null;
  isActive: number;
}

/**
 * Image reference for location info sections
 */
export interface LocationInfoImage {
  url: string;
  alt?: string | null;
}

/**
 * Location information section for hotel details
 */
export interface LocationInfoSection {
  heading: string;
  subHeading?: string | null;
  bulletPoints?: string[] | null;
  description?: string | null;
  images?: LocationInfoImage[] | null;
}

/**
 * Hotel signature item
 */
export interface HotelSignatureItem {
  title: string;
  description: string;
}

/**
 * Hotel signature experiences
 */
export interface HotelSignature {
  title: string;
  description: string;
  items: HotelSignatureItem[];
}

/**
 * Filters for querying hotels
 */
export interface HotelFilters extends BaseFilters, ActiveStatusFilter {
  city?: string;
  state?: string;
  countryCode?: string;
  starRating?: number;
  minStarRating?: number;
  maxStarRating?: number;
}

/**
 * Data required to create a new hotel
 */
export interface CreateHotelData
  extends Partial<AddressInfo>,
    Partial<GeoCoordinates>,
    Partial<ContactInfo> {
  name: string;
  slug?: string | null;
  tagline?: string | null;
  aboutTitle?: string | null;
  aboutSubtitle?: string | null;
  aboutDescription?: string | null;
  aboutStatement?: string | null;
  description?: string | null;
  timezone?: string | null;
  starRating?: number | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  locationInfo?: LocationInfoSection[] | null;
  signature?: HotelSignature | null;
  isActive?: number;
}

/**
 * Data that can be updated for a hotel
 */
export interface UpdateHotelData extends Partial<CreateHotelData> {}

/**
 * Database representation of a hotel image
 */
export interface DatabaseHotelImage extends DatabaseMediaReference {
  hotelId: number;
}

/**
 * Data required to create a new hotel image
 */
export interface CreateHotelImageData {
  hotelId: number;
  url: string;
  alt?: string | null;
  sortOrder?: number;
}

/**
 * Extended hotel with all related data for detailed views
 */
export interface DatabaseHotelWithRelations extends DatabaseHotel {
  images: DatabaseHotelImage[];
  features: DatabaseFeature[];
  amenities: DatabaseAmenity[];
  attractions: Attraction[];
}
