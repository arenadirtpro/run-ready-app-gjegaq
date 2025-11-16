
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active tab based on pathname
  const isNewEventActive = pathname.includes('/(home)') || pathname === '/(tabs)';
  const isSavedEventsActive = pathname.includes('/profile');

  const handleNewEventPress = () => {
    router.push('/(tabs)/(home)/');
  };

  const handleSavedEventsPress = () => {
    router.push('/(tabs)/profile');
  };

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      
      {/* Toggle Buttons at Bottom */}
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              styles.leftButton,
              isNewEventActive && styles.activeButton,
            ]}
            onPress={handleNewEventPress}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add_circle"
              size={24}
              color={isNewEventActive ? colors.background : colors.text}
            />
            <Text
              style={[
                styles.toggleButtonText,
                isNewEventActive && styles.activeButtonText,
              ]}
            >
              New Event
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              styles.rightButton,
              isSavedEventsActive && styles.activeButton,
            ]}
            onPress={handleSavedEventsPress}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="bookmark.fill"
              android_material_icon_name="bookmark"
              size={24}
              color={isSavedEventsActive ? colors.background : colors.text}
            />
            <Text
              style={[
                styles.toggleButtonText,
                isSavedEventsActive && styles.activeButtonText,
              ]}
            >
              Saved Events
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
    backgroundColor: colors.background,
  },
  leftButton: {
    borderRightWidth: 1,
    borderRightColor: colors.primary,
  },
  rightButton: {
    borderLeftWidth: 1,
    borderLeftColor: colors.primary,
  },
  activeButton: {
    backgroundColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  activeButtonText: {
    color: colors.background,
  },
});
