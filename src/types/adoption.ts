// src/types/adoption.ts
export interface Adoption {
  id?: number;
  animal_id: number;
  organisation_id: number;
  desc?: string;
  status: "available" | "adopted";
  created_at?: string;
}

export interface CreateAdoptionPayload {
  animal_id: number;
  organisation_id: number;
  desc: string;
  status: "available" | "adopted";
}
