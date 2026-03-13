import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Session, SessionStatus } from '@/src/types/session';
import { UserStats } from '@/src/types/user';
import { AnalysisResult } from '@/src/types/analysis';

// --- Sessions ---

function sessionToFirestore(session: Session): Record<string, any> {
  return {
    ...session,
    createdAt: Timestamp.fromDate(session.createdAt),
    videos: {
      front: session.videos.front
        ? {
            ...session.videos.front,
            uploadedAt: session.videos.front.uploadedAt
              ? Timestamp.fromDate(session.videos.front.uploadedAt)
              : null,
          }
        : null,
      back: session.videos.back
        ? {
            ...session.videos.back,
            uploadedAt: session.videos.back.uploadedAt
              ? Timestamp.fromDate(session.videos.back.uploadedAt)
              : null,
          }
        : null,
    },
    analysis: session.analysis
      ? {
          ...session.analysis,
          analyzedAt: Timestamp.fromDate(session.analysis.analyzedAt),
        }
      : null,
  };
}

function sessionFromFirestore(data: Record<string, any>): Session {
  return {
    id: data.id,
    userId: data.userId,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    status: data.status,
    videos: {
      front: data.videos?.front
        ? {
            ...data.videos.front,
            uploadedAt: data.videos.front.uploadedAt?.toDate?.() ?? undefined,
          }
        : null,
      back: data.videos?.back
        ? {
            ...data.videos.back,
            uploadedAt: data.videos.back.uploadedAt?.toDate?.() ?? undefined,
          }
        : null,
    },
    analysis: data.analysis
      ? {
          ...data.analysis,
          analyzedAt: data.analysis.analyzedAt?.toDate?.() ?? new Date(),
        }
      : null,
  };
}

export async function createSession(session: Session): Promise<void> {
  await setDoc(doc(db, 'sessions', session.id), sessionToFirestore(session));
}

export async function deleteSessionDoc(sessionId: string): Promise<void> {
  await deleteDoc(doc(db, 'sessions', sessionId));
}

export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus
): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), { status });
}

export async function updateSessionAnalysis(
  sessionId: string,
  analysis: AnalysisResult
): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), {
    status: 'completed' as SessionStatus,
    analysis: {
      ...analysis,
      analyzedAt: Timestamp.fromDate(analysis.analyzedAt),
    },
  });
}

export async function updateSessionVideoUrl(
  sessionId: string,
  angle: 'front' | 'back',
  url: string
): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), {
    [`videos.${angle}.uri`]: url,
    [`videos.${angle}.uploadedAt`]: Timestamp.now(),
  });
}

export async function updateSessionVideoMeta(
  sessionId: string,
  angle: 'front' | 'back',
  meta: {
    storagePath: string;
    downloadURL: string;
    fileSize: number | null;
    duration: number;
  }
): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), {
    [`videos.${angle}.uri`]: meta.downloadURL,
    [`videos.${angle}.uploadedAt`]: Timestamp.now(),
    [`videos.${angle}.uploadMeta`]: {
      storagePath: meta.storagePath,
      downloadURL: meta.downloadURL,
      fileSize: meta.fileSize,
      angle,
      duration: meta.duration,
      uploadedAt: Timestamp.now(),
    },
  });
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const snapshot = await getDoc(doc(db, 'sessions', sessionId));
  if (!snapshot.exists()) return null;
  return sessionFromFirestore(snapshot.data());
}

export async function getUserSessions(userId: string): Promise<Session[]> {
  const q = query(
    collection(db, 'sessions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => sessionFromFirestore(d.data()));
}

// --- User Stats ---

export async function updateUserStats(
  userId: string,
  sessions: Session[]
): Promise<void> {
  const completedSessions = sessions.filter(
    (s) => s.status === 'completed' && s.analysis
  );

  const scores = completedSessions
    .map((s) => s.analysis!.globalScore)
    .filter((s) => s > 0);

  const allDefects = completedSessions.flatMap(
    (s) => s.analysis?.defects.map((d) => d.label) ?? []
  );

  // Compter les défauts les plus fréquents
  const defectCounts = new Map<string, number>();
  for (const d of allDefects) {
    defectCounts.set(d, (defectCounts.get(d) || 0) + 1);
  }
  const sortedDefects = [...defectCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label);

  const stats: UserStats = {
    totalSessions: completedSessions.length,
    averageScore:
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
    lastSessionDate:
      completedSessions.length > 0 ? completedSessions[0].createdAt : null,
    mostFrequentDefects: sortedDefects,
    priorityAxes: sortedDefects.slice(0, 2),
  };

  await updateDoc(doc(db, 'users', userId), {
    stats,
    updatedAt: Timestamp.now(),
  });
}
