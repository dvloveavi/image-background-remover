export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!image || !apiKey) {
      return new Response(JSON.stringify({ error: 'Missing Data' }), { status: 400 });
    }

    // 处理 Base64
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // 1. 将 Base64 转为 Blob (使用现代 Web 方式)
    const byteCharacters = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const imageBlob = new Blob([byteCharacters], { type: 'image/png' });

    const formData = new FormData();
    formData.append('image_file', imageBlob, 'image.png');
    formData.append('size', 'auto');

    // 2. 发送请求
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: formData,
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'API Error' }), { status: response.status });
    }

    // 3. 将结果转回 Base64
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    uint8Array.forEach(b => binary += String.fromCharCode(b));
    const resultBase64 = btoa(binary);

    return new Response(JSON.stringify({ result: resultBase64 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge error:', error);
    return new Response(JSON.stringify({ error: 'Runtime Crash' }), { status: 500 });
  }
}
