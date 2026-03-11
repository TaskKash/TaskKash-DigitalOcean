import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

/**
 * Write a text file to the device's document directory
 */
export async function writeTextFile(path: string, content: string) {
    try {
        await Filesystem.writeFile({
            path,
            data: content,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });
        return true;
    } catch (error) {
        console.error('Error writing file:', error);
        return false;
    }
}

/**
 * Read a text file from the device's document directory
 */
export async function readTextFile(path: string) {
    try {
        const contents = await Filesystem.readFile({
            path,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });
        return contents.data as string;
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
}

/**
 * Delete a file from the device's document directory
 */
export async function deleteFile(path: string) {
    try {
        await Filesystem.deleteFile({
            path,
            directory: Directory.Documents
        });
    } catch (error) {
        console.error('Error deleting file:', error);
    }
}
