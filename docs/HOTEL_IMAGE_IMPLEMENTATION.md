# Hotel Image Upload Implementation

This document describes the complete implementation of hotel image upload functionality using Cloudflare R2 storage.

## Implementation plan (final)

1. Storage binding
   - Bind Cloudflare R2 bucket as `R2_BUCKET` in `backend/wrangler.toml`.
   - Expose a public base URL via `R2_PUBLIC_BASE_URL` to generate CDN/public links.
2. URL strategy
   - We do not store signed URLs in DB. We store permanent public URLs based on a configured base, e.g. `https://pub-<id>.r2.dev` or a custom domain.
3. Upload pathing
   - Object key pattern: `hotels/{hotelId}/images/{timestamp}-{sanitizedName}{ext}`.
4. Backend flow
   - Controller parses `multipart/form-data` and forwards `File` objects plus `R2_PUBLIC_BASE_URL` to the service.
   - Service validates type/size, uploads to R2 using streaming, then persists URL and metadata via repository.
5. Database
   - Store image rows in `hotelImage` with `url`, `alt`, `sortOrder`, timestamps.
6. Limits and validation
   - Allowed MIME types: JPEG, PNG, WebP. Max 10MB per file.
7. Deletion
   - Delete by extracting the key from the stored URL and removing both from R2 and DB.

## What changed in code

- `R2Service.uploadImage(r2Bucket, file, hotelId, publicBaseUrl)`
  - Streams uploads: `r2Bucket.put(key, file.stream(), { httpMetadata, customMetadata })`.
  - Builds public URL using `publicBaseUrl` (no trailing slash) or falls back to `r2://{key}` if unset.
- `HotelController` now forwards `c.env.R2_PUBLIC_BASE_URL` to `HotelService` for create/update/add image flows.
- `HotelService` passes `publicBaseUrl` through to `R2Service`.
- `AppBindings` includes optional `R2_PUBLIC_BASE_URL`.
- `wrangler.toml` includes `[vars] R2_PUBLIC_BASE_URL = ""`.

## Overview

The implementation adds comprehensive image management capabilities to the hotel system, including:

- Image upload to Cloudflare R2 storage
- Image metadata storage in the database
- CRUD operations for hotel images
- Support for multiple images per hotel
- Image sort ordering
- Multipart form data handling

## Architecture

### Database Schema

The `hotelImage` table stores image metadata:

