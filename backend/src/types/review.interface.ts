export interface DatabaseReview {
  id: number;
  hotelId: number;
  userId: number | null;
  bookingId: number | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: string;
  createdAt: string;
  publishedAt: string | null;
}
