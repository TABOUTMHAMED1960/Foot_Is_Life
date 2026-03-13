import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { StatsOverview } from '@/src/components/profile/StatsOverview';
import { ProgressionChart } from '@/src/components/profile/ProgressionChart';
import { useAuth } from '@/src/hooks/useAuth';
import { useSession } from '@/src/hooks/useSession';
import { usePlayerStats } from '@/src/hooks/usePlayerStats';
import { formatDate } from '@/src/utils/formatters';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { sessions } = useSession();
  const stats = usePlayerStats(sessions);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profil */}
        <Card style={styles.profileCard}>
          <Text style={styles.name}>{stats.displayName}</Text>
          <Text style={styles.email}>{stats.email}</Text>
          <Text style={styles.memberSince}>
            {Strings.profile.memberSince} {formatDate(stats.memberSince)}
          </Text>
        </Card>

        {/* Stats */}
        <Text style={styles.sectionTitle}>{Strings.profile.stats}</Text>
        <StatsOverview
          totalSessions={stats.totalSessions}
          averageScore={stats.averageScore}
          bestScore={stats.bestScore}
          trend={stats.trend}
        />

        {/* Progression */}
        <Card style={styles.section}>
          <ProgressionChart data={stats.progression} />
        </Card>

        {/* Défauts fréquents */}
        {stats.mostFrequentDefects.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{Strings.profile.frequentDefects}</Text>
            {stats.mostFrequentDefects.map((defect, i) => (
              <View key={i} style={styles.defectRow}>
                <Text style={styles.defectBullet}>⚠️</Text>
                <Text style={styles.defectText}>{defect}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Axes prioritaires */}
        {stats.priorityAxes.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{Strings.profile.priorityAxes}</Text>
            {stats.priorityAxes.map((axis, i) => (
              <View key={i} style={styles.defectRow}>
                <Text style={styles.defectBullet}>🎯</Text>
                <Text style={styles.defectText}>{axis}</Text>
              </View>
            ))}
          </Card>
        )}

        <Button
          title={Strings.auth.logout}
          variant="outline"
          onPress={signOut}
          fullWidth
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  name: {
    ...Typography.h2,
    color: Colors.text,
  },
  email: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  memberSince: {
    ...Typography.small,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  section: {
    marginTop: Spacing.md,
  },
  defectRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  defectBullet: {
    fontSize: 14,
  },
  defectText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  logoutButton: {
    marginTop: Spacing.xl,
  },
});
