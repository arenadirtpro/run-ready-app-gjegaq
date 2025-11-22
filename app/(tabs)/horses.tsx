
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import { colors, commonStyles, buttonStyles, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { HorseTemplate } from '@/types/horseTemplate';
import { getAllHorseTemplates, deleteHorseTemplate } from '@/utils/horseTemplateStorage';
import { isProUser } from '@/utils/subscription';
import { IconSymbol } from '@/components/IconSymbol';
import { useFocusEffect, useRouter } from 'expo-router';

export default function HorsesScreen() {
  const router = useRouter();
  const [templates, setTemplates] = useState<HorseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  const loadTemplates = async () => {
    try {
      const proStatus = await isProUser();
      setIsPro(proStatus);
      
      if (proStatus) {
        const loadedTemplates = await getAllHorseTemplates();
        setTemplates(loadedTemplates);
        console.log('Loaded horse templates:', loadedTemplates.length);
      }
    } catch (error) {
      console.error('Error loading horse templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadTemplates();
    }, [])
  );

  const handleAddTemplate = () => {
    if (!isPro) {
      setShowProModal(true);
      return;
    }
    
    router.push('/(tabs)/horse-editor');
  };

  const handleEditTemplate = (template: HorseTemplate) => {
    router.push({
      pathname: '/(tabs)/horse-editor',
      params: {
        templateData: JSON.stringify(template),
        createdAt: template.createdAt,
      },
    });
  };

  const handleViewTemplate = (template: HorseTemplate) => {
    router.push({
      pathname: '/(tabs)/horse-card-details',
      params: {
        templateData: JSON.stringify(template),
      },
    });
  };

  const handleDeleteTemplate = (template: HorseTemplate) => {
    Alert.alert(
      'Delete Horse Profile',
      `Are you sure you want to delete "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHorseTemplate(template.id);
              await loadTemplates();
              Alert.alert('Success', 'Horse profile deleted successfully.');
            } catch (error) {
              console.error('Error deleting template:', error);
              Alert.alert('Error', 'Failed to delete profile. Please try again.');
            }
          },
        },
      ]
    );
  };

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

  if (!isPro) {
    return (
      <View style={commonStyles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Horse Profiles</Text>
            <Text style={styles.subtitle}>Pro Feature</Text>
          </View>

          <View style={styles.proCard}>
            <IconSymbol
              ios_icon_name="star.fill"
              android_material_icon_name="star"
              size={48}
              color={colors.primary}
            />
            <Text style={styles.proTitle}>Upgrade to Pro</Text>
            <Text style={styles.proDescription}>
              Create horse profiles with master settings that auto-load into new events. Save medication schedules, tack photos, and pre-run rituals.
            </Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.featureText}>Save horse profiles with custom settings</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.featureText}>Pre-run medication templates</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.featureText}>Upload saddle and bit photos</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.featureText}>Document pre-run rituals and notes</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.featureText}>Print and share horse cards</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[buttonStyles.primaryButton, styles.upgradeButton]}
              onPress={() => router.push('/(tabs)/subscription')}
            >
              <Text style={buttonStyles.buttonText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        <Modal
          visible={showProModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowProModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <IconSymbol
                ios_icon_name="star.circle.fill"
                android_material_icon_name="stars"
                size={56}
                color={colors.primary}
              />
              <Text style={styles.modalTitle}>Pro Feature</Text>
              <Text style={styles.modalText}>
                Horse profiles are available in the Pro version. Upgrade to create unlimited horse profiles with master settings.
              </Text>

              <TouchableOpacity
                style={[buttonStyles.primaryButton, styles.modalButton]}
                onPress={() => {
                  setShowProModal(false);
                  router.push('/(tabs)/subscription');
                }}
              >
                <Text style={buttonStyles.buttonText}>View Pro Plans</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.secondaryButton, styles.modalButton]}
                onPress={() => setShowProModal(false)}
              >
                <Text style={buttonStyles.buttonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
          <Text style={styles.title}>Horse Profiles</Text>
          <Text style={styles.subtitle}>Manage your horse profiles</Text>
        </View>

        <TouchableOpacity
          style={[buttonStyles.primaryButton, styles.addButton]}
          onPress={handleAddTemplate}
        >
          <IconSymbol
            ios_icon_name="plus.circle.fill"
            android_material_icon_name="add_circle"
            size={20}
            color={colors.background}
          />
          <Text style={[buttonStyles.buttonText, styles.addButtonText]}>
            Add Horse Profile
          </Text>
        </TouchableOpacity>

        {loading ? (
          <View style={commonStyles.card}>
            <Text style={styles.emptyText}>Loading profiles...</Text>
          </View>
        ) : templates.length === 0 ? (
          <View style={commonStyles.card}>
            <Text style={styles.emptyText}>No horse profiles yet.</Text>
            <Text style={styles.emptySubtext}>
              Create a profile to save horse-specific settings and reminders.
            </Text>
          </View>
        ) : (
          templates.map((template) => (
            <View key={template.id} style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <View style={styles.templateHeaderLeft}>
                  <IconSymbol
                    ios_icon_name="figure.equestrian.sports"
                    android_material_icon_name="pets"
                    size={28}
                    color={colors.primary}
                  />
                  <Text style={styles.templateName}>{template.name}</Text>
                </View>
              </View>

              {(template.saddlePhotoUri || template.bitPhotoUri) && (
                <View style={styles.photosSection}>
                  <Text style={styles.sectionTitle}>Tack Photos:</Text>
                  <View style={styles.photosGrid}>
                    {template.saddlePhotoUri && (
                      <View style={styles.photoItem}>
                        <Image source={{ uri: template.saddlePhotoUri }} style={styles.photoThumbnail} />
                        <Text style={styles.photoLabel}>Saddle</Text>
                      </View>
                    )}
                    {template.bitPhotoUri && (
                      <View style={styles.photoItem}>
                        <Image source={{ uri: template.bitPhotoUri }} style={styles.photoThumbnail} />
                        <Text style={styles.photoLabel}>Bit</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {template.reminderTemplates.length > 0 && (
                <View style={styles.remindersSection}>
                  <Text style={styles.sectionTitle}>Pre-Run Reminders:</Text>
                  {template.reminderTemplates.map((reminder) => (
                    <View key={reminder.id} style={styles.reminderRow}>
                      <Text style={styles.reminderLabel}>{reminder.label}</Text>
                      <Text style={styles.reminderOffset}>
                        {formatOffsetTime(reminder.offsetMinutes)} before
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {template.preRunNotes && (
                <View style={styles.notesSection}>
                  <Text style={styles.sectionTitle}>Pre-Run Notes:</Text>
                  <Text style={styles.notesText}>{template.preRunNotes}</Text>
                </View>
              )}

              <View style={styles.templateActions}>
                <TouchableOpacity
                  style={[buttonStyles.secondaryButton, styles.templateButton]}
                  onPress={() => handleViewTemplate(template)}
                >
                  <IconSymbol
                    ios_icon_name="square.and.arrow.up"
                    android_material_icon_name="share"
                    size={18}
                    color={colors.text}
                  />
                  <Text style={[buttonStyles.buttonText, styles.buttonTextWithIcon]}>
                    View & Share
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[buttonStyles.secondaryButton, styles.templateButton]}
                  onPress={() => handleEditTemplate(template)}
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
                  style={[buttonStyles.dangerButton, styles.templateButton]}
                  onPress={() => handleDeleteTemplate(template)}
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
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'android' ? 48 : spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  addButtonText: {
    marginLeft: 0,
  },
  emptyText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  templateCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  templateHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  templateName: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  photosSection: {
    marginBottom: spacing.lg,
  },
  photosGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoItem: {
    flex: 1,
    alignItems: 'center',
  },
  photoThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  photoLabel: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  remindersSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodySemibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.highlight,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  reminderLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  reminderOffset: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  notesSection: {
    marginBottom: spacing.lg,
  },
  notesText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 20,
    backgroundColor: colors.highlight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  templateActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  templateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  buttonTextWithIcon: {
    marginLeft: 0,
  },
  proCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  proTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  proDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  featuresList: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  featureText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  upgradeButton: {
    width: '100%',
  },
  bottomPadding: {
    height: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  modalText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  modalButton: {
    width: '100%',
    marginBottom: spacing.sm,
  },
});
