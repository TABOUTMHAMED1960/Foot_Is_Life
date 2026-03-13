export interface UserStats {
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  lastSessionDate: Date | null;
  mostFrequentDefects: string[];
  priorityAxes: string[];
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
  stats: UserStats;
}

export function createDefaultStats(): UserStats {
  return {
    totalSessions: 0,
    averageScore: 0,
    bestScore: 0,
    lastSessionDate: null,
    mostFrequentDefects: [],
    priorityAxes: [],
  };
}
