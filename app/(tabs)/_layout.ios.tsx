
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { colors, spacing, borderRadius, typography } from '@/styles/commonStyles';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
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
          activeOpacity={0.7}
        >
          <View style={[
            styles.iconContainer,
            isActive('/(tabs)/(home)') && styles.iconContainerActive,
          ]}>
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add_circle"
              size={24}
              color={isActive('/(tabs)/(home)') ? colors.primary : colors.textSecondary}
            />
          </View>
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
          activeOpacity={0.7}
        >
          <View style={[
            styles.iconContainer,
            isActive('/profile') && styles.iconContainerActive,
          ]}>
            <IconSymbol
              ios_icon_name="calendar"
              android_material_icon_name="event"
              size={24}
              color={isActive('/profile') ? colors.primary : colors.textSecondary}
            />
          </View>
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
          activeOpacity={0.7}
        >
          <View style={[
            styles.iconContainer,
            isActive('/horses') && styles.iconContainerActive,
          ]}>
            <IconSymbol
              ios_icon_name="figure.equestrian.sports"
              android_material_icon_name="pets"
              size={24}
              color={isActive('/horses') ? colors.primary : colors.textSecondary}
            />
          </View>
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
    backgroundColor: colors.backgroundSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingBottom: 0,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.04)',
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconContainerActive: {
    backgroundColor: colors.card,
  },
  tabButtonText: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabButtonTextActive: {
    ...typography.smallMedium,
    color: colors.primary,
  },
});
