export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'student';
  username?: string;
  grade?: string;
  parentPhone?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  maxScore: number;
  createdAt: string;
  createdBy: string;
  imageUrl?: string;
  imageUrls?: string[];
}

export interface TheoryBlock {
  id: string;
  title: string;
  content: string;
  images: string[];
  createdAt: string;
  createdBy: string;
}

export interface Student {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  grade: string;
  parentPhone: string;
  averageScore: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submittedAt: string;
  score: number | null;
  feedback: string | null;
  status: 'pending' | 'graded';
}