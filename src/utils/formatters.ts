export function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatScore(score: number): string {
  return Math.round(score).toString();
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function buildShareText(analysis: {
  globalScore: number;
  strengths: string[];
  defects: { label: string }[];
}): string {
  const lines: string[] = [];

  lines.push('Mon analyse Foot Is Life');
  lines.push('');
  lines.push(`Score global : ${Math.round(analysis.globalScore)} / 100`);

  if (analysis.strengths.length > 0) {
    lines.push('');
    lines.push('Points forts :');
    for (const s of analysis.strengths.slice(0, 3)) {
      lines.push(`  + ${s}`);
    }
  }

  if (analysis.defects.length > 0) {
    lines.push('');
    lines.push('À améliorer :');
    for (const d of analysis.defects.slice(0, 3)) {
      lines.push(`  - ${d.label}`);
    }
  }

  lines.push('');
  lines.push('La progression passe par la répétition !');
  lines.push('');
  lines.push('Analysé avec Foot Is Life');

  return lines.join('\n');
}
