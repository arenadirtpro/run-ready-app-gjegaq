
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, TextInput, Modal } from 'react-native';
import { colors, commonStyles, buttonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { getSubscriptionStatus, setSubscriptionStatus, isProUser } from '@/utils/subscription';

export default function SubscriptionScreen() {
  const router = useRouter();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);

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
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    if (!cardNumber || !expiryDate || !cvv) {
      Alert.alert('Missing Information', 'Please fill in all payment details.');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number.');
      return;
    }

    setProcessing(true);

    setTimeout(async () => {
      try {
        const expiryDate = new Date();
        if (selectedPlan === 'monthly') {
          expiryDate.setMonth(expiryDate.getMonth() + 1);
        } else {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }
        
        await setSubscriptionStatus('pro', expiryDate);
        setIsPro(true);
        setShowPaymentModal(false);
        setProcessing(false);
        
        Alert.alert(
          'Welcome to Pro! 🎉',
          `Your ${selectedPlan === 'monthly' ? 'monthly' : 'annual'} subscription is now active. You have access to all Pro features!`,
          [
            {
              text: 'Explore Horses',
              onPress: () => router.push('/(tabs)/horses'),
            },
            { text: 'OK' },
          ]
        );
        
        setCardNumber('');
        setExpiryDate('');
        setCvv('');
        setSelectedPlan(null);
      } catch (error) {
        console.error('Error processing payment:', error);
        setProcessing(false);
        Alert.alert('Error', 'Failed to process payment. Please try again.');
      }
    }, 2000);
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

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    if (cleaned.length <= 16 && /^\d*$/.test(cleaned)) {
      setCardNumber(formatCardNumber(cleaned));
    }
  };

  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\//g, '');
    if (cleaned.length <= 4 && /^\d*$/.test(cleaned)) {
      if (cleaned.length >= 2) {
        setExpiryDate(cleaned.slice(0, 2) + '/' + cleaned.slice(2));
      } else {
        setExpiryDate(cleaned);
      }
    }
  };

  const handleCvvChange = (text: string) => {
    if (text.length <= 3 && /^\d*$/.test(text)) {
      setCvv(text);
    }
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

        <View style={styles.trustSection}>
          <IconSymbol
            ios_icon_name="lock.shield.fill"
            android_material_icon_name="verified_user"
            size={32}
            color={colors.success}
          />
          <Text style={styles.trustText}>
            Secure payment processing • Cancel anytime • 30-day money-back guarantee
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !processing && setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Purchase</Text>
              {!processing && (
                <TouchableOpacity
                  onPress={() => setShowPaymentModal(false)}
                  style={styles.closeButton}
                >
                  <IconSymbol
                    ios_icon_name="xmark.circle.fill"
                    android_material_icon_name="cancel"
                    size={28}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.planSummary}>
              <Text style={styles.planSummaryLabel}>Selected Plan</Text>
              <Text style={styles.planSummaryValue}>
                {selectedPlan === 'monthly' ? 'Monthly - $1.99/month' : 'Annual - $14.99/year'}
              </Text>
            </View>

            <View style={styles.paymentForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  editable={!processing}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, styles.inputGroupHalf]}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    value={expiryDate}
                    onChangeText={handleExpiryChange}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    editable={!processing}
                  />
                </View>

                <View style={[styles.inputGroup, styles.inputGroupHalf]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    value={cvv}
                    onChangeText={handleCvvChange}
                    placeholder="123"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    secureTextEntry
                    editable={!processing}
                  />
                </View>
              </View>

              <View style={styles.securityNote}>
                <IconSymbol
                  ios_icon_name="lock.fill"
                  android_material_icon_name="lock"
                  size={16}
                  color={colors.success}
                />
                <Text style={styles.securityNoteText}>
                  Your payment information is encrypted and secure
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              {!processing && (
                <TouchableOpacity
                  style={[buttonStyles.secondaryButton, styles.modalButton]}
                  onPress={() => setShowPaymentModal(false)}
                >
                  <Text style={buttonStyles.buttonTextSecondary}>Cancel</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[buttonStyles.primaryButton, styles.modalButton, processing && styles.processingButton]}
                onPress={handleProcessPayment}
                disabled={processing}
              >
                <Text style={buttonStyles.buttonText}>
                  {processing ? 'Processing...' : `Pay ${selectedPlan === 'monthly' ? '$1.99' : '$14.99'}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  trustSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  trustText: {
    ...typography.small,
    color: colors.success,
    textAlign: 'center',
    flex: 1,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  planSummary: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  planSummaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  planSummaryValue: {
    ...typography.h4,
    color: colors.primary,
  },
  paymentForm: {
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputGroupHalf: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputLabel: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  securityNoteText: {
    ...typography.small,
    color: colors.success,
    flex: 1,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  processingButton: {
    opacity: 0.7,
  },
});
