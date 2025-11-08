import { relations } from "drizzle-orm";

import { hotel } from "./hotel";
import { roomType } from "./room_type";
import { roomTypeImage } from "./room_type_image";

export const roomTypeRelations = relations(roomType, ({ many, one }) => ({
  images: many(roomTypeImage),
  hotel: one(hotel, {
    fields: [roomType.hotelId],
    references: [hotel.id],
  }),
}));

export const hotelRelations = relations(hotel, ({ many }) => ({
  roomTypes: many(roomType),
}));

export const roomTypeImageRelations = relations(roomTypeImage, ({ one }) => ({
  roomType: one(roomType, {
    fields: [roomTypeImage.roomTypeId],
    references: [roomType.id],
  }),
}));
