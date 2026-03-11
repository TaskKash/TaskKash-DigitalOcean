import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Trigger a heavy impact vibration
 */
export const vibrateHeavy = async () => {
    await Haptics.impact({ style: ImpactStyle.Heavy });
};

/**
 * Trigger a medium impact vibration (good for standard buttons)
 */
export const vibrateMedium = async () => {
    await Haptics.impact({ style: ImpactStyle.Medium });
};

/**
 * Trigger a light impact vibration
 */
export const vibrateLight = async () => {
    await Haptics.impact({ style: ImpactStyle.Light });
};

/**
 * Trigger a success notification vibration
 */
export const vibrateSuccess = async () => {
    await Haptics.notification({ type: 'SUCCESS' as any }); // fallback typing
};

/**
 * Trigger an error notification vibration
 */
export const vibrateError = async () => {
    await Haptics.notification({ type: 'ERROR' as any }); // fallback typing
};

/**
 * Trigger a subtle tap for UI selections (combobox, wheel pickers)
 */
export const vibrateSelection = async () => {
    await Haptics.selectionStart();
    await Haptics.selectionChanged();
    await Haptics.selectionEnd();
};