```sql
CREATE TABLE hotel_image (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_id INTEGER NOT NULL REFERENCES hotel(id) ON DELETE CASCADE ON UPDATE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Key Components

1. **R2Service** (`src/services/r2.service.ts`)
   - Handles file uploads to Cloudflare R2
   - Validates file types and sizes
   - Manages file deletion
   - Generates public URLs

2. **HotelRepository** (`src/repositories/hotel.repository.ts`)
   - Database operations for hotel images
   - CRUD operations with proper relationships

3. **HotelService** (`src/services/hotel.service.ts`)
   - Business logic for hotel and image operations
   - Coordinates between R2 and database operations

4. **HotelController** (`src/controllers/hotel.controller.ts`)
   - HTTP request handling
   - Multipart form data processing
   - API endpoint implementations

## API Endpoints

### Hotel with Images

#### GET `/api/hotels/{id}/with-images`

Retrieve a hotel with all its images.

**Response:**

```json
{
  "success": true,
  "data": {
    "hotel": {
      "id": 1,
      "name": "Raco Grand",
      "images": [
        {
          "id": 1,
          "hotelId": 1,
          "url": "https://your-domain.com/hotels/1/images/photo.jpg",
          "alt": "Hotel exterior",
          "sortOrder": 0,
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  }
}
```

#### POST `/api/hotels/with-images`

Create a hotel with images using multipart form data.

**Request Format:**

- `Content-Type: multipart/form-data`
- `hotelData`: JSON string containing hotel information
- `images[]`: Image files (multiple)

**Example:**

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "hotelData={\"name\":\"New Hotel\",\"city\":\"San Francisco\"}" \
  -F "images[]=@photo1.jpg" \
  -F "images[]=@photo2.jpg" \
  http://localhost:8787/api/hotels/with-images
```

#### PUT `/api/hotels/{id}/with-images`

Update a hotel and optionally add/replace images.

**Request Format:**

- `Content-Type: multipart/form-data`
- `hotelData`: JSON string with hotel updates
- `replaceImages`: "true" to replace all existing images, "false" to append
- `images[]`: Image files (optional)

### Image Management

#### GET `/api/hotels/{id}/images`

Get all images for a specific hotel.

#### POST `/api/hotels/{id}/images`

Add a single image to a hotel.

**Request Format:**

- `Content-Type: multipart/form-data`
- `image`: Image file
- `alt`: Alt text (optional)

#### DELETE `/api/hotels/images/{imageId}`

Delete a specific image.

#### PATCH `/api/hotels/images/{imageId}/sort-order`

Update image sort order.

**Request Body:**

```json
{
  "sortOrder": 1
}
```

## Configuration

### Environment Setup

1. **R2 Bucket Binding**
   Add to your `wrangler.toml`:

   ```toml
   [[r2_buckets]]
   binding = "R2_BUCKET"
   bucket_name = "your-hotel-images-bucket"
   ```

2. **R2 Public URL Configuration**
   Set the public base URL used for generating image links:
   - In `backend/wrangler.toml`:

     ```toml
     [vars]
     # No trailing slash
     R2_PUBLIC_BASE_URL = "https://pub-<bucket-id>.r2.dev"
     ```

   - Or in `backend/.env` for local dev:
     ```env
     R2_PUBLIC_BASE_URL=https://pub-<bucket-id>.r2.dev
     ```

### File Validation

- **Allowed types**: JPEG, PNG, WebP
- **Maximum size**: 10MB per file
- **Naming**: Files are automatically renamed with timestamps and sanitized names

## Usage Examples

### Creating a Hotel with Images

```typescript
// Frontend code example
const formData = new FormData();
formData.append(
  'hotelData',
  JSON.stringify({
    name: 'Grand Hotel',
    city: 'San Francisco',
    description: 'Luxury hotel in downtown',
  }),
);

// Add multiple images
formData.append('images[]', file1);
formData.append('images[]', file2);

const response = await fetch('/api/hotels/with-images', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

### Adding a Single Image

```typescript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('alt', 'Hotel lobby view');

const response = await fetch(`/api/hotels/${hotelId}/images`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

## Error Handling

The implementation includes comprehensive error handling:

- **File validation errors**: Invalid type, size too large
- **Hotel not found**: When adding images to non-existent hotel
- **R2 upload failures**: Network issues, bucket permissions
- **Database errors**: Constraint violations, connection issues

## Security Considerations

1. **File Type Validation**: Only allows specific image types
2. **File Size Limits**: Prevents large file uploads
3. **Authentication Required**: All endpoints require valid JWT tokens
4. **RBAC Integration**: Uses existing permission system
5. **CSRF Protection**: Enabled for state-changing operations

## Performance Notes

1. **Concurrent Uploads**: Multiple images are uploaded sequentially to avoid overwhelming R2
2. **Error Resilience**: Individual image upload failures don't affect other images
3. **Efficient Deletion**: Batch operations for deleting multiple images
4. **Optimized Queries**: Proper indexing on hotel_id for image lookups

## Testing

### Manual Testing with cURL

````bash
# Create hotel with images
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -F "hotelData={\"name\":\"Test Hotel\"}" \
  -F "images[]=@test1.jpg" \
  -F "images[]=@test2.png" \
  http://localhost:8787/api/hotels/with-images

# Get hotel with images
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8787/api/hotels/1/with-images

# Add single image
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@new-photo.jpg" \
  -F "alt=New hotel photo" \
  http://localhost:8787/api/hotels/1/images

## Production release checklist and next steps

1. Create R2 bucket
   - In Cloudflare Dashboard → R2 → Create bucket, e.g. `hotel-images`.
2. Decide public access strategy
   - Public bucket (simplest): enable public access; note the `r2.dev` public URL.
   - Private bucket (recommended for sensitive data): keep private and serve via a custom Worker route that enforces auth or signed URLs.
3. Configure a public domain
   - Use the generated `https://pub-<bucket-id>.r2.dev` or map a custom domain via Cloudflare to your bucket path.
4. CORS rules for object access
   - In R2 bucket settings, add CORS rules (e.g. allow GET from your frontend origin) if accessing images from browsers.
5. Set runtime variables
   - In `wrangler.toml` production environment:
     ```toml
     [env.production.vars]
     R2_PUBLIC_BASE_URL = "https://assets.your-domain.com"
     ```
   - Redeploy Workers to apply.
6. Access credentials (optional)
   - If you need out-of-band uploads (e.g., migrations/CI), create R2 S3 access keys:
     - R2 → Manage R2 API Tokens → Create Access Key → choose least-privilege permissions (Read or Write) and scope to the bucket.
     - Store `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` in your CI/secret manager.
   - For Cloudflare API (account-level) automation, create an API Token with R2 permissions and restrict the scope.
   - Note: Worker-bound uploads via `R2_BUCKET` do not require keys.
7. Size limits and validation
   - Confirm 10MB max per file is acceptable; adjust limit in `R2Service` if needed.
8. Observability
   - Ensure logs/alerts for upload failures; consider retries and dead-letter strategies if you later batch upload.
9. Compliance, backups, and lifecycle
   - Optionally configure lifecycle rules (e.g., transition or delete old images) and backups per your data policy.
10. Security review
   - Ensure only expected MIME types are accepted; consider content scanning.
   - If keeping buckets private, implement a secure delivery path (signed URLs or authenticated Worker route).

## Notes on presigned URLs

We currently do not generate presigned URLs. Uploads are handled by the backend Worker using the `R2_BUCKET` binding. If presigned uploads are required later, we will add a dedicated endpoint to mint time-limited S3-compatible presigned URLs using R2 access keys and adjust the frontend to upload directly to R2.
````

## Troubleshooting

### Common Issues

1. **R2 Upload Failures**
   - Check bucket permissions
   - Verify R2 binding configuration
   - Ensure bucket exists

2. **Image URLs Not Working**
   - Update public URL pattern in R2Service
   - Configure custom domain or public bucket access

3. **File Type Rejected**
   - Ensure file has correct MIME type
   - Check file extension matches content

4. **Permission Denied**
   - Verify JWT token is valid
   - Check user has required permissions (HOTELS_CREATE, HOTELS_UPDATE, etc.)

## Future Enhancements

1. **Image Optimization**: Automatic resizing and format conversion
2. **CDN Integration**: Use Cloudflare Images for optimization
3. **Thumbnail Generation**: Create multiple sizes for responsive images
4. **Image Validation**: Advanced content validation and security scanning
5. **Bulk Operations**: Batch upload and management capabilities
