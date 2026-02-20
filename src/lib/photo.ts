/**
 * Wraps a photo URL through the image proxy if it's a private Vercel Blob URL.
 * Base64 data URLs and null values pass through unchanged.
 */
export function getPhotoUrl(photoUrl: string | null | undefined): string | undefined {
    if (!photoUrl) return undefined;

    // Base64 data URLs work directly
    if (photoUrl.startsWith('data:')) return photoUrl;

    // External URLs that are not Vercel Blob — pass through
    if (!photoUrl.includes('blob.vercel-storage.com')) return photoUrl;

    // Private Vercel Blob URLs need to go through the proxy
    return `/api/image?url=${encodeURIComponent(photoUrl)}`;
}
