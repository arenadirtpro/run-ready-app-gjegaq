
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { EventDetails, Horse, Reminder } from '@/types/horse';
import { calculateEstimatedRunTime, calculateFiresAtTime } from '@/utils/timeCalculations';
import EventDetailsCard from '@/components/EventDetailsCard';
import HorseCard from '@/components/HorseCard';

export default function HomeScreen() {
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    startTime: null,
    horsesPerHour: '',
  });

  const [horses, setHorses] = useState<Horse[]>([]);

  // Recalculate run times when event details change
  useEffect(() => {
    console.log('Event details changed:', {
      startTime: eventDetails.startTime,
      horsesPerHour: eventDetails.horsesPerHour,
    });

    if (eventDetails.startTime && eventDetails.horsesPerHour) {
      const horsesPerHour = parseFloat(eventDetails.horsesPerHour);
      console.log('Parsed horses per hour:', horsesPerHour);
      
      if (horsesPerHour > 0) {
        const updatedHorses = horses.map(horse => {
          const drawNumber = parseInt(horse.drawNumber);
          console.log(`Processing horse ${horse.name}, draw number: ${drawNumber}`);
          
          if (drawNumber > 0) {
            const estimatedRunTime = calculateEstimatedRunTime(
              eventDetails.startTime,
              horsesPerHour,
              drawNumber
            );
            console.log(`Calculated run time for ${horse.name}:`, estimatedRunTime);
            
            // Update reminder fire times
            const updatedReminders = horse.reminders.map(reminder => ({
              ...reminder,
              firesAt: calculateFiresAtTime(estimatedRunTime, reminder.offsetMinutes),
            }));

            return {
              ...horse,
              estimatedRunTime,
              reminders: updatedReminders,
            };
          }
          return horse;
        });
        setHorses(updatedHorses);
      }
    }
  }, [eventDetails.startTime, eventDetails.horsesPerHour]);

  const handleAddHorse = () => {
    const newHorse: Horse = {
      id: Date.now().toString(),
      name: '',
      drawNumber: '',
      estimatedRunTime: null,
      reminders: [],
    };
    setHorses([...horses, newHorse]);
  };

  const handleUpdateHorse = (updatedHorse: Horse) => {
    const horsesPerHour = parseFloat(eventDetails.horsesPerHour);
    const drawNumber = parseInt(updatedHorse.drawNumber);
    
    console.log('Updating horse:', {
      name: updatedHorse.name,
      drawNumber,
      horsesPerHour,
      startTime: eventDetails.startTime,
    });
    
    if (eventDetails.startTime && horsesPerHour > 0 && drawNumber > 0) {
      const estimatedRunTime = calculateEstimatedRunTime(
        eventDetails.startTime,
        horsesPerHour,
        drawNumber
      );
      
      console.log('Calculated estimated run time:', estimatedRunTime);
      
      const updatedReminders = updatedHorse.reminders.map(reminder => ({
        ...reminder,
        firesAt: calculateFiresAtTime(estimatedRunTime, reminder.offsetMinutes),
      }));

      updatedHorse = {
        ...updatedHorse,
        estimatedRunTime,
        reminders: updatedReminders,
      };
    }

    setHorses(horses.map(h => (h.id === updatedHorse.id ? updatedHorse : h)));
  };

  const handleDeleteHorse = (horseId: string) => {
    setHorses(horses.filter(h => h.id !== horseId));
  };

  const handleSaveSchedule = () => {
    console.log('Saving schedule:', { eventDetails, horses });
    Alert.alert(
      'Schedule Saved',
      'Your schedule has been saved successfully!',
      [{ text: 'OK' }]
    );
  };

  const handleViewTodaysRuns = () => {
    console.log('Viewing today\'s runs');
    Alert.alert(
      'Today\'s Runs',
      'This feature will show all scheduled runs for today.',
      [{ text: 'OK' }]
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
          <Text style={styles.appTitle}>RunReady</Text>
          <Text style={styles.appSubtitle}>Precise Run Time Estimates</Text>
        </View>

        <EventDetailsCard
          eventDetails={eventDetails}
          onUpdateEventDetails={setEventDetails}
        />

        {horses.map((horse) => (
          <HorseCard
            key={horse.id}
            horse={horse}
            onUpdateHorse={handleUpdateHorse}
            onDeleteHorse={() => handleDeleteHorse(horse.id)}
          />
        ))}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[buttonStyles.secondaryButton, styles.actionButton]}
            onPress={handleAddHorse}
          >
            <Text style={buttonStyles.buttonText}>+ Add Another Horse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.primaryButton, styles.actionButton]}
            onPress={handleSaveSchedule}
          >
            <Text style={buttonStyles.buttonText}>Save Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonStyles.accentButton, styles.actionButton]}
            onPress={handleViewTodaysRuns}
          >
            <Text style={buttonStyles.buttonText}>View Today&apos;s Runs</Text>
          </TouchableOpacity>
        </View>

        {/* Extra padding for floating tab bar */}
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
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  actionsContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  actionButton: {
    width: '100%',
  },
  bottomPadding: {
    height: 120,
  },
});
