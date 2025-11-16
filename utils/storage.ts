
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedSchedule } from '@/types/savedSchedule';

const SCHEDULES_KEY = '@runready_schedules';

export const saveSchedule = async (schedule: SavedSchedule): Promise<void> => {
  try {
    const existingSchedules = await getAllSchedules();
    const scheduleIndex = existingSchedules.findIndex(s => s.id === schedule.id);
    
    if (scheduleIndex >= 0) {
      existingSchedules[scheduleIndex] = schedule;
    } else {
      existingSchedules.push(schedule);
    }
    
    await AsyncStorage.setItem(SCHEDULES_KEY, JSON.stringify(existingSchedules));
    console.log('Schedule saved successfully:', schedule.id);
  } catch (error) {
    console.error('Error saving schedule:', error);
    throw error;
  }
};

export const getAllSchedules = async (): Promise<SavedSchedule[]> => {
  try {
    const schedulesJson = await AsyncStorage.getItem(SCHEDULES_KEY);
    if (!schedulesJson) {
      return [];
    }
    
    const schedules = JSON.parse(schedulesJson);
    
    // Parse dates back to Date objects
    return schedules.map((schedule: any) => ({
      ...schedule,
      eventDetails: {
        ...schedule.eventDetails,
        startTime: schedule.eventDetails.startTime ? new Date(schedule.eventDetails.startTime) : null,
      },
      horses: schedule.horses.map((horse: any) => ({
        ...horse,
        estimatedRunTime: horse.estimatedRunTime ? new Date(horse.estimatedRunTime) : null,
        reminders: horse.reminders.map((reminder: any) => ({
          ...reminder,
          firesAt: reminder.firesAt ? new Date(reminder.firesAt) : null,
        })),
      })),
    }));
  } catch (error) {
    console.error('Error loading schedules:', error);
    return [];
  }
};

export const getScheduleById = async (id: string): Promise<SavedSchedule | null> => {
  try {
    const schedules = await getAllSchedules();
    return schedules.find(s => s.id === id) || null;
  } catch (error) {
    console.error('Error loading schedule:', error);
    return null;
  }
};

export const deleteSchedule = async (id: string): Promise<void> => {
  try {
    const schedules = await getAllSchedules();
    const filteredSchedules = schedules.filter(s => s.id !== id);
    await AsyncStorage.setItem(SCHEDULES_KEY, JSON.stringify(filteredSchedules));
    console.log('Schedule deleted successfully:', id);
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
};
