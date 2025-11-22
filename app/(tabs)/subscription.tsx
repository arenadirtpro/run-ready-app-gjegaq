
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { colors, commonStyles, buttonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { getSubscriptionStatus, setSubscriptionStatus, isProUser } from '@/utils/subscription';

export default function SubscriptionScreen() {
  const router = useRouter();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const proStatus = await isProUser();
      setIsPro(proStatus);
    } catch (error) {
      console.error('Error loading subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    try {
      Alert.alert(
        'Subscription Coming Soon',
        `You selected the ${plan === 'monthly' ? 'Monthly ($1.99/month)' : 'Annual ($14.99/year)'} plan.\n\nIn-app purchases will be available in the next update. For now, you can try Pro features for free!`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Try Pro Free',
            onPress: async () => {
              const expiryDate = new Date();
              expiryDate.setFullYear(expiryDate.getFullYear() + 1);
              await setSubscriptionStatus('pro', expiryDate);
              setIsPro(true);
              Alert.alert(
                'Welcome to Pro! 🎉',
                'You now have access to all Pro features including horse profiles, templates, and advanced sharing options.',
                [
                  {
                    text: 'Explore Horses',
                    onPress: () => router.push('/(tabs)/horses'),
                  },
                  { text: 'OK' },
                ]
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error subscribing:', error);
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
    }
  };

  const handleManageSubscription = () => {
    Alert.alert(
      'Manage Subscription',
      'Subscription management will be available through the App Store/Play Store in the production version.',
      [
        {
          text: 'Cancel Pro (Demo)',
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

  if (isPro) {
    return (
      <View style={commonStyles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <IconSymbol
              ios_icon_name="star.circle.fill"
              android_material_icon_name="stars"
              size={64}
              color={colors.primary}
            />
            <Text style={styles.title}>You&apos;re Pro! 🎉</Text>
            <Text style={styles.subtitle}>
              Thank you for supporting RunReady
            </Text>
          </View>

          <View style={styles.proFeaturesCard}>
            <Text style={styles.proFeaturesTitle}>Your Pro Features</Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={28}
                  color={colors.success}
                />
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Horse Profiles</Text>
                  <Text style={styles.featureDescription}>
                    Create and manage horse profiles with custom settings
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={28}
                  color={colors.success}
                />
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Pre-Run Templates</Text>
                  <Text style={styles.featureDescription}>
                    Save medication and preparation reminders for each horse
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={28}
                  color={colors.success}
                />
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Tack Photos</Text>
                  <Text style={styles.featureDescription}>
                    Upload photos of saddles, bits, and equipment
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={28}
                  color={colors.success}
                />
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Pre-Run Rituals</Text>
                  <Text style={styles.featureDescription}>
                    Document special routines and preparation notes
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={28}
                  color={colors.success}
                />
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Advanced Sharing</Text>
                  <Text style={styles.featureDescription}>
                    Print and share event schedules as images or PDFs
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[buttonStyles.primaryButton, styles.manageButton]}
              onPress={handleManageSubscription}
            >
              <Text style={buttonStyles.buttonText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
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
          <IconSymbol
            ios_icon_name="star.fill"
            android_material_icon_name="star"
            size={64}
            color={colors.primary}
          />
          <Text style={styles.title}>Upgrade to Pro</Text>
          <Text style={styles.subtitle}>
            Unlock powerful features for serious competitors
          </Text>
        </View>

        <View style={styles.pricingCards}>
          <TouchableOpacity
            style={styles.pricingCard}
            onPress={() => handleSubscribe('monthly')}
            activeOpacity={0.8}
          >
            <View style={styles.pricingHeader}>
              <Text style={styles.pricingTitle}>Monthly</Text>
            </View>
            <View style={styles.pricingPrice}>
              <Text style={styles.pricingAmount}>$1.99</Text>
              <Text style={styles.pricingPeriod}>/month</Text>
            </View>
            <Text style={styles.pricingDescription}>
              Perfect for trying out Pro features
            </Text>
            <View style={[buttonStyles.primaryButton, styles.subscribeButton]}>
              <Text style={buttonStyles.buttonText}>Subscribe Monthly</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pricingCard, styles.pricingCardPopular]}
            onPress={() => handleSubscribe('yearly')}
            activeOpacity={0.8}
          >
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>BEST VALUE</Text>
            </View>
            <View style={styles.pricingHeader}>
              <Text style={styles.pricingTitle}>Annual</Text>
            </View>
            <View style={styles.pricingPrice}>
              <Text style={styles.pricingAmount}>$14.99</Text>
              <Text style={styles.pricingPeriod}>/year</Text>
            </View>
            <Text style={styles.pricingDescription}>
              Save $9 compared to monthly
            </Text>
            <View style={[buttonStyles.primaryButton, styles.subscribeButton]}>
              <Text style={buttonStyles.buttonText}>Subscribe Annually</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresSectionTitle}>What&apos;s Included</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="figure.equestrian.sports"
                android_material_icon_name="pets"
                size={28}
                color={colors.primary}
              />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Horse Profiles</Text>
                <Text style={styles.featureDescription}>
                  Create unlimited horse profiles with master settings that auto-load into new events
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="syringe.fill"
                android_material_icon_name="medication"
                size={28}
                color={colors.primary}
              />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Medication Templates</Text>
                <Text style={styles.featureDescription}>
                  Save medication schedules like &quot;4cc Lasix 3 hours before&quot; for each horse
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="camera.fill"
                android_material_icon_name="photo_camera"
                size={28}
                color={colors.primary}
              />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Tack Photos</Text>
                <Text style={styles.featureDescription}>
                  Upload photos of saddles and bits so anyone can get your horse ready
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="note.text"
                android_material_icon_name="description"
                size={28}
                color={colors.primary}
              />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Pre-Run Rituals</Text>
                <Text style={styles.featureDescription}>
                  Document warm-up routines and special preparation instructions
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <IconSymbol
                ios_icon_name="square.and.arrow.up.fill"
                android_material_icon_name="share"
                size={28}
                color={colors.primary}
              />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Print & Share</Text>
                <Text style={styles.featureDescription}>
                  Export schedules as images or PDFs to share with your team
                </Text>
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
    alignItems: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pricingCards: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  pricingCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  pricingCardPopular: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  popularBadgeText: {
    ...typography.smallMedium,
    color: colors.background,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pricingHeader: {
    marginBottom: spacing.md,
  },
  pricingTitle: {
    ...typography.h3,
    color: colors.text,
  },
  pricingPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  pricingAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary,
  },
  pricingPeriod: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  pricingDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  subscribeButton: {
    width: '100%',
  },
  featuresSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featuresSectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  featuresList: {
    gap: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    ...typography.bodySemibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  proFeaturesCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  proFeaturesTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  manageButton: {
    marginTop: spacing.xl,
  },
  bottomPadding: {
    height: 120,
  },
});
