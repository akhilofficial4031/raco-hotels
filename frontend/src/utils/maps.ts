/**
 * Utility functions for Google Maps integration
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Extracts latitude and longitude from various Google Maps URL formats
 * Supports:
 * - google.com/maps/@lat,lng,zoom
 * - google.com/maps?q=lat,lng
 * - google.com/maps/place/Name/@lat,lng
 * - google.com/maps/dir//lat,lng
 * - Plus codes and place URLs
 */
export function extractCoordinatesFromMapsUrl(url: string): Coordinates | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    // Clean the URL and handle various formats
    const cleanUrl = url.trim();

    // Pattern 1: Direct coordinates in URL like @lat,lng,zoom or ?q=lat,lng
    const directCoordsRegex = /[@?q=](-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const directMatch = cleanUrl.match(directCoordsRegex);

    if (directMatch) {
      const lat = parseFloat(directMatch[1]);
      const lng = parseFloat(directMatch[2]);

      if (isValidCoordinate(lat, lng)) {
        return { latitude: lat, longitude: lng };
      }
    }

    // Pattern 2: 3d coordinates like !3d-122.4194!4d37.7749
    const coord3dRegex = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/;
    const coord3dMatch = cleanUrl.match(coord3dRegex);

    if (coord3dMatch) {
      const lng = parseFloat(coord3dMatch[1]);
      const lat = parseFloat(coord3dMatch[2]);

      if (isValidCoordinate(lat, lng)) {
        return { latitude: lat, longitude: lng };
      }
    }

    // Pattern 3: data parameter with coordinates
    const dataRegex = /!2d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/;
    const dataMatch = cleanUrl.match(dataRegex);

    if (dataMatch) {
      const lng = parseFloat(dataMatch[1]);
      const lat = parseFloat(dataMatch[2]);

      if (isValidCoordinate(lat, lng)) {
        return { latitude: lat, longitude: lng };
      }
    }

    // If no patterns match, return null
    return null;
  } catch (error) {
    console.error("Error parsing Google Maps URL:", error);
    return null;
  }
}

/**
 * Generates a Google Maps URL from latitude and longitude coordinates
 */
export function generateGoogleMapsUrl(
  latitude: number,
  longitude: number,
): string {
  if (!isValidCoordinate(latitude, longitude)) {
    throw new Error("Invalid coordinates provided");
  }

  return `https://www.google.com/maps/@${latitude},${longitude},15z`;
}

/**
 * Validates if the provided coordinates are within valid ranges
 */
function isValidCoordinate(latitude: number, longitude: number): boolean {
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Validates if a string is a valid Google Maps URL (not shortened)
 */
export function isValidGoogleMapsUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  const mapsUrlRegex =
    /^https?:\/\/(www\.)?(google\.(com|[a-z]{2,3}(\.[a-z]{2})?)|maps\.google\.(com|[a-z]{2,3}(\.[a-z]{2})?))\/(maps|url)/i;

  return mapsUrlRegex.test(url.trim());
}

/**
 * Detects if a URL is a shortened Google Maps URL
 */
export function isShortenedGoogleMapsUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  const shortenedUrlPatterns = [
    /^https?:\/\/(www\.)?goo\.gl\//i,
    /^https?:\/\/maps\.app\.goo\.gl\//i,
    /^https?:\/\/g\.co\/maps\//i,
    /^https?:\/\/maps\.google\.com\/\w+/i, // Some shortened formats from Google
  ];

  return shortenedUrlPatterns.some((pattern) => pattern.test(url.trim()));
}

/**
 * Gets a user-friendly error message for invalid maps URLs
 */
export function getMapsUrlErrorMessage(url: string): string {
  if (!url || url.trim() === "") {
    return "Please enter a Google Maps URL";
  }

  // Check if it's a shortened URL first
  if (isShortenedGoogleMapsUrl(url)) {
    return "Shortened URLs like goo.gl or maps.app.goo.gl cannot be processed. Please get the full URL: Open this link → Click Share → Copy the full URL that starts with google.com/maps";
  }

  if (!isValidGoogleMapsUrl(url)) {
    return "Please enter a valid Google Maps URL (e.g., https://www.google.com/maps/@37.7749,-122.4194,15z)";
  }

  const coords = extractCoordinatesFromMapsUrl(url);
  if (!coords) {
    return "Could not extract coordinates from this Google Maps URL. Please try copying the URL from the address bar after opening the location.";
  }

  return "";
}

/**
 * Gets detailed instructions for getting the correct Google Maps URL
 */
export function getGoogleMapsUrlInstructions(): string {
  return `To get the correct Google Maps URL:
1. Open Google Maps on your computer
2. Search for or navigate to your location
3. Copy the URL from the address bar (it should look like: https://www.google.com/maps/@37.7749,-122.4194,15z)

Or from a shared link:
1. Click on the shortened link to open it
2. Once it opens in Google Maps, copy the URL from the address bar
3. Paste that full URL here`;
}
