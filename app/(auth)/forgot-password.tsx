import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/constants/theme';
import { Strings } from '@/src/constants/strings.fr';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/hooks/useAuth';
import { isValidEmail } from '@/src/utils/validators';

export default function ForgotPasswordScreen() {
  const { resetPassword, actionLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    clearError();
    setLocalError(null);

    if (!isValidEmail(email)) {
      setLocalError(Strings.auth.errorInvalidEmail);
      return;
    }

    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch {
      // L'erreur est déjà gérée par useAuth (setError via mapFirebaseError)
    }
  };

  const displayError = localError || error;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.appName}>{Strings.app.name}</Text>
          </View>

          {sent ? (
            <View style={styles.form}>
              <Text style={styles.title}>{Strings.auth.forgotPasswordTitle}</Text>
              <View style={styles.successContainer}>
                <Text style={styles.successText}>
                  {Strings.auth.forgotPasswordSuccess}
                </Text>
              </View>
              <Link href="/(auth)/login" style={styles.backLink}>
                <Text style={styles.linkText}>{Strings.auth.forgotPasswordBackToLogin}</Text>
              </Link>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.title}>{Strings.auth.forgotPasswordTitle}</Text>
              <Text style={styles.description}>{Strings.auth.forgotPasswordDesc}</Text>

              {displayError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{displayError}</Text>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{Strings.auth.email}</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="joueur@email.com"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>

              <Button
                title={Strings.auth.forgotPasswordSend}
                onPress={handleReset}
                loading={actionLoading}
                fullWidth
                size="lg"
                style={styles.submitButton}
              />
            </View>
          )}

          {!sent && (
            <View style={styles.footer}>
              <Link href="/(auth)/login">
                <Text style={styles.linkText}>{Strings.auth.forgotPasswordBackToLogin}</Text>
              </Link>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  appName: {
    ...Typography.h1,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  errorContainer: {
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
  },
  successContainer: {
    backgroundColor: Colors.successLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  successText: {
    ...Typography.body,
    color: Colors.success,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.text,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  backLink: {
    alignSelf: 'center',
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  linkText: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
});
