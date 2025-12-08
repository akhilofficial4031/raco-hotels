# Attractions Feature - Updates & Final Implementation

## ✅ Migration File

The database migration **already exists** at:

- `backend/drizzle/migrations/0006_supreme_betty_ross.sql`

**To apply:**

```bash
cd backend
yarn db:migrate:apply        # Local
yarn db:migrate:apply:prod   # Production
```

## ✅ Image Handling - R2 Bucket Integration

### How It Works

#### Frontend (User Experience)

1. **Single Image Upload** (Hero section):
   - User selects one image
   - Converted to base64
   - Sent to backend

2. **Multiple Image Upload** (About, Carousel, Feature, Gallery):
   - User selects **multiple images at once** using file picker
   - All images converted to base64
   - Grid preview of all selected images
   - Individual delete buttons on each image
   - Sent to backend as array

#### Backend (R2 Processing)

1. **Attraction Service** (`backend/src/services/attraction.service.ts`):
   - Detects base64 images in content
   - Uploads each to R2 bucket under `attractions/{slug}/` paths
   - Replaces base64 with R2 URLs (format: `r2://path/to/image.jpg`)
   - Automatic rollback if any upload fails

2. **Image Paths in R2**:

   ```
   attractions/{slug}/hero/{timestamp}.jpg
   attractions/{slug}/about/0.jpg
   attractions/{slug}/about/1.jpg
   attractions/{slug}/carousel/0.jpg
   attractions/{slug}/feature/0.jpg
   attractions/{slug}/gallery/0.jpg
   attractions/{slug}/gallery/1.jpg
   ```

3. **Error Handling**:
   - If any image upload fails, all uploaded images are deleted (rollback)
   - Original error is thrown to client

#### Display

- URLs with `r2://` prefix converted to full public URLs
- Direct URLs used as-is

### Benefits Over Previous Approach

✅ **Images stored in R2, not as base64 in database**
✅ **Multiple file selection** - better UX, saves time
✅ **Grid preview** - see all images at once
✅ **Individual deletion** - remove specific images
✅ **Automatic rollback** - atomic operation
✅ **Organized storage** - images grouped by attraction slug

## New Files Created

### Backend

- ✅ `backend/src/services/attraction.service.ts` - **NEW**
  - Handles R2 image processing
  - Converts base64 to R2 uploads
  - Atomic operations with rollback

### Frontend (Updated)

- ✅ `frontend/src/features/attractions/components/AttractionContentForm.tsx` - **UPDATED**
  - Multiple file selection for image arrays
  - Grid preview with delete buttons
  - Better user experience

### Backend (Updated)

- ✅ `backend/src/controllers/attraction.controller.ts` - **UPDATED**
  - Uses AttractionService instead of Repository directly
  - Passes R2 bucket and public URL to service

## Key Differences from Initial Implementation

| Feature            | Initial              | Updated                |
| ------------------ | -------------------- | ---------------------- |
| Image Storage      | Base64 in DB         | R2 Bucket              |
| Multiple Images    | Add button per image | Multi-select upload    |
| Image Preview      | Individual cards     | Grid with delete       |
| Backend            | Direct repository    | Service layer with R2  |
| Error Handling     | Basic                | Rollback on failure    |
| Image Organization | Flat in content      | Structured paths in R2 |

## Testing the Feature

### 1. Create Attraction

```
1. Navigate to /attractions
2. Click "Add" button
3. Fill in:
   - Name: "Historic Downtown Tour"
   - Hotel: Select from dropdown
   - Slug: (auto-generated)
4. Switch to "Content" tab
5. Fill in hero section
6. Upload hero image (single)
7. Add marquee texts
8. Fill about section
9. Click "Upload" and select multiple images for About section
10. Repeat for Carousel, Feature, Gallery sections
11. Add reviews
12. Click "Create Attraction"
```

### 2. Verify R2 Upload

```
1. Check R2 bucket
2. Verify images are at: attractions/{slug}/...
3. Check database - content should have r2:// URLs, not base64
```

### 3. Edit Attraction

```
1. Click edit on existing attraction
2. Existing images should display in grid
3. Can add more images (select multiple)
4. Can delete individual images
5. Changes saved to R2
```

### 4. View Images

```
1. On display, r2:// URLs should convert to full public URLs
2. Images should load correctly
```

## API Examples

### Create Attraction

```json
POST /api/attractions
{
  "hotelId": 1,
  "name": "Historic Downtown",
  "slug": "historic-downtown",
  "content": {
    "hero": {
      "title": "Explore Historic Downtown",
      "subtitle": "A journey through time",
      "imageUrl": "data:image/jpeg;base64,/9j/4AAQ..." // Base64
    },
    "marqueeTexts": ["Historic", "Cultural", "Vibrant"],
    "aboutSection": {
      "title": "About the Tour",
      "description": "Experience the rich history...",
      "subtext": ["2 hours", "Walking tour"],
      "buttons": [{"text": "Book Now", "type": "primary", "action": "/book"}],
      "images": [
        "data:image/jpeg;base64,/9j/4AAQ...", // Multiple base64 images
        "data:image/jpeg;base64,/9j/4AAQ...",
        "data:image/jpeg;base64,/9j/4AAQ..."
      ]
    },
    ...
  }
}
```

### Response (After R2 Processing)

```json
{
  "success": true,
  "data": {
    "attraction": {
      "id": 1,
      "hotelId": 1,
      "name": "Historic Downtown",
      "slug": "historic-downtown",
      "content": {
        "hero": {
          "title": "Explore Historic Downtown",
          "subtitle": "A journey through time",
          "imageUrl": "r2://attractions/historic-downtown/hero/1234567890.jpg"
        },
        "aboutSection": {
          ...
          "images": [
            "r2://attractions/historic-downtown/about/0.jpg",
            "r2://attractions/historic-downtown/about/1.jpg",
            "r2://attractions/historic-downtown/about/2.jpg"
          ]
        },
        ...
      }
    }
  }
}
```

## Environment Variables Required

Make sure your backend has these set:

```
R2_BUCKET=your-bucket-name
R2_PUBLIC_BASE_URL=https://pub-xxxxx.r2.dev
```

## Notes

1. **No Package Changes** - All dependencies already exist
2. **Follows Homepage Pattern** - Uses exact same R2 service
3. **Migration Exists** - No need to create migration
4. **Type Safe** - Full TypeScript support
5. **Error Handling** - Automatic rollback on failures
6. **Organized** - Images stored in logical paths
7. **User Friendly** - Multi-select makes bulk uploads easy

## Summary

The attractions feature is **complete and production-ready** with:

- ✅ R2 bucket integration for image storage
- ✅ Multiple file selection for better UX
- ✅ Service layer for business logic
- ✅ Atomic operations with rollback
- ✅ Migration file exists
- ✅ Full CRUD operations
- ✅ Permission system integrated
- ✅ OpenAPI documentation
