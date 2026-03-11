import { NativeBiometric } from '@capgo/capacitor-native-biometric';

/**
 * Prompts the user for Biometric Authentication (FaceID/Fingerprint)
 */
export async function verifyBiometrics(reason: string = 'Please authenticate to continue'): Promise<boolean> {
    try {
        const isAvailable = await NativeBiometric.isAvailable();

        if (!isAvailable.isAvailable) {
            console.warn('Biometrics not available on this device');
            return false;
        }

        const verification = await NativeBiometric.verifyIdentity({
            reason,
            title: 'Authentication Required',
            subtitle: 'Use your face or fingerprint',
            description: 'Your device requires biometric authentication to secure your data.'
        });

        return true;
    } catch (error) {
        console.error('Biometric verification failed:', error);
        return false;
    }
}
