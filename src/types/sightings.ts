// src/types/sightings.ts
export interface Sighting {
  id?: number;
  mission_id?: number;
  reporter?: { 
    id: number; 
    name: string; 
    points?: number; 
    avatar_url?: string;
  };
  type?: string;
  status?: "active" | "resolved" | "sterilized";
  location: { lat: number; lng: number };
  timestamp: string; // ISO
  photo_url?: string | null;
  notes?: string;
}

export interface CreateSightingPayload {
  name: string;
  location: { lat: number; lng: number };
  photo_url: string | null;
  notes: string;
  last_seen: string; // ISO
  status: "active" | "sterilized";
  associate_drive: number | null;
}

export interface CreateEventPayload {
  type: "sighting" | "sterilization" | "tagging";
  location: { lat: number; lng: number };
  timestamp: string; // ISO
  photo_url: string | null;
  notes: string;
  associate_drive: boolean;
}
