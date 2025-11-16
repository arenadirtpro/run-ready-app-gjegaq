
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_KEY = '@runready_subscription_status';

export type SubscriptionStatus = 'free' | 'pro';

export interface SubscriptionData {
  status: SubscriptionStatus;
  expiryDate?: string;
}

export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    const data = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
    if (data) {
      const subscription: SubscriptionData = JSON.parse(data);
      
      // Check if subscription is still valid
      if (subscription.status === 'pro' && subscription.expiryDate) {
        const expiryDate = new Date(subscription.expiryDate);
        if (expiryDate > new Date()) {
          return 'pro';
        }
      }
    }
    return 'free';
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return 'free';
  }
};

export const setSubscriptionStatus = async (status: SubscriptionStatus, expiryDate?: Date): Promise<void> => {
  try {
    const data: SubscriptionData = {
      status,
      expiryDate: expiryDate?.toISOString(),
    };
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(data));
    console.log('Subscription status updated:', status);
  } catch (error) {
    console.error('Error setting subscription status:', error);
    throw error;
  }
};

export const isProUser = async (): Promise<boolean> => {
  const status = await getSubscriptionStatus();
  return status === 'pro';
};
