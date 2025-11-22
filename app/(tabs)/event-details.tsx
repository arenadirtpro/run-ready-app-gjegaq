
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { SavedSchedule } from '@/types/savedSchedule';
import { formatTime } from '@/utils/timeCalculations';
import { IconSymbol } from '@/components/IconSymbol';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import * as SMS from 'expo-sms';

export default function EventDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isSharing, setIsSharing] = useState(false);

  let schedule: SavedSchedule | null = null;
  try {
    if (params.scheduleData && typeof params.scheduleData === 'string') {
      const parsed = JSON.parse(params.scheduleData);
      schedule = {
        ...parsed,
        eventDetails: {
          ...parsed.eventDetails,
          startTime: parsed.eventDetails.startTime ? new Date(parsed.eventDetails.startTime) : null,
        },
        horses: parsed.horses.map((horse: any) => ({
          ...horse,
          estimatedRunTime: horse.estimatedRunTime ? new Date(horse.estimatedRunTime) : null,
          reminders: horse.reminders.map((reminder: any) => ({
            ...reminder,
            firesAt: reminder.firesAt ? new Date(reminder.firesAt) : null,
          })),
        })),
      };
    }
  } catch (error) {
    console.error('Error parsing schedule data:', error);
  }

  if (!schedule) {
    return (
      <View style={commonStyles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load event details</Text>
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatOffsetLabel = (offsetMinutes: number): string => {
    if (offsetMinutes < 60) {
      return `${offsetMinutes} min`;
    }
    const hours = offsetMinutes / 60;
    if (hours === 1) {
      return '1 hr';
    }
    if (hours % 1 === 0) {
      return `${hours} hrs`;
    }
    return `${hours} hrs`;
  };

  const generateEventHTML = (): string => {
    const horsesHTML = schedule!.horses.map((horse, index) => {
      const remindersHTML = horse.reminders.length > 0
        ? `
          <div style="margin-top: 10px;">
            <h4 style="margin: 5px 0; color: #5D6D7E; font-size: 14px;">Pre-Run Reminders:</h4>
            <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
              <thead>
                <tr style="background-color: #ECF0F1;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #BDC3C7; font-size: 12px;">Task</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #BDC3C7; font-size: 12px;">Time Before</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #BDC3C7; font-size: 12px;">Alert Time</th>
                </tr>
              </thead>
              <tbody>
                ${horse.reminders.map(reminder => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #BDC3C7; font-size: 12px;">${reminder.label}</td>
                    <td style="padding: 8px; border: 1px solid #BDC3C7; font-size: 12px;">${formatOffsetLabel(reminder.offsetMinutes)}</td>
                    <td style="padding: 8px; border: 1px solid #BDC3C7; font-size: 12px;">${formatTime(reminder.firesAt)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `
        : '';

      return `
        <div style="background-color: #FFFFFF; border: 1px solid #BDC3C7; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0; color: #2C3E50; font-size: 18px;">${horse.name || `Horse #${horse.drawNumber}`}</h3>
            <span style="background-color: #D5DBDB; padding: 5px 10px; border-radius: 5px; font-size: 14px; font-weight: bold;">Draw #${horse.drawNumber}</span>
          </div>
          <div style="background-color: #ECF0F1; padding: 10px; border-radius: 5px;">
            <p style="margin: 0; color: #5D6D7E; font-size: 14px;">Estimated Run Time:</p>
            <p style="margin: 5px 0 0 0; color: #2C3E50; font-size: 20px; font-weight: bold;">${formatTime(horse.estimatedRunTime)}</p>
          </div>
          ${remindersHTML}
        </div>
      `;
    }).join('');

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
            <h1 style="color: #5D6D7E; margin-bottom: 10px; font-size: 28px;">${schedule!.name}</h1>
            <p style="color: #7F8C8D; font-size: 16px; margin: 5px 0;">${formatDate(schedule!.eventDate)}</p>
          </div>
          
          <div style="background-color: #FFFFFF; border: 1px solid #BDC3C7; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <h2 style="color: #5D6D7E; margin-top: 0; font-size: 20px;">Event Details</h2>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #7F8C8D; font-size: 14px;">Start Time:</span>
              <span style="color: #2C3E50; font-weight: bold; font-size: 14px;">${formatTime(schedule!.eventDetails.startTime)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #7F8C8D; font-size: 14px;">Horses Per Hour:</span>
              <span style="color: #2C3E50; font-weight: bold; font-size: 14px;">${schedule!.eventDetails.horsesPerHour}</span>
            </div>
          </div>

          <h2 style="color: #5D6D7E; font-size: 20px;">Horses & Run Times</h2>
          ${horsesHTML}

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #BDC3C7;">
            <p style="color: #7F8C8D; font-size: 12px; margin: 0;">Generated by RunReady</p>
          </div>
        </body>
      </html>
    `;
  };

  const generatePlainTextSummary = (): string => {
    let text = `${schedule!.name}\n`;
    text += `${formatDate(schedule!.eventDate)}\n\n`;
    text += `EVENT DETAILS\n`;
    text += `Start Time: ${formatTime(schedule!.eventDetails.startTime)}\n`;
    text += `Horses Per Hour: ${schedule!.eventDetails.horsesPerHour}\n\n`;
    text += `HORSES & RUN TIMES\n`;
    text += `${'='.repeat(40)}\n\n`;

    schedule!.horses.forEach((horse, index) => {
      text += `${horse.name || `Horse #${horse.drawNumber}`} (Draw #${horse.drawNumber})\n`;
      text += `Estimated Run Time: ${formatTime(horse.estimatedRunTime)}\n`;
      
      if (horse.reminders.length > 0) {
        text += `\nPre-Run Reminders:\n`;
        horse.reminders.forEach(reminder => {
          text += `  • ${reminder.label} - ${formatOffsetLabel(reminder.offsetMinutes)} before (${formatTime(reminder.firesAt)})\n`;
        });
      }
      
      text += `\n${'-'.repeat(40)}\n\n`;
    });

    text += `Generated by RunReady`;
    return text;
  };

  const handlePrint = async () => {
    try {
      setIsSharing(true);
      const html = generateEventHTML();
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
      const html = generateEventHTML();
      const { uri } = await Print.printToFileAsync({ html });
      console.log('PDF saved to:', uri);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: `Share ${schedule!.name}`,
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

      const plainText = generatePlainTextSummary();
      const html = generateEventHTML();

      const result = await MailComposer.composeAsync({
        subject: `${schedule!.name} - Event Schedule`,
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
    Alert.alert(
      'Share Event Details',
      'Choose how you would like to share this event',
      [
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

        <View style={styles.titleSection}>
          <Text style={styles.eventTitle}>{schedule.name}</Text>
          <Text style={styles.eventDate}>{formatDate(schedule.eventDate)}</Text>
          {schedule.notificationsEnabled && (
            <View style={styles.notificationBadge}>
              <IconSymbol
                ios_icon_name="bell.fill"
                android_material_icon_name="notifications"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.notificationBadgeText}>Notifications Active</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Time:</Text>
            <Text style={styles.detailValue}>
              {formatTime(schedule.eventDetails.startTime)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Horses Per Hour:</Text>
            <Text style={styles.detailValue}>
              {schedule.eventDetails.horsesPerHour}
            </Text>
          </View>
        </View>

        <Text style={styles.horsesTitle}>Horses & Run Times</Text>

        {schedule.horses.map((horse, index) => (
          <View key={index} style={styles.horseCard}>
            <View style={styles.horseHeader}>
              <View style={styles.horseHeaderLeft}>
                <Text style={styles.horseName}>
                  {horse.name || `Horse #${horse.drawNumber}`}
                </Text>
                <View style={styles.drawBadge}>
                  <Text style={styles.drawBadgeText}>Draw #{horse.drawNumber}</Text>
                </View>
              </View>
            </View>

            <View style={styles.runTimeSection}>
              <Text style={styles.runTimeLabel}>Estimated Run Time</Text>
              <Text style={styles.runTimeValue}>
                {formatTime(horse.estimatedRunTime)}
              </Text>
            </View>

            {horse.reminders.length > 0 && (
              <View style={styles.remindersSection}>
                <Text style={styles.remindersSectionTitle}>Pre-Run Reminders</Text>
                <View style={styles.remindersTable}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.tableCol1]}>Task</Text>
                    <Text style={[styles.tableHeaderText, styles.tableCol2]}>Before</Text>
                    <Text style={[styles.tableHeaderText, styles.tableCol3]}>Alert Time</Text>
                  </View>
                  {horse.reminders.map((reminder, rIndex) => (
                    <View key={rIndex} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.tableCol1]}>
                        {reminder.label}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCol2]}>
                        {formatOffsetLabel(reminder.offsetMinutes)}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCol3]}>
                        {formatTime(reminder.firesAt)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}

        <View style={styles.actionsSection}>
          <Text style={styles.actionsSectionTitle}>Share or Print</Text>
          <Text style={styles.actionsSectionSubtitle}>
            Share this schedule with friends, family, or your barn manager
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[buttonStyles.primaryButton, styles.actionButton]}
              onPress={handleShare}
              disabled={isSharing}
            >
              <IconSymbol
                ios_icon_name="square.and.arrow.up.fill"
                android_material_icon_name="share"
                size={20}
                color={colors.background}
              />
              <Text style={[buttonStyles.buttonText, styles.actionButtonText]}>
                Share
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[buttonStyles.secondaryButton, styles.actionButton]}
              onPress={handlePrint}
              disabled={isSharing}
            >
              <IconSymbol
                ios_icon_name="printer.fill"
                android_material_icon_name="print"
                size={20}
                color={colors.text}
              />
              <Text style={[buttonStyles.buttonText, styles.actionButtonText]}>
                Print
              </Text>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 17,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  eventDate: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  notificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  notificationBadgeText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '700',
  },
  horsesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  horseCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  horseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  horseHeaderLeft: {
    flex: 1,
  },
  horseName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  drawBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  drawBadgeText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  runTimeSection: {
    backgroundColor: colors.highlight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  runTimeLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  runTimeValue: {
    fontSize: 24,
    color: colors.text,
    fontWeight: '800',
  },
  remindersSection: {
    marginTop: 4,
  },
  remindersSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  remindersTable: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.highlight,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tableCell: {
    fontSize: 13,
    color: colors.text,
  },
  tableCol1: {
    flex: 2,
  },
  tableCol2: {
    flex: 1.2,
  },
  tableCol3: {
    flex: 1.3,
  },
  actionsSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  actionsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  actionsSectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionButtonText: {
    marginLeft: 0,
  },
  bottomPadding: {
    height: 120,
  },
});
