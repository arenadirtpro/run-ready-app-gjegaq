
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { colors, commonStyles, buttonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { HorseTemplate, ReminderTemplate } from '@/types/horseTemplate';
import { saveHorseTemplate } from '@/utils/horseTemplateStorage';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function HorseEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [horseName, setHorseName] = useState('');
  const [reminders, setReminders] = useState<ReminderTemplate[]>([]);
  const [saddlePhotoUri, setSaddlePhotoUri] = useState<string | null>(null);
  const [bitPhotoUri, setBitPhotoUri] = useState<string | null>(null);
  const [preRunNotes, setPreRunNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (params.templateData && typeof params.templateData === 'string') {
      try {
        const template: HorseTemplate = JSON.parse(params.templateData);
        setHorseName(template.name);
        setReminders(template.reminderTemplates);
        setSaddlePhotoUri(template.saddlePhotoUri || null);
        setBitPhotoUri(template.bitPhotoUri || null);
        setPreRunNotes(template.preRunNotes || '');
        setEditingId(template.id);
        console.log('Loaded template for editing:', template.id);
      } catch (error) {
        console.error('Error loading template:', error);
      }
    }
  }, [params.templateData]);

  const handleAddReminder = () => {
    const newReminder: ReminderTemplate = {
      id: Date.now().toString(),
      label: '',
      offsetMinutes: 60,
    };
    setReminders([...reminders, newReminder]);
  };

  const handleUpdateReminder = (id: string, field: 'label' | 'offsetMinutes', value: string | number) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const handlePickImage = async (type: 'saddle' | 'bit') => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload images.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'saddle') {
          setSaddlePhotoUri(result.assets[0].uri);
        } else {
          setBitPhotoUri(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!horseName.trim()) {
      Alert.alert('Missing Information', 'Please enter a horse name.');
      return;
    }

    const invalidReminders = reminders.filter(r => !r.label.trim());
    if (invalidReminders.length > 0) {
      Alert.alert('Missing Information', 'Please fill in all reminder labels or remove empty reminders.');
      return;
    }

    setIsSaving(true);

    try {
      const now = new Date().toISOString();
      const template: HorseTemplate = {
        id: editingId || Date.now().toString(),
        name: horseName.trim(),
        reminderTemplates: reminders,
        incentiveRegistrations: [],
        saddlePhotoUri: saddlePhotoUri || undefined,
        bitPhotoUri: bitPhotoUri || undefined,
        preRunNotes: preRunNotes.trim() || undefined,
        createdAt: editingId ? params.createdAt as string : now,
        updatedAt: now,
      };

      await saveHorseTemplate(template);

      Alert.alert(
        'Success',
        `Horse profile "${horseName}" has been saved!`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving horse template:', error);
      Alert.alert('Error', 'Failed to save horse profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatOffsetOptions = () => {
    return [
      { label: '15 min', value: 15 },
      { label: '20 min', value: 20 },
      { label: '30 min', value: 30 },
      { label: '45 min', value: 45 },
      { label: '1 hr', value: 60 },
      { label: '1.5 hrs', value: 90 },
      { label: '2 hrs', value: 120 },
      { label: '3 hrs', value: 180 },
      { label: '4 hrs', value: 240 },
    ];
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
          <Text style={styles.title}>
            {editingId ? 'Edit Horse Profile' : 'New Horse Profile'}
          </Text>
          <Text style={styles.subtitle}>
            Create a master profile with pre-run reminders and tack photos
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Horse Name *</Text>
            <TextInput
              style={styles.input}
              value={horseName}
              onChangeText={setHorseName}
              placeholder="e.g., Test Horse 1"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

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
          <Text style={styles.sectionDescription}>
            Add medication, supplements, or preparation tasks that this horse always needs
          </Text>

          {reminders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No reminders yet</Text>
            </View>
          ) : (
            <View style={styles.remindersList}>
              {reminders.map((reminder, index) => (
                <View key={reminder.id} style={styles.reminderCard}>
                  <View style={styles.reminderHeader}>
                    <Text style={styles.reminderNumber}>Reminder {index + 1}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteReminder(reminder.id)}
                      style={styles.deleteReminderButton}
                    >
                      <IconSymbol
                        ios_icon_name="trash.fill"
                        android_material_icon_name="delete"
                        size={20}
                        color={colors.danger}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.reminderInputGroup}>
                    <Text style={styles.label}>Task Description *</Text>
                    <TextInput
                      style={styles.input}
                      value={reminder.label}
                      onChangeText={(text) => handleUpdateReminder(reminder.id, 'label', text)}
                      placeholder="e.g., 4cc of Lasix"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  <View style={styles.reminderInputGroup}>
                    <Text style={styles.label}>Time Before Run</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.offsetOptionsScroll}
                    >
                      {formatOffsetOptions().map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.offsetOption,
                            reminder.offsetMinutes === option.value && styles.offsetOptionSelected,
                          ]}
                          onPress={() => handleUpdateReminder(reminder.id, 'offsetMinutes', option.value)}
                        >
                          <Text
                            style={[
                              styles.offsetOptionText,
                              reminder.offsetMinutes === option.value && styles.offsetOptionTextSelected,
                            ]}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.addReminderButton}
            onPress={handleAddReminder}
          >
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add_circle"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.addReminderText}>Add Reminder</Text>
          </TouchableOpacity>
        </View>

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
          <Text style={styles.sectionDescription}>
            Upload photos so anyone can get your horse ready
          </Text>

          <View style={styles.photoSection}>
            <Text style={styles.photoLabel}>Saddle Photo</Text>
            {saddlePhotoUri ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: saddlePhotoUri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => setSaddlePhotoUri(null)}
                >
                  <IconSymbol
                    ios_icon_name="xmark.circle.fill"
                    android_material_icon_name="cancel"
                    size={28}
                    color={colors.danger}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handlePickImage('saddle')}
              >
                <IconSymbol
                  ios_icon_name="photo.badge.plus"
                  android_material_icon_name="add_photo_alternate"
                  size={32}
                  color={colors.textSecondary}
                />
                <Text style={styles.uploadButtonText}>Upload Saddle Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.photoSection}>
            <Text style={styles.photoLabel}>Bit Photo</Text>
            {bitPhotoUri ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: bitPhotoUri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => setBitPhotoUri(null)}
                >
                  <IconSymbol
                    ios_icon_name="xmark.circle.fill"
                    android_material_icon_name="cancel"
                    size={28}
                    color={colors.danger}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handlePickImage('bit')}
              >
                <IconSymbol
                  ios_icon_name="photo.badge.plus"
                  android_material_icon_name="add_photo_alternate"
                  size={32}
                  color={colors.textSecondary}
                />
                <Text style={styles.uploadButtonText}>Upload Bit Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

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
          <Text style={styles.sectionDescription}>
            Document warm-up routines, special instructions, or preparation details
          </Text>

          <TextInput
            style={styles.notesInput}
            value={preRunNotes}
            onChangeText={setPreRunNotes}
            placeholder="e.g., Warm up for 10 minutes, walk in circles, avoid loud noises..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[buttonStyles.primaryButton, styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={buttonStyles.buttonText}>
            {isSaving ? 'Saving...' : editingId ? 'Update Profile' : 'Save Profile'}
          </Text>
        </TouchableOpacity>

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
    marginBottom: spacing.md,
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
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
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
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  sectionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    color: colors.text,
  },
  emptyState: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyStateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  remindersList: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  reminderCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reminderNumber: {
    ...typography.bodySemibold,
    color: colors.text,
  },
  deleteReminderButton: {
    padding: spacing.xs,
  },
  reminderInputGroup: {
    marginBottom: spacing.md,
  },
  offsetOptionsScroll: {
    marginTop: spacing.sm,
  },
  offsetOption: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.sm,
  },
  offsetOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  offsetOptionText: {
    ...typography.bodySemibold,
    color: colors.text,
  },
  offsetOptionTextSelected: {
    color: colors.background,
  },
  addReminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addReminderText: {
    ...typography.bodySemibold,
    color: colors.primary,
  },
  photoSection: {
    marginBottom: spacing.xl,
  },
  photoLabel: {
    ...typography.bodySemibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  photoContainer: {
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
  },
  removePhotoButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
  },
  uploadButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  uploadButtonText: {
    ...typography.bodySemibold,
    color: colors.textSecondary,
  },
  notesInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
  },
  saveButton: {
    marginTop: spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  bottomPadding: {
    height: 120,
  },
});
