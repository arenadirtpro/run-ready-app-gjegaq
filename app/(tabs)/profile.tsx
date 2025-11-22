
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { SavedSchedule } from '@/types/savedSchedule';
import { getAllSchedules, deleteSchedule } from '@/utils/storage';
import { cancelNotificationsForSchedule } from '@/utils/notifications';
import { formatTime } from '@/utils/timeCalculations';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as MailComposer from 'expo-mail-composer';

export default function ProfileScreen() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<SavedSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'feedback' | 'feature'>('feedback');
  const [feedbackText, setFeedbackText] = useState('');

  const loadSchedules = async () => {
    try {
      const loadedSchedules = await getAllSchedules();
      setSchedules(loadedSchedules);
      console.log('Loaded schedules:', loadedSchedules.length);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSchedules();
    }, [])
  );

  const handleViewSchedule = (schedule: SavedSchedule) => {
    try {
      console.log('Navigating to event details for schedule:', schedule.id);
      router.push({
        pathname: '/(tabs)/event-details',
        params: {
          scheduleData: JSON.stringify(schedule),
        },
      });
    } catch (error) {
      console.error('Error navigating to event details:', error);
      Alert.alert('Error', 'Failed to open event details. Please try again.');
    }
  };

  const handleEditSchedule = (schedule: SavedSchedule) => {
    try {
      router.push({
        pathname: '/(tabs)/(home)',
        params: {
          scheduleData: JSON.stringify(schedule),
        },
      });
    } catch (error) {
      console.error('Error navigating to edit schedule:', error);
      Alert.alert('Error', 'Failed to load schedule for editing. Please try again.');
    }
  };

  const handleDeleteSchedule = (schedule: SavedSchedule) => {
    Alert.alert(
      'Delete Schedule',
      `Are you sure you want to delete "${schedule.name}"? This will also cancel all associated notifications.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelNotificationsForSchedule(schedule.id);
              await deleteSchedule(schedule.id);
              await loadSchedules();
              Alert.alert('Success', 'Schedule deleted successfully.');
            } catch (error) {
              console.error('Error deleting schedule:', error);
              Alert.alert('Error', 'Failed to delete schedule. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleOpenFeedbackModal = (type: 'feedback' | 'feature') => {
    setFeedbackType(type);
    setFeedbackText('');
    setFeedbackModalVisible(true);
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Error', 'Please enter your feedback before sending.');
      return;
    }

    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      
      if (!isAvailable) {
        Alert.alert(
          'Email Not Available',
          'Email is not configured on this device. Please set up an email account in your device settings.'
        );
        return;
      }

      const subject = feedbackType === 'feedback' 
        ? 'RunReady App - User Feedback' 
        : 'RunReady App - Feature Request';
      
      const body = `${feedbackType === 'feedback' ? 'Feedback' : 'Feature Request'}:\n\n${feedbackText}\n\n---\nSent from RunReady App`;

      const result = await MailComposer.composeAsync({
        recipients: ['feedback@runreadyapp.com'],
        subject: subject,
        body: body,
      });

      console.log('Mail composer result:', result);

      if (result.status === 'sent' || result.status === 'saved') {
        setFeedbackModalVisible(false);
        setFeedbackText('');
        Alert.alert(
          'Thank You!',
          'Thank you for your feedback! We appreciate your input and will review it carefully.'
        );
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      Alert.alert(
        'Error',
        'Failed to open email composer. Please try again or contact us directly at feedback@runreadyapp.com'
      );
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Saved Events</Text>
          <Text style={styles.subtitle}>Manage your event schedules</Text>
        </View>

        {loading ? (
          <View style={commonStyles.card}>
            <Text style={styles.emptyText}>Loading schedules...</Text>
          </View>
        ) : schedules.length === 0 ? (
          <View style={commonStyles.card}>
            <Text style={styles.emptyText}>No saved events yet.</Text>
            <Text style={styles.emptySubtext}>
              Create a schedule on the home screen and save it to see it here.
            </Text>
          </View>
        ) : (
          schedules.map((schedule) => (
            <TouchableOpacity
              key={schedule.id}
              style={styles.scheduleCard}
              onPress={() => handleViewSchedule(schedule)}
              activeOpacity={0.7}
            >
              <View style={styles.scheduleHeader}>
                <View style={styles.scheduleHeaderLeft}>
                  <Text style={styles.scheduleName}>{schedule.name}</Text>
                  <Text style={styles.scheduleDate}>
                    {formatDate(schedule.eventDate)}
                  </Text>
                </View>
                {schedule.notificationsEnabled && (
                  <View style={styles.notificationBadge}>
                    <IconSymbol
                      ios_icon_name="bell.fill"
                      android_material_icon_name="notifications"
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                )}
              </View>

              <View style={styles.scheduleDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Start Time:</Text>
                  <Text style={styles.detailValue}>
                    {formatTime(schedule.eventDetails.startTime)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Horses/Hour:</Text>
                  <Text style={styles.detailValue}>
                    {schedule.eventDetails.horsesPerHour}
                  </Text>
                </View>
              </View>

              {schedule.horses.length > 0 && (
                <View style={styles.horsesSection}>
                  <Text style={styles.horsesSectionTitle}>Estimated Run Times:</Text>
                  {schedule.horses.map((horse, index) => (
                    <View key={index} style={styles.horseRow}>
                      <Text style={styles.horseName}>
                        {horse.name || `Horse #${horse.drawNumber}`}
                      </Text>
                      <Text style={styles.horseRunTime}>
                        {horse.estimatedRunTime ? formatTime(horse.estimatedRunTime) : 'N/A'}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.scheduleActions}>
                <TouchableOpacity
                  style={[buttonStyles.secondaryButton, styles.scheduleButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEditSchedule(schedule);
                  }}
                >
                  <IconSymbol
                    ios_icon_name="pencil"
                    android_material_icon_name="edit"
                    size={18}
                    color={colors.text}
                  />
                  <Text style={[buttonStyles.buttonText, styles.buttonTextWithIcon]}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[buttonStyles.dangerButton, styles.scheduleButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteSchedule(schedule);
                  }}
                >
                  <IconSymbol
                    ios_icon_name="trash.fill"
                    android_material_icon_name="delete"
                    size={18}
                    color={colors.background}
                  />
                  <Text style={[buttonStyles.buttonText, styles.buttonTextWithIcon]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackSectionTitle}>Help Us Improve</Text>
          <Text style={styles.feedbackSectionSubtitle}>
            We&apos;d love to hear your thoughts and ideas!
          </Text>
          
          <View style={styles.feedbackButtons}>
            <TouchableOpacity
              style={[buttonStyles.primaryButton, styles.feedbackButton]}
              onPress={() => handleOpenFeedbackModal('feedback')}
            >
              <IconSymbol
                ios_icon_name="bubble.left.and.bubble.right.fill"
                android_material_icon_name="feedback"
                size={20}
                color={colors.background}
              />
              <Text style={[buttonStyles.buttonText, styles.feedbackButtonText]}>
                Send Feedback
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[buttonStyles.secondaryButton, styles.feedbackButton]}
              onPress={() => handleOpenFeedbackModal('feature')}
            >
              <IconSymbol
                ios_icon_name="lightbulb.fill"
                android_material_icon_name="lightbulb"
                size={20}
                color={colors.text}
              />
              <Text style={[buttonStyles.buttonText, styles.feedbackButtonText]}>
                Request Feature
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal
        visible={feedbackModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {feedbackType === 'feedback' ? 'Send Feedback' : 'Request a Feature'}
              </Text>
              <TouchableOpacity
                onPress={() => setFeedbackModalVisible(false)}
                style={styles.closeButton}
              >
                <IconSymbol
                  ios_icon_name="xmark.circle.fill"
                  android_material_icon_name="cancel"
                  size={28}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              {feedbackType === 'feedback'
                ? 'Tell us what you think about RunReady. Your feedback helps us improve the app!'
                : 'Have an idea for a new feature? Let us know what you&apos;d like to see in RunReady!'}
            </Text>

            <TextInput
              style={styles.feedbackInput}
              placeholder={
                feedbackType === 'feedback'
                  ? 'Share your thoughts...'
                  : 'Describe your feature idea...'
              }
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              value={feedbackText}
              onChangeText={setFeedbackText}
              maxLength={1000}
            />

            <Text style={styles.characterCount}>
              {feedbackText.length}/1000 characters
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[buttonStyles.secondaryButton, styles.modalButton]}
                onPress={() => setFeedbackModalVisible(false)}
              >
                <Text style={buttonStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.primaryButton, styles.modalButton]}
                onPress={handleSendFeedback}
              >
                <IconSymbol
                  ios_icon_name="paperplane.fill"
                  android_material_icon_name="send"
                  size={18}
                  color={colors.background}
                />
                <Text style={[buttonStyles.buttonText, styles.sendButtonText]}>
                  Send
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scheduleCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scheduleHeaderLeft: {
    flex: 1,
  },
  scheduleName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  scheduleDate: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  notificationBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 6,
    marginLeft: 8,
  },
  scheduleDetails: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  horsesSection: {
    marginBottom: 16,
  },
  horsesSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  horseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: colors.highlight,
    borderRadius: 6,
    marginBottom: 4,
  },
  horseName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  horseRunTime: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonTextWithIcon: {
    marginLeft: 0,
  },
  feedbackSection: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  feedbackSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  feedbackSectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  feedbackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  feedbackButtonText: {
    marginLeft: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  feedbackInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 150,
    maxHeight: 250,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  sendButtonText: {
    marginLeft: 6,
  },
  bottomPadding: {
    height: 120,
  },
});
