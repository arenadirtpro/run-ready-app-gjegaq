
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { Stack, useRouter, usePathname } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNewEventPress = () => {
    router.push('/(tabs)/(home)');
  };

  const handleSavedEventsPress = () => {
    router.push('/profile');
  };

  const handleHorsesPress = () => {
    router.push('/horses');
  };

  const isActive = (path: string) => {
    if (path === '/(tabs)/(home)') {
      return pathname === '/(tabs)/(home)' || pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(home)" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="horses" />
      </Stack>
      
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            isActive('/(tabs)/(home)') && styles.tabButtonActive,
          ]}
          onPress={handleNewEventPress}
        >
          <IconSymbol
            ios_icon_name="plus.circle.fill"
            android_material_icon_name="add_circle"
            size={24}
            color={isActive('/(tabs)/(home)') ? colors.background : colors.text}
          />
          <Text
            style={[
              styles.tabButtonText,
              isActive('/(tabs)/(home)') && styles.tabButtonTextActive,
            ]}
          >
            New Event
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            isActive('/profile') && styles.tabButtonActive,
          ]}
          onPress={handleSavedEventsPress}
        >
          <IconSymbol
            ios_icon_name="calendar"
            android_material_icon_name="event"
            size={24}
            color={isActive('/profile') ? colors.background : colors.text}
          />
          <Text
            style={[
              styles.tabButtonText,
              isActive('/profile') && styles.tabButtonTextActive,
            ]}
          >
            Saved Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            isActive('/horses') && styles.tabButtonActive,
          ]}
          onPress={handleHorsesPress}
        >
          <IconSymbol
            ios_icon_name="figure.equestrian.sports"
            android_material_icon_name="pets"
            size={24}
            color={isActive('/horses') ? colors.background : colors.text}
          />
          <Text
            style={[
              styles.tabButtonText,
              isActive('/horses') && styles.tabButtonTextActive,
            ]}
          >
            Horses
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 0 : 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
    textAlign: 'center',
  },
  tabButtonTextActive: {
    color: colors.background,
  },
});
