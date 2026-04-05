export const runtime = 'edge';

import { auth } from '@/auth';
import { deductCredit, getUserCredits } from '@/lib/db';

export async function POST(req: Request) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ── Credits check ────────────────────────────────────────────────────────
    const credits = await getUserCredits(session.user.id);
    if (credits.credits <= 0 && credits.preview_credits <= 0) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits', code: 'NO_CREDITS' }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ── Parse incoming FormData ──────────────────────────────────────────────
    const incoming = await req.formData();
    const imageFile = incoming.get('image_file') as File | null;

    if (!imageFile) {
      return new Response(JSON.stringify({ error: 'Missing image_file' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ── Decide credit type: HD credits first, fallback to preview ────────────
    const useHD = credits.credits > 0;
    const creditType = useHD ? 'hd' : 'preview';

    // ── Call Remove.bg API ───────────────────────────────────────────────────
    const formData = new FormData();
    formData.append('image_file', imageFile);
    formData.append('size', useHD ? 'auto' : 'preview');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[remove-bg] API error:', errText);
      return new Response(
        JSON.stringify({ error: 'Background removal failed', detail: errText }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── Deduct credit after successful processing ────────────────────────────
    await deductCredit(session.user.id, creditType);

    // ── Return result ────────────────────────────────────────────────────────
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    uint8Array.forEach(b => (binary += String.fromCharCode(b)));
    const resultBase64 = btoa(binary);

    return new Response(
      JSON.stringify({
        result: resultBase64,
        creditsUsed: creditType,
        creditsRemaining: useHD ? credits.credits - 1 : credits.credits,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[remove-bg] Runtime error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
