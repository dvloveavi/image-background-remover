export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Remove.bg API key not configured' }, { status: 500 });
    }

    // 1. 使用 Web 标准方式处理 Base64 字符串转为 Uint8Array (替代 Buffer)
    const base64Data = image.split(',')[1]; // 提取 data:image/png;base64, 之后的部分
    const binaryString = atob(base64Data);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    // 2. 构建 FormData
    const formData = new FormData();
    formData.append('image_file', new Blob([uint8Array], { type: 'image/png' }), 'image.png');
    formData.append('size', 'auto');
    formData.append('format', 'png');

    // 3. 请求 remove.bg API
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Remove.bg API error:', errorText);
      return NextResponse.json({ error: 'Failed to remove background' }, { status: response.status });
    }

    // 4. 将返回的 ArrayBuffer 转回 Base64 字符串 (不使用 Buffer)
    const resultBuffer = await response.arrayBuffer();
    const resultUint8 = new Uint8Array(resultBuffer);
    let binary = '';
    resultUint8.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    const resultBase64 = btoa(binary);

    return NextResponse.json({ result: resultBase64 });
  } catch (error) {
    console.error('Error removing background:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
