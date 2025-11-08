import { relations } from "drizzle-orm";

import { roomType } from "./room_type";
import { roomTypeImage } from "./room_type_image";

export const roomTypeRelations = relations(roomType, ({ many }) => ({
  images: many(roomTypeImage),
}));

export const roomTypeImageRelations = relations(roomTypeImage, ({ one }) => ({
  roomType: one(roomType, {
    fields: [roomTypeImage.roomTypeId],
    references: [roomType.id],
  }),
}));
