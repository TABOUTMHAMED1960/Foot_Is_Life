import { create } from 'zustand';
import { VideoData, VideoAngle } from '@/src/types/video';

type CaptureMode = 'camera' | 'import';

interface SessionDraft {
  captureMode: CaptureMode | null;
  frontVideo: VideoData | null;
  backVideo: VideoData | null;
}

interface SessionStoreState {
  draft: SessionDraft;
  setCaptureMode: (mode: CaptureMode) => void;
  setVideo: (angle: VideoAngle, video: VideoData) => void;
  removeVideo: (angle: VideoAngle) => void;
  resetDraft: () => void;
}

const initialDraft: SessionDraft = {
  captureMode: null,
  frontVideo: null,
  backVideo: null,
};

export const useSessionStore = create<SessionStoreState>((set) => ({
  draft: { ...initialDraft },
  setCaptureMode: (captureMode) =>
    set((state) => ({
      draft: { ...state.draft, captureMode },
    })),
  setVideo: (angle, video) =>
    set((state) => ({
      draft: {
        ...state.draft,
        [angle === 'front' ? 'frontVideo' : 'backVideo']: video,
      },
    })),
  removeVideo: (angle) =>
    set((state) => ({
      draft: {
        ...state.draft,
        [angle === 'front' ? 'frontVideo' : 'backVideo']: null,
      },
    })),
  resetDraft: () => set({ draft: { ...initialDraft } }),
}));
