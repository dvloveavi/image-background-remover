export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!image || !apiKey) {
      return NextResponse.json({ error: 'Missing image or API key' }, { status: 400 });
    }

    // 1. 更稳健的 Base64 提取
    const base64Str = image.includes(',') ? image.split(',')[1] : image;

    // 2. 将 Base64 转为 Uint8Array（使用 Edge 通用方式）
    const uint8Array = Uint8Array.from(atob(base64Str), c => c.charCodeAt(0));

    const formData = new FormData();
    formData.append('image_file', new Blob([uint8Array]), 'image.png');
    formData.append('size', 'auto');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: formData,
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'API service error' }, { status: response.status });
    }

    // 3. 将结果转回 Base64
    const resultBuffer = await response.arrayBuffer();
    const resultBase64 = btoa(String.fromCharCode(...new Uint8Array(resultBuffer)));

    return NextResponse.json({ result: resultBase64 });
  } catch (error) {
    console.error('Runtime Error:', error);
    return NextResponse.json({ error: 'Server crashed' }, { status: 500 });
  }
}
