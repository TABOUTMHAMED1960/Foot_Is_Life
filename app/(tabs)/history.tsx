import React, { useCallback, useState } from 'react';
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

  const handleSessionPress = useCallback(
    (session: Session) => {
      if (session.analysis) {
        router.push({
          pathname: '/session/results',
          params: { analysisData: JSON.stringify(session.analysis) },
        });
      }
    },
    [router]
  );

  const handleDelete = useCallback(
    (session: Session) => {
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
    [deleteSession]
  );

  const renderItem = useCallback(
    ({ item }: { item: Session }) => (
      <SessionCard
        session={item}
        onPress={() => handleSessionPress(item)}
        onDelete={() => handleDelete(item)}
        isDeleting={deletingId === item.id}
      />
    ),
    [handleSessionPress, handleDelete, deletingId]
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
});
