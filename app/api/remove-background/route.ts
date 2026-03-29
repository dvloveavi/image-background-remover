export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    const apiKey = process.env.REMOVE_BG_API_KEY;

    if (!image || !apiKey) {
      return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
    }

    // 纯 Web 标准的 Base64 转 Blob
    const base64Str = image.split(',')[1] || image;
    const byteCharacters = atob(base64Str);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    const formData = new FormData();
    formData.append('image_file', blob, 'image.png');
    formData.append('size', 'auto');

    const res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: formData,
    });

    if (!res.ok) throw new Error('API failed');

    const arrayBuffer = await res.arrayBuffer();

    // 纯 Web 标准的 ArrayBuffer 转 Base64
    const outputBase64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    return new Response(JSON.stringify({ result: outputBase64 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Edge Runtime Error' }), { status: 500 });
  }
}
