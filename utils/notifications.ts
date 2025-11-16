
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { SavedSchedule } from '@/types/savedSchedule';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }
    
    // Set up notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('runready-reminders', {
        name: 'RunReady Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

export const scheduleNotificationsForSchedule = async (
  schedule: SavedSchedule
): Promise<void> => {
  try {
    // Cancel any existing notifications for this schedule
    await cancelNotificationsForSchedule(schedule.id);
    
    if (!schedule.notificationsEnabled) {
      console.log('Notifications disabled for schedule:', schedule.id);
      return;
    }
    
    const now = new Date();
    let scheduledCount = 0;
    
    for (const horse of schedule.horses) {
      for (const reminder of horse.reminders) {
        if (reminder.firesAt && reminder.firesAt > now) {
          const trigger = new Date(reminder.firesAt);
          
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${horse.name} - ${reminder.label}`,
              body: `Time for ${reminder.label}. ${horse.name} runs at ${formatTime(horse.estimatedRunTime)}.`,
              data: {
                scheduleId: schedule.id,
                horseId: horse.id,
                reminderId: reminder.id,
              },
              sound: 'default',
            },
            trigger: {
              date: trigger,
              channelId: Platform.OS === 'android' ? 'runready-reminders' : undefined,
            },
          });
          
          scheduledCount++;
          console.log(`Scheduled notification for ${horse.name} - ${reminder.label} at ${trigger}`);
        }
      }
    }
    
    console.log(`Scheduled ${scheduledCount} notifications for schedule ${schedule.id}`);
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    throw error;
  }
};

export const cancelNotificationsForSchedule = async (
  scheduleId: string
): Promise<void> => {
  try {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of allNotifications) {
      if (notification.content.data?.scheduleId === scheduleId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
    
    console.log('Cancelled notifications for schedule:', scheduleId);
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
};

const formatTime = (date: Date | null): string => {
  if (!date) {
    return '--:--';
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${ampm}`;
};
