export interface DatabaseFeature {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isVisible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureData extends Partial<DatabaseFeature> {
  name: string;
}

export interface UpdateFeatureData extends Partial<DatabaseFeature> {
  name: string;
}
