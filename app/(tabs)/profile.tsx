
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { SavedSchedule } from '@/types/savedSchedule';
import { getAllSchedules, deleteSchedule } from '@/utils/storage';
import { cancelNotificationsForSchedule } from '@/utils/notifications';
import { formatTime } from '@/utils/timeCalculations';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<SavedSchedule[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Reload schedules when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadSchedules();
    }, [])
  );

  const handleEditSchedule = (schedule: SavedSchedule) => {
    try {
      // Navigate to home screen with schedule data
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
          <Text style={styles.title}>Saved Schedules</Text>
          <Text style={styles.subtitle}>Manage your event schedules</Text>
        </View>

        {loading ? (
          <View style={commonStyles.card}>
            <Text style={styles.emptyText}>Loading schedules...</Text>
          </View>
        ) : schedules.length === 0 ? (
          <View style={commonStyles.card}>
            <Text style={styles.emptyText}>No saved schedules yet.</Text>
            <Text style={styles.emptySubtext}>
              Create a schedule on the home screen and save it to see it here.
            </Text>
          </View>
        ) : (
          schedules.map((schedule) => (
            <View key={schedule.id} style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <View style={styles.scheduleHeaderLeft}>
                  <Text style={styles.scheduleName}>{schedule.name}</Text>
                  <Text style={styles.scheduleDate}>
                    Event: {formatDate(schedule.eventDate)}
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
                  <IconSymbol
                    ios_icon_name="clock.fill"
                    android_material_icon_name="schedule"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.detailText}>
                    Start: {formatTime(schedule.eventDetails.startTime)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <IconSymbol
                    ios_icon_name="gauge"
                    android_material_icon_name="speed"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.detailText}>
                    {schedule.eventDetails.horsesPerHour} horses/hour
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <IconSymbol
                    ios_icon_name="figure.equestrian.sports"
                    android_material_icon_name="pets"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.detailText}>
                    {schedule.horses.length} {schedule.horses.length === 1 ? 'horse' : 'horses'}
                  </Text>
                </View>
              </View>

              <View style={styles.scheduleActions}>
                <TouchableOpacity
                  style={[buttonStyles.secondaryButton, styles.scheduleButton]}
                  onPress={() => handleEditSchedule(schedule)}
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
                  onPress={() => handleDeleteSchedule(schedule)}
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
            </View>
          ))
        )}

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
    fontSize: 14,
    color: colors.textSecondary,
  },
  notificationBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 6,
    marginLeft: 8,
  },
  scheduleDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 15,
    color: colors.text,
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
  bottomPadding: {
    height: 120,
  },
});
