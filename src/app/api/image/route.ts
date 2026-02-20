import { NextRequest, NextResponse } from 'next/server';
import { getDownloadUrl } from '@vercel/blob';

/**
 * Image proxy for private Vercel Blob URLs.
 * Usage: /api/image?url=<blob-url>
 * 
 * Generates a short-lived signed download URL and redirects to it.
 */
export async function GET(request: NextRequest) {
    const blobUrl = request.nextUrl.searchParams.get('url');

    if (!blobUrl) {
        return NextResponse.json(
            { error: 'Missing url parameter' },
            { status: 400 }
        );
    }

    // If it's a data URL (base64), serve it directly
    if (blobUrl.startsWith('data:')) {
        const match = blobUrl.match(/^data:(.*?);base64,(.*)$/);
        if (match) {
            const [, contentType, base64Data] = match;
            const buffer = Buffer.from(base64Data, 'base64');
            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=86400',
                },
            });
        }
    }

    // If it's a Vercel Blob URL, generate a signed download URL
    if (blobUrl.includes('blob.vercel-storage.com') || blobUrl.includes('vercel.app')) {
        try {
            const downloadUrl = await getDownloadUrl(blobUrl);
            return NextResponse.redirect(downloadUrl);
        } catch (error) {
            console.error('Error getting download URL:', error);
            return NextResponse.json(
                { error: 'Failed to access image' },
                { status: 500 }
            );
        }
    }

    // For other URLs, redirect directly
    return NextResponse.redirect(blobUrl);
}
