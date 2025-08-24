// src/types/emergency.ts
export interface Emergency {
  id: number;
  title: string;
  lat: number;
  lng: number;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  created_at: string;
  photo_url?: string;
}
