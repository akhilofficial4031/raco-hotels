export interface DatabaseAmenity {
  id: number;
  name: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAmenityData extends Partial<DatabaseAmenity> {
  name: string;
}

export interface UpdateAmenityData extends Partial<DatabaseAmenity> {
  name: string;
}
