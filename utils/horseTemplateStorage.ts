
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HorseTemplate } from '@/types/horseTemplate';

const HORSE_TEMPLATES_KEY = '@runready_horse_templates';

export const saveHorseTemplate = async (template: HorseTemplate): Promise<void> => {
  try {
    const templates = await getAllHorseTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    
    await AsyncStorage.setItem(HORSE_TEMPLATES_KEY, JSON.stringify(templates));
    console.log('Horse template saved:', template.id);
  } catch (error) {
    console.error('Error saving horse template:', error);
    throw error;
  }
};

export const getAllHorseTemplates = async (): Promise<HorseTemplate[]> => {
  try {
    const data = await AsyncStorage.getItem(HORSE_TEMPLATES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading horse templates:', error);
    return [];
  }
};

export const getHorseTemplate = async (id: string): Promise<HorseTemplate | null> => {
  try {
    const templates = await getAllHorseTemplates();
    return templates.find(t => t.id === id) || null;
  } catch (error) {
    console.error('Error loading horse template:', error);
    return null;
  }
};

export const deleteHorseTemplate = async (id: string): Promise<void> => {
  try {
    const templates = await getAllHorseTemplates();
    const filtered = templates.filter(t => t.id !== id);
    await AsyncStorage.setItem(HORSE_TEMPLATES_KEY, JSON.stringify(filtered));
    console.log('Horse template deleted:', id);
  } catch (error) {
    console.error('Error deleting horse template:', error);
    throw error;
  }
};
