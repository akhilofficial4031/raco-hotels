export interface DatabaseContentBlock {
  id: number;
  hotelId: number | null;
  page: string;
  section: string;
  title: string | null;
  body: string | null;
  mediaUrl: string | null;
  sortOrder: number;
  isVisible: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentBlockData extends Partial<DatabaseContentBlock> {
  page: string;
  section: string;
}

export type UpdateContentBlockData = Partial<CreateContentBlockData>;
