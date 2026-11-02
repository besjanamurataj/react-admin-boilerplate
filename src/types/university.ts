export interface UniversityRequest {
  name: string;
  code: string;
  city: string;
  email: string;
}

export interface University {
  id: number;
  name: string;
  code: string;
  city: string;
  email: string;
}
export interface UniversityResponse {
  content: University[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
