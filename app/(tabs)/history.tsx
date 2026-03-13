import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { Button } from '@/src/components/ui/Button';
import { SessionCard } from '@/src/components/session/SessionCard';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { useSession } from '@/src/hooks/useSession';
import { Session } from '@/src/types/session';

export default function HistoryScreen() {
  const router = useRouter();
  const { sessions, isLoading, error, fetchSessions, deleteSession } = useSession();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Mode comparaison ──
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const completedSessions = useMemo(
    () => sessions.filter((s) => s.status === 'completed' && s.analysis),
    [sessions]
  );
  const canCompare = completedSessions.length >= 2;

  const toggleCompareMode = () => {
    if (compareMode) {
      setCompareMode(false);
      setSelectedIds([]);
    } else {
      setCompareMode(true);
      setSelectedIds([]);
    }
  };

  const toggleSelect = (sessionId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(sessionId)) {
        return prev.filter((id) => id !== sessionId);
      }
      if (prev.length >= 2) {
        // Remplace le deuxième
        return [prev[0], sessionId];
      }
      return [...prev, sessionId];
    });
  };

  const launchCompare = () => {
    if (selectedIds.length !== 2) return;

    const sessionA = sessions.find((s) => s.id === selectedIds[0]);
    const sessionB = sessions.find((s) => s.id === selectedIds[1]);
    if (!sessionA?.analysis || !sessionB?.analysis) return;

    // La plus ancienne en "before", la plus récente en "after"
    const [before, after] =
      sessionA.createdAt.getTime() <= sessionB.createdAt.getTime()
        ? [sessionA, sessionB]
        : [sessionB, sessionA];

    router.push({
      pathname: '/session/compare',
      params: {
        beforeData: JSON.stringify(before.analysis),
        afterData: JSON.stringify(after.analysis),
        beforeDate: before.createdAt.toISOString(),
        afterDate: after.createdAt.toISOString(),
      },
    });

    setCompareMode(false);
    setSelectedIds([]);
  };

  // ── Handlers existants ──
  const handleSessionPress = useCallback(
    (session: Session) => {
      if (compareMode) {
        if (session.status === 'completed' && session.analysis) {
          toggleSelect(session.id);
        }
        return;
      }
      if (session.analysis) {
        router.push({
          pathname: '/session/results',
          params: { analysisData: JSON.stringify(session.analysis) },
        });
      }
    },
    [router, compareMode]
  );

  const handleDelete = useCallback(
    (session: Session) => {
      if (compareMode) return;
      Alert.alert(
        Strings.history.deleteConfirmTitle,
        Strings.history.deleteConfirmMessage,
        [
          { text: Strings.common.cancel, style: 'cancel' },
          {
            text: Strings.common.delete,
            style: 'destructive',
            onPress: async () => {
              setDeletingId(session.id);
              try {
                await deleteSession(session);
              } catch {
                Alert.alert(Strings.common.error, Strings.history.deleteError);
              } finally {
                setDeletingId(null);
              }
            },
          },
        ]
      );
    },
    [deleteSession, compareMode]
  );

  const renderItem = useCallback(
    ({ item }: { item: Session }) => {
      const isSelected = selectedIds.includes(item.id);
      const isSelectable = compareMode && item.status === 'completed' && !!item.analysis;

      return (
        <View
          style={[
            compareMode && isSelected && styles.selectedCard,
            compareMode && !isSelectable && styles.disabledCard,
          ]}
        >
          <SessionCard
            session={item}
            onPress={() => handleSessionPress(item)}
            onDelete={compareMode ? undefined : () => handleDelete(item)}
            isDeleting={deletingId === item.id}
          />
          {compareMode && isSelected && (
            <View style={styles.checkBadge}>
              <Text style={styles.checkText}>
                {selectedIds.indexOf(item.id) + 1}
              </Text>
            </View>
          )}
        </View>
      );
    },
    [handleSessionPress, handleDelete, deletingId, compareMode, selectedIds]
  );

  const keyExtractor = useCallback((item: Session) => item.id, []);

  if (isLoading && sessions.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {error && sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{error}</Text>
          <Button
            title={Strings.common.retry}
            onPress={fetchSessions}
            style={styles.button}
          />
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{Strings.history.noSessions}</Text>
          <Text style={styles.emptyCta}>{Strings.history.noSessionsCta}</Text>
          <Button
            title={Strings.home.startSession}
            onPress={() => router.push('/session/choose-mode')}
            style={styles.button}
          />
        </View>
      ) : (
        <>
          {/* Header avec bouton comparer */}
          {canCompare && (
            <View style={styles.header}>
              {compareMode ? (
                <>
                  <Text style={styles.selectPrompt}>
                    {Strings.compare.selectPrompt}
                  </Text>
                  <View style={styles.headerButtons}>
                    <Button
                      title={Strings.compare.cancel}
                      variant="ghost"
                      size="sm"
                      onPress={toggleCompareMode}
                    />
                    <Button
                      title={Strings.compare.launch}
                      size="sm"
                      onPress={launchCompare}
                      disabled={selectedIds.length !== 2}
                    />
                  </View>
                </>
              ) : (
                <Button
                  title={Strings.compare.selectMode}
                  variant="outline"
                  size="sm"
                  onPress={toggleCompareMode}
                />
              )}
            </View>
          )}

          <FlatList
            data={sessions}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={fetchSessions}
                tintColor={Colors.primary}
              />
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  selectPrompt: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  separator: {
    height: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyCta: {
    ...Typography.bodyBold,
    color: Colors.primary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  button: {
    minWidth: 200,
  },
  // Compare selection
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 18,
    position: 'relative',
  },
  disabledCard: {
    opacity: 0.4,
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
});
