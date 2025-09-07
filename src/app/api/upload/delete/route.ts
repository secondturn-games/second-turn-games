import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // For local storage, extract filename from URL
    if (url.startsWith('/uploads/')) {
      const filename = url.split('/').pop();
      if (filename) {
        const filePath = join(process.cwd(), 'public', 'uploads', filename);
        try {
          await unlink(filePath);
          return NextResponse.json({ success: true });
        } catch (error) {
          // File might not exist, which is okay
          return NextResponse.json({ success: true });
        }
      }
    }

    // For other storage providers, you would implement deletion here
    // For now, just return success
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
