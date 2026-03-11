import { Geolocation, Position } from '@capacitor/geolocation';

/**
 * Request location permissions and get current GPS position
 */
export async function getCurrentLocation(): Promise<Position> {
    try {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
            await Geolocation.requestPermissions();
        }

        return await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000
        });
    } catch (error) {
        console.error('Error getting location:', error);
        throw error;
    }
}

/**
 * Continually watch the device position
 */
export async function watchLocation(callback: (position: Position | null, err?: any) => void) {
    try {
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location !== 'granted') {
            await Geolocation.requestPermissions();
        }

        const watchId = await Geolocation.watchPosition({
            enableHighAccuracy: true,
        }, callback);

        return watchId;
    } catch (error) {
        console.error('Error watching location:', error);
        throw error;
    }
}

/**
 * Clear a location watch
 */
export async function clearLocationWatch(watchId: string) {
    return await Geolocation.clearWatch({ id: watchId });
}
