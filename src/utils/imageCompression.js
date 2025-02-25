import imageCompression from 'browser-image-compression';

export async function compressImage(file) {
    // If no file is provided or it's not an image, return the original file
    if (!file || !file.type.startsWith('image/')) {
        return file;
    }

    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: file.type // Preserve original file type
    };

    try {
        const compressedFile = await imageCompression(file, options);
        
        // If compressed file is larger than original, return original
        if (compressedFile.size > file.size) {
            return file;
        }
        
        return compressedFile;
    } catch (error) {
        console.error('Error compressing image:', error);
        return file; // Return original file if compression fails
    }
} 