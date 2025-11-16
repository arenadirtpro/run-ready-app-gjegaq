
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { HorseTemplate, ReminderTemplate, IncentiveRegistration } from '@/types/horseTemplate';
import { getAllHorseTemplates, saveHorseTemplate, deleteHorseTemplate } from '@/utils/horseTemplateStorage';
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
    
    router.push('/horses/edit');
  };

  const handleEditTemplate = (template: HorseTemplate) => {
    router.push({
      pathname: '/horses/edit',
      params: {
        templateData: JSON.stringify(template),
      },
    });
  };

  const handleDeleteTemplate = (template: HorseTemplate) => {
    Alert.alert(
      'Delete Horse Template',
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
              Alert.alert('Success', 'Horse template deleted successfully.');
            } catch (error) {
              console.error('Error deleting template:', error);
              Alert.alert('Error', 'Failed to delete template. Please try again.');
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
            <Text style={styles.title}>Horse Management</Text>
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
              Unlock horse templates to save horse profiles with pre-run reminder templates and incentive registration tracking.
            </Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.featureText}>Save horse name profiles</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.featureText}>Pre-run reminder templates</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.featureText}>Incentive registration tracking</Text>
              </View>
              <View style={styles.featureItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.featureText}>Annual fee reminders</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[buttonStyles.primaryButton, styles.upgradeButton]}
              onPress={() => setShowProModal(true)}
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
              <Text style={styles.modalTitle}>Pro Feature</Text>
              <Text style={styles.modalText}>
                This feature is available in the Pro version. Upgrade to unlock horse templates and advanced management features.
              </Text>
              <Text style={styles.modalSubtext}>
                Coming soon: In-app purchase integration
              </Text>
              <TouchableOpacity
                style={[buttonStyles.primaryButton, styles.modalButton]}
                onPress={() => setShowProModal(false)}
              >
                <Text style={buttonStyles.buttonText}>OK</Text>
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
          <Text style={styles.title}>Horse Management</Text>
          <Text style={styles.subtitle}>Manage your horse templates</Text>
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
            Add Horse Template
          </Text>
        </TouchableOpacity>

        {loading ? (
          <View style={commonStyles.card}>
            <Text style={styles.emptyText}>Loading templates...</Text>
          </View>
        ) : templates.length === 0 ? (
          <View style={commonStyles.card}>
            <Text style={styles.emptyText}>No horse templates yet.</Text>
            <Text style={styles.emptySubtext}>
              Create a template to save horse profiles with pre-run reminders.
            </Text>
          </View>
        ) : (
          templates.map((template) => (
            <View key={template.id} style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <Text style={styles.templateName}>{template.name}</Text>
              </View>

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

              {template.incentiveRegistrations.length > 0 && (
                <View style={styles.incentivesSection}>
                  <Text style={styles.sectionTitle}>Incentive Registrations:</Text>
                  {template.incentiveRegistrations.map((incentive) => (
                    <View key={incentive.id} style={styles.incentiveRow}>
                      <View style={styles.incentiveInfo}>
                        <Text style={styles.incentiveName}>{incentive.name}</Text>
                        <Text style={styles.incentiveFee}>
                          ${incentive.annualFee}/year
                        </Text>
                      </View>
                      <Text style={styles.incentiveReminder}>
                        Remind {incentive.reminderDaysBefore} days before
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.templateActions}>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  addButtonText: {
    marginLeft: 0,
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
  templateCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  templateHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  templateName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  remindersSection: {
    marginBottom: 12,
  },
  incentivesSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: colors.highlight,
    borderRadius: 6,
    marginBottom: 4,
  },
  reminderLabel: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  reminderOffset: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  incentiveRow: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: colors.highlight,
    borderRadius: 6,
    marginBottom: 4,
  },
  incentiveInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  incentiveName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  incentiveFee: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  incentiveReminder: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  templateActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  templateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonTextWithIcon: {
    marginLeft: 0,
  },
  proCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  proTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  proDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  featuresList: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  modalSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
  },
});
