import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * 🧠 NORMAL STORAGE
 * Best for: FCM token, user info, app flags, preferences
 */
export const saveData = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error("🧠 Error saving data:", error);
  }
};

export const getData = async <T = any>(key: string): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error("🧠 Error reading data:", error);
    return null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("🧠 Error removing data:", error);
  }
};