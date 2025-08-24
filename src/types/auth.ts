// src/types/auth.ts
export interface OrgRegisterPayload { 
  name: string; 
  type: string; 
  password: string; 
  verification_code?: string;
}

export interface LoginPayload {
  name: string;
  password: string;
}

export interface AuthResponse { 
  token: string; 
  user: { 
    id: number; 
    name: string; 
    org_id?: number;
  };
}

export interface OrgRegisterResponse {
  org_id: number;
  name: string;
  type: string;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  org_id?: number;
}
