
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { HorseTemplate } from '@/types/horseTemplate';
import { IconSymbol } from '@/components/IconSymbol';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import * as SMS from 'expo-sms';
import { captureAndShareView } from '@/utils/imageGenerator';
import { isProUser } from '@/utils/subscription';

export default function HorseCardDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isSharing, setIsSharing] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const shareableViewRef = useRef(null);

  useEffect(() => {
    loadProStatus();
  }, []);

  const loadProStatus = async () => {
    try {
      const proStatus = await isProUser();
      setIsPro(proStatus);
    } catch (error) {
      console.error('Error loading pro status:', error);
    }
  };

  let horseTemplate: HorseTemplate | null = null;
  try {
    if (params.templateData && typeof params.templateData === 'string') {
      horseTemplate = JSON.parse(params.templateData);
    }
  } catch (error) {
    console.error('Error parsing horse template data:', error);
  }

  if (!horseTemplate) {
    return (
      <View style={commonStyles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load horse profile</Text>
          <TouchableOpacity
            style={buttonStyles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={buttonStyles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const formatOffsetTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hr${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  };

  const generateHorseHTML = (): string => {
    const remindersHTML = horseTemplate!.reminderTemplates.length > 0
      ? `
        <div style="margin-top: 20px;">
          <h3 style="margin: 10px 0; color: #5D6D7E; font-size: 18px;">Pre-Run Reminders:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #ECF0F1;">
                <th style="padding: 10px; text-align: left; border: 1px solid #BDC3C7; font-size: 14px;">Task</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #BDC3C7; font-size: 14px;">Time Before Run</th>
              </tr>
            </thead>
            <tbody>
              ${horseTemplate!.reminderTemplates.map(reminder => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #BDC3C7; font-size: 14px;">${reminder.label}</td>
                  <td style="padding: 10px; border: 1px solid #BDC3C7; font-size: 14px;">${formatOffsetTime(reminder.offsetMinutes)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
      : '';

    const tackPhotosHTML = (horseTemplate!.saddlePhotoUri || horseTemplate!.bitPhotoUri)
      ? `
        <div style="margin-top: 20px;">
          <h3 style="margin: 10px 0; color: #5D6D7E; font-size: 18px;">Tack Photos:</h3>
          <div style="display: flex; gap: 15px; margin-top: 10px;">
            ${horseTemplate!.saddlePhotoUri ? `
              <div style="flex: 1;">
                <p style="margin: 5px 0; color: #7F8C8D; font-size: 14px; font-weight: bold;">Saddle</p>
                <img src="${horseTemplate!.saddlePhotoUri}" style="width: 100%; max-width: 300px; border-radius: 8px; border: 1px solid #BDC3C7;" />
              </div>
            ` : ''}
            ${horseTemplate!.bitPhotoUri ? `
              <div style="flex: 1;">
                <p style="margin: 5px 0; color: #7F8C8D; font-size: 14px; font-weight: bold;">Bit</p>
                <img src="${horseTemplate!.bitPhotoUri}" style="width: 100%; max-width: 300px; border-radius: 8px; border: 1px solid #BDC3C7;" />
              </div>
            ` : ''}
          </div>
        </div>
      `
      : '';

    const notesHTML = horseTemplate!.preRunNotes
      ? `
        <div style="margin-top: 20px;">
          <h3 style="margin: 10px 0; color: #5D6D7E; font-size: 18px;">Pre-Run Ritual Notes:</h3>
          <div style="background-color: #ECF0F1; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <p style="margin: 0; color: #2C3E50; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${horseTemplate!.preRunNotes}</p>
          </div>
        </div>
      `
      : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              padding: 20px;
              background-color: #F8F9FA;
              color: #2C3E50;
            }
            @media print {
              body {
                background-color: white;
              }
            }
          </style>
        </head>
        <body>
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #5D6D7E; margin-bottom: 10px; font-size: 32px;">${horseTemplate!.name}</h1>
            <p style="color: #7F8C8D; font-size: 16px; margin: 5px 0;">Horse Profile Card</p>
          </div>
          
          ${remindersHTML}
          ${tackPhotosHTML}
          ${notesHTML}

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #BDC3C7;">
            <p style="color: #7F8C8D; font-size: 12px; margin: 0;">Generated by RunReady</p>
          </div>
        </body>
      </html>
    `;
  };

  const generatePlainTextSummary = (): string => {
    let text = `${horseTemplate!.name}\n`;
    text += `Horse Profile Card\n\n`;
    text += `${'='.repeat(40)}\n\n`;

    if (horseTemplate!.reminderTemplates.length > 0) {
      text += `PRE-RUN REMINDERS\n`;
      horseTemplate!.reminderTemplates.forEach(reminder => {
        text += `  • ${reminder.label} - ${formatOffsetTime(reminder.offsetMinutes)} before run\n`;
      });
      text += `\n`;
    }

    if (horseTemplate!.saddlePhotoUri || horseTemplate!.bitPhotoUri) {
      text += `TACK PHOTOS\n`;
      if (horseTemplate!.saddlePhotoUri) text += `  • Saddle photo attached\n`;
      if (horseTemplate!.bitPhotoUri) text += `  • Bit photo attached\n`;
      text += `\n`;
    }

    if (horseTemplate!.preRunNotes) {
      text += `PRE-RUN RITUAL NOTES\n`;
      text += `${horseTemplate!.preRunNotes}\n\n`;
    }

    text += `${'='.repeat(40)}\n`;
    text += `Generated by RunReady`;
    return text;
  };

  const handlePrint = async () => {
    try {
      setIsSharing(true);
      const html = generateHorseHTML();
      await Print.printAsync({ html });
      console.log('Print initiated');
    } catch (error) {
      console.error('Error printing:', error);
      Alert.alert('Error', 'Failed to print. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handlePrintToPDF = async () => {
    try {
      setIsSharing(true);
      const html = generateHorseHTML();
      const { uri } = await Print.printToFileAsync({ html });
      console.log('PDF saved to:', uri);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Share ${horseTemplate!.name} Profile`,
        });
      } else {
        Alert.alert('Success', 'PDF created successfully!');
      }
    } catch (error) {
      console.error('Error creating PDF:', error);
      Alert.alert('Error', 'Failed to create PDF. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareAsImage = async () => {
    try {
      setIsSharing(true);
      await captureAndShareView(shareableViewRef, `${horseTemplate!.name.replace(/\s+/g, '-')}-Profile.png`);
    } catch (error) {
      console.error('Error sharing as image:', error);
      Alert.alert('Error', 'Failed to share as image. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareViaEmail = async () => {
    try {
      setIsSharing(true);
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (!isAvailable) {
        Alert.alert(
          'Email Not Available',
          'Email is not configured on this device. Please set up an email account in your device settings.'
        );
        return;
      }

      const html = generateHorseHTML();

      const result = await MailComposer.composeAsync({
        subject: `${horseTemplate!.name} - Horse Profile Card`,
        body: html,
        isHtml: true,
      });

      console.log('Email composer result:', result);
    } catch (error) {
      console.error('Error sharing via email:', error);
      Alert.alert('Error', 'Failed to open email. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareViaSMS = async () => {
    try {
      setIsSharing(true);
      const isAvailable = await SMS.isAvailableAsync();
      
      if (!isAvailable) {
        Alert.alert(
          'SMS Not Available',
          'SMS is not available on this device.'
        );
        return;
      }

      const plainText = generatePlainTextSummary();

      const result = await SMS.sendSMSAsync([], plainText);
      console.log('SMS result:', result);
    } catch (error) {
      console.error('Error sharing via SMS:', error);
      Alert.alert('Error', 'Failed to open SMS. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShare = () => {
    if (!isPro) {
      Alert.alert(
        'Pro Feature',
        'Sharing and printing horse cards is a Pro feature. Upgrade to unlock this functionality.',
        [
          {
            text: 'View Pro Plans',
            onPress: () => router.push('/(tabs)/subscription'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Share Horse Card',
      'Choose how you would like to share this horse profile',
      [
        {
          text: 'Share as Image',
          onPress: handleShareAsImage,
        },
        {
          text: 'Email',
          onPress: handleShareViaEmail,
        },
        {
          text: 'Text Message',
          onPress: handleShareViaSMS,
        },
        {
          text: 'Save as PDF',
          onPress: handlePrintToPDF,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handlePrintWithProCheck = () => {
    if (!isPro) {
      Alert.alert(
        'Pro Feature',
        'Printing horse cards is a Pro feature. Upgrade to unlock this functionality.',
        [
          {
            text: 'View Pro Plans',
            onPress: () => router.push('/(tabs)/subscription'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return;
    }
    handlePrint();
  };

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

        {/* Shareable View - This will be captured as an image */}
        <View ref={shareableViewRef} style={styles.shareableContainer} collapsable={false}>
          <View style={styles.titleSection}>
            <IconSymbol
              ios_icon_name="figure.equestrian.sports"
              android_material_icon_name="pets"
              size={48}
              color={colors.primary}
            />
            <Text style={styles.horseTitle}>{horseTemplate.name}</Text>
            <Text style={styles.horseSubtitle}>Horse Profile Card</Text>
          </View>

          {horseTemplate.reminderTemplates.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <IconSymbol
                  ios_icon_name="bell.badge.fill"
                  android_material_icon_name="notifications_active"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.sectionTitle}>Pre-Run Reminders</Text>
              </View>
              <View style={styles.remindersTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.tableCol1]}>Task</Text>
                  <Text style={[styles.tableHeaderText, styles.tableCol2]}>Time Before</Text>
                </View>
                {horseTemplate.reminderTemplates.map((reminder, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableCol1]}>
                      {reminder.label}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCol2]}>
                      {formatOffsetTime(reminder.offsetMinutes)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {(horseTemplate.saddlePhotoUri || horseTemplate.bitPhotoUri) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <IconSymbol
                  ios_icon_name="camera.fill"
                  android_material_icon_name="photo_camera"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.sectionTitle}>Tack Photos</Text>
              </View>
              <View style={styles.photosGrid}>
                {horseTemplate.saddlePhotoUri && (
                  <View style={styles.photoItem}>
                    <Text style={styles.photoLabel}>Saddle</Text>
                    <Image source={{ uri: horseTemplate.saddlePhotoUri }} style={styles.photo} />
                  </View>
                )}
                {horseTemplate.bitPhotoUri && (
                  <View style={styles.photoItem}>
                    <Text style={styles.photoLabel}>Bit</Text>
                    <Image source={{ uri: horseTemplate.bitPhotoUri }} style={styles.photo} />
                  </View>
                )}
              </View>
            </View>
          )}

          {horseTemplate.preRunNotes && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <IconSymbol
                  ios_icon_name="note.text"
                  android_material_icon_name="description"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.sectionTitle}>Pre-Run Ritual Notes</Text>
              </View>
              <View style={styles.notesContainer}>
                <Text style={styles.notesText}>{horseTemplate.preRunNotes}</Text>
              </View>
            </View>
          )}

          <View style={styles.watermark}>
            <Text style={styles.watermarkText}>Generated by RunReady</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.actionsSectionTitle}>Share or Print</Text>
          <Text style={styles.actionsSectionSubtitle}>
            Share this horse profile card with barn managers, trainers, or helpers
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                buttonStyles.primaryButton,
                styles.actionButton,
                !isPro && styles.actionButtonDisabled,
              ]}
              onPress={handleShare}
              disabled={isSharing}
            >
              <IconSymbol
                ios_icon_name="square.and.arrow.up.fill"
                android_material_icon_name="share"
                size={20}
                color={isPro ? colors.background : colors.textSecondary}
              />
              <Text style={[buttonStyles.buttonText, styles.actionButtonText, !isPro && styles.actionButtonTextDisabled]}>
                {isSharing ? 'Sharing...' : 'Share'}
              </Text>
              {!isPro && (
                <View style={styles.proLockBadge}>
                  <IconSymbol
                    ios_icon_name="lock.fill"
                    android_material_icon_name="lock"
                    size={14}
                    color={colors.background}
                  />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                buttonStyles.secondaryButton,
                styles.actionButton,
                !isPro && styles.actionButtonDisabled,
              ]}
              onPress={handlePrintWithProCheck}
              disabled={isSharing}
            >
              <IconSymbol
                ios_icon_name="printer.fill"
                android_material_icon_name="print"
                size={20}
                color={isPro ? colors.text : colors.textSecondary}
              />
              <Text style={[buttonStyles.buttonText, styles.actionButtonText, !isPro && styles.actionButtonTextDisabled]}>
                Print
              </Text>
              {!isPro && (
                <View style={styles.proLockBadge}>
                  <IconSymbol
                    ios_icon_name="lock.fill"
                    android_material_icon_name="lock"
                    size={14}
                    color={colors.text}
                  />
                </View>
              )}
            </TouchableOpacity>
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
  header: {
    marginBottom: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  shareableContainer: {
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  horseTitle: {
    ...typography.h1,
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  horseSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  remindersTable: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.highlight,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  tableHeaderText: {
    ...typography.captionMedium,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tableCell: {
    ...typography.body,
    color: colors.text,
  },
  tableCol1: {
    flex: 2,
  },
  tableCol2: {
    flex: 1.2,
  },
  photosGrid: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  photoItem: {
    flex: 1,
  },
  photoLabel: {
    ...typography.bodySemibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  photo: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
  },
  notesContainer: {
    backgroundColor: colors.highlight,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  notesText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  watermark: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    marginTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  watermarkText: {
    ...typography.small,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  actionsSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  actionsSectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  actionsSectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actionButtonText: {
    marginLeft: 0,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonTextDisabled: {
    color: colors.textSecondary,
  },
  proLockBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    padding: spacing.xs,
    borderWidth: 2,
    borderColor: colors.background,
  },
  bottomPadding: {
    height: 120,
  },
});
