import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Capture an image using the device camera
 */
export async function takePicture() {
    try {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
        });
        return image;
    } catch (error) {
        console.error('Error taking picture:', error);
        throw error;
    }
}

/**
 * Select an image from the device photo gallery
 */
export async function selectFromGallery() {
    try {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            source: CameraSource.Photos,
        });
        return image;
    } catch (error) {
        console.error('Error selecting from gallery:', error);
        throw error;
    }
}
