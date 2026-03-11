import { Preferences } from '@capacitor/preferences';

/**
 * Set a persistent key-value pair
 */
export async function setItem(key: string, value: string) {
    await Preferences.set({ key, value });
}

/**
 * Get a persistent value by key
 */
export async function getItem(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
}

/**
 * Remove a specific key
 */
export async function removeItem(key: string) {
    await Preferences.remove({ key });
}

/**
 * Clear all persistent preferences
 */
export async function clearAll() {
    await Preferences.clear();
}
