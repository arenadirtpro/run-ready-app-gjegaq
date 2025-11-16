
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';

export default function ProfileScreen() {
  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your RunReady settings</Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.cardTitle}>About RunReady</Text>
          <Text style={styles.cardText}>
            RunReady helps horse competitors calculate precise run times and manage pre-run tasks with automatic reminders.
          </Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.cardTitle}>Features</Text>
          <Text style={styles.cardText}>
            - Calculate estimated run times based on draw numbers{'\n'}
            - Set custom reminders for pre-run tasks{'\n'}
            - Automatic time calculations{'\n'}
            - Clean, intuitive interface
          </Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.cardTitle}>Version</Text>
          <Text style={styles.cardText}>RunReady v1.0.0</Text>
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  bottomPadding: {
    height: 120,
  },
});
