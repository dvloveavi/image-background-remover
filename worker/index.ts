export interface Env {
  REMOVE_BG_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const { image } = await request.json();

      if (!image) {
        return new Response(JSON.stringify({ error: 'No image provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!env.REMOVE_BG_API_KEY) {
        return new Response(JSON.stringify({ error: 'Remove.bg API key not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Extract base64 data from data URL
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      const formData = new FormData();
      formData.append('image_file', new Blob([imageBuffer]), 'image.png');
      formData.append('size', 'auto');
      formData.append('format', 'png');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': env.REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Remove.bg API error:', errorText);
        return new Response(JSON.stringify({ error: 'Failed to remove background' }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const resultBuffer = await response.arrayBuffer();
      const resultBase64 = btoa(String.fromCharCode(...new Uint8Array(resultBuffer)));

      return new Response(JSON.stringify({ result: resultBase64 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error removing background:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
