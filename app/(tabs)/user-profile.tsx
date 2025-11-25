
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { colors, commonStyles, buttonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { isProUser, getSubscriptionStatus, setSubscriptionStatus } from '@/utils/subscription';

export default function UserProfileScreen() {
  const router = useRouter();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const proStatus = await isProUser();
      setIsPro(proStatus);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = () => {
    if (isPro) {
      Alert.alert(
        'Manage Subscription',
        'In the production version, you can manage your subscription through the App Store or Play Store.',
        [
          {
            text: 'Cancel Subscription (Demo)',
            style: 'destructive',
            onPress: async () => {
              await setSubscriptionStatus('free');
              setIsPro(false);
              Alert.alert('Subscription Cancelled', 'You have been downgraded to the free version.');
            },
          },
          { text: 'Close', style: 'cancel' },
        ]
      );
    } else {
      router.push('/(tabs)/subscription');
    }
  };

  const handleManagePayment = () => {
    Alert.alert(
      'Payment Method',
      'In the production version, payment methods are managed through your App Store or Play Store account settings.',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow_back"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <IconSymbol
              ios_icon_name="person.circle.fill"
              android_material_icon_name="account_circle"
              size={80}
              color={colors.primary}
            />
          </View>
          <Text style={styles.userName}>RunReady User</Text>
          <View style={[styles.badge, isPro ? styles.badgePro : styles.badgeFree]}>
            <Text style={[styles.badgeText, isPro ? styles.badgeTextPro : styles.badgeTextFree]}>
              {isPro ? '⭐ Pro Member' : 'Free Account'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <IconSymbol
                  ios_icon_name="envelope.fill"
                  android_material_icon_name="email"
                  size={24}
                  color={colors.textSecondary}
                />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>user@runready.app</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="event"
                  size={24}
                  color={colors.textSecondary}
                />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Member Since</Text>
                  <Text style={styles.detailValue}>
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <IconSymbol
                  ios_icon_name={isPro ? "star.circle.fill" : "star.circle"}
                  android_material_icon_name={isPro ? "stars" : "star_border"}
                  size={24}
                  color={isPro ? colors.primary : colors.textSecondary}
                />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Plan</Text>
                  <Text style={styles.detailValue}>
                    {isPro ? 'Pro (Annual)' : 'Free'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.manageButton}
                onPress={handleManageSubscription}
              >
                <Text style={styles.manageButtonText}>
                  {isPro ? 'Manage' : 'Upgrade'}
                </Text>
              </TouchableOpacity>
            </View>

            {isPro && (
              <React.Fragment>
                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <IconSymbol
                      ios_icon_name="arrow.clockwise.circle.fill"
                      android_material_icon_name="autorenew"
                      size={24}
                      color={colors.textSecondary}
                    />
                    <View style={styles.detailText}>
                      <Text style={styles.detailLabel}>Renewal Date</Text>
                      <Text style={styles.detailValue}>
                        {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <IconSymbol
                      ios_icon_name="creditcard.fill"
                      android_material_icon_name="payment"
                      size={24}
                      color={colors.textSecondary}
                    />
                    <View style={styles.detailText}>
                      <Text style={styles.detailLabel}>Payment Method</Text>
                      <Text style={styles.detailValue}>•••• 4242</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.manageButton}
                    onPress={handleManagePayment}
                  >
                    <Text style={styles.manageButtonText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            )}
          </View>

          {!isPro && (
            <View style={styles.upgradePrompt}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={32}
                color={colors.primary}
              />
              <Text style={styles.upgradePromptTitle}>Upgrade to Pro</Text>
              <Text style={styles.upgradePromptText}>
                Get access to horse profiles, medication templates, tack photos, and advanced sharing features.
              </Text>
              <TouchableOpacity
                style={[buttonStyles.primaryButton, styles.upgradeButton]}
                onPress={() => router.push('/(tabs)/subscription')}
              >
                <Text style={buttonStyles.buttonText}>View Pro Plans</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isPro && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pro Features</Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.success}
                />
                <Text style={styles.featureText}>Unlimited horse profiles</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.success}
                />
                <Text style={styles.featureText}>Pre-run medication templates</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.success}
                />
                <Text style={styles.featureText}>Tack photos & equipment notes</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.success}
                />
                <Text style={styles.featureText}>Print & share schedules</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.success}
                />
                <Text style={styles.featureText}>Priority support</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <IconSymbol
                  ios_icon_name="info.circle.fill"
                  android_material_icon_name="info"
                  size={24}
                  color={colors.textSecondary}
                />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Version</Text>
                  <Text style={styles.detailValue}>1.0.0</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? 48 : spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  header: {
    marginBottom: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  avatarContainer: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  userName: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  badgePro: {
    backgroundColor: colors.primaryLight,
  },
  badgeFree: {
    backgroundColor: colors.backgroundSecondary,
  },
  badgeText: {
    ...typography.bodySemibold,
  },
  badgeTextPro: {
    color: colors.primaryDark,
  },
  badgeTextFree: {
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  detailCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    flex: 1,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  manageButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
  },
  manageButtonText: {
    ...typography.bodySemibold,
    color: colors.primary,
  },
  upgradePrompt: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginTop: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  upgradePromptTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  upgradePromptText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  upgradeButton: {
    width: '100%',
  },
  featuresList: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  bottomPadding: {
    height: 120,
  },
});
