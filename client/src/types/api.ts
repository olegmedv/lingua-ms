export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Language {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isPublished: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  order: number;
  passThreshold: number;
}

export interface Exercise {
  id: string;
  type: number;
  contentJson: string;
  audioUrl: string | null;
  order: number;
}

export interface Progress {
  lessonId: string;
  completed: boolean;
  score: number;
}

export interface Stats {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  completedLessons: number;
}
