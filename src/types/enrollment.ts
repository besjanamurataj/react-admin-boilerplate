export interface EnrollmentRequest {
  enrollmentDate: string;
  universityId: number;
  departmentId: number;
  studentId: number;
};

export interface EnrollmentResponse {
  id: number;
  enrollmentDate: string;

  universityId: number;
  universityName: string;

  departmentId: number;
  departmentName: string;

  studentId: number;
  studentFirstName: string;
  studentLastName: string;
};

export type BatchEnrollmentRequest = {
  departmentId: number;
  enrollmentDate:  string;
};

export type BatchEnrollmentResponse = {
  departmentId: number;
  departmentName: string;
  universityId: number;
  universityName: string;
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  alreadyEnrolled: number;
  successfullyEnrolled: number;
  failed: number;
}
