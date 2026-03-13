import { useMemo } from 'react';
import { Session } from '@/src/types/session';
import { useAuthStore } from '@/src/stores/authStore';

export interface ProgressionPoint {
  date: Date;
  score: number;
  label: string;
}

export function usePlayerStats(sessions: Session[]) {
  const user = useAuthStore((s) => s.user);

  const stats = useMemo(() => {
    const completed = sessions.filter(
      (s) => s.status === 'completed' && s.analysis
    );

    const scores = completed.map((s) => s.analysis!.globalScore);
    const totalSessions = completed.length;
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lastSessionDate =
      completed.length > 0 ? completed[0].createdAt : null;

    // Défauts les plus fréquents
    const defectCounts = new Map<string, number>();
    for (const session of completed) {
      for (const defect of session.analysis?.defects ?? []) {
        defectCounts.set(defect.label, (defectCounts.get(defect.label) || 0) + 1);
      }
    }
    const mostFrequentDefects = [...defectCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label]) => label);

    // Progression dans le temps
    const progression: ProgressionPoint[] = completed
      .slice()
      .reverse()
      .map((s, i) => ({
        date: s.createdAt,
        score: s.analysis!.globalScore,
        label: `S${i + 1}`,
      }));

    // Tendance (dernières 3 séances vs précédentes 3)
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (scores.length >= 4) {
      const recent = scores.slice(0, 3);
      const older = scores.slice(3, 6);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      if (recentAvg > olderAvg + 3) trend = 'up';
      else if (recentAvg < olderAvg - 3) trend = 'down';
    }

    return {
      totalSessions,
      averageScore,
      bestScore,
      lastSessionDate,
      mostFrequentDefects,
      priorityAxes: mostFrequentDefects.slice(0, 2),
      progression,
      trend,
    };
  }, [sessions]);

  return {
    ...stats,
    displayName: user?.displayName || 'Joueur',
    email: user?.email || '',
    memberSince: user?.createdAt || new Date(),
  };
}
