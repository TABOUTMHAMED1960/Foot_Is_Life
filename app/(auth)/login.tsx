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

export default function LoginScreen() {
  const { signIn, actionLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = () => {
    clearError();
    setLocalError(null);

    if (!isValidEmail(email)) {
      setLocalError(Strings.auth.errorInvalidEmail);
      return;
    }
    if (password.length < 6) {
      setLocalError(Strings.auth.errorWeakPassword);
      return;
    }

    signIn(email.trim(), password);
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
            <Text style={styles.tagline}>{Strings.app.tagline}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>{Strings.auth.welcomeBack}</Text>

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
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{Strings.auth.password}</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••"
                placeholderTextColor={Colors.textLight}
                secureTextEntry
              />
            </View>

            <Button
              title={Strings.auth.login}
              onPress={handleLogin}
              loading={actionLoading}
              fullWidth
              size="lg"
              style={styles.submitButton}
            />

            <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
              <Text style={styles.forgotText}>{Strings.auth.forgotPassword}</Text>
            </Link>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{Strings.auth.noAccount}</Text>
            <Link href="/(auth)/signup">
              <Text style={styles.linkText}>{Strings.auth.createAccount}</Text>
            </Link>
          </View>
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
  tagline: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
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
  forgotLink: {
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  forgotText: {
    ...Typography.caption,
    color: Colors.primary,
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  linkText: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
});
