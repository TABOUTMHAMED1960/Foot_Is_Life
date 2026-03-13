import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadow, getScoreColor } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { Badge } from '@/src/components/ui/Badge';
import { Session } from '@/src/types/session';
import { formatDate } from '@/src/utils/formatters';

interface SessionCardProps {
  session: Session;
  onPress: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function SessionCard({ session, onPress, onDelete, isDeleting }: SessionCardProps) {
  const score = session.analysis?.globalScore ?? 0;
  const hasAnalysis = session.status === 'completed' && session.analysis;
  const angleCount = [session.videos.front, session.videos.back].filter(Boolean).length;
  const confidence = session.analysis?.confidence ?? 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        {/* Score circulaire mini */}
        <View style={[styles.scoreBadge, { borderColor: hasAnalysis ? getScoreColor(score) : Colors.disabled }]}>
          <Text style={[styles.scoreText, { color: hasAnalysis ? getScoreColor(score) : Colors.disabled }]}>
            {hasAnalysis ? score : '-'}
          </Text>
        </View>

        {/* Infos séance */}
        <View style={styles.info}>
          <Text style={styles.date}>
            {Strings.history.sessionDate} {formatDate(session.createdAt)}
          </Text>
          <View style={styles.badges}>
            <Badge
              label={`${angleCount} ${angleCount > 1 ? Strings.history.angles : Strings.history.angle}`}
              variant="neutral"
            />
            {hasAnalysis && confidence < 1.0 && (
              <Badge label={Strings.results.partialAnalysis} variant="warning" />
            )}
            {session.status === 'error' && (
              <Badge label={Strings.common.error} variant="error" />
            )}
          </View>
        </View>

        {/* Flèche */}
        <Text style={styles.arrow}>›</Text>
      </View>

      {/* Bouton supprimer */}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          disabled={isDeleting}
          activeOpacity={0.7}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <Text style={styles.deleteText}>{Strings.common.delete}</Text>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  scoreBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    ...Typography.bodyBold,
    fontSize: 18,
  },
  info: {
    flex: 1,
    gap: Spacing.xs,
  },
  date: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  arrow: {
    fontSize: 24,
    color: Colors.textLight,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.xs,
  },
  deleteText: {
    ...Typography.caption,
    color: Colors.error,
  },
});
