export async function GET() {
  return new Response(JSON.stringify({ profile: null }), {
    headers: { "content-type": "application/json" }
  });
}

export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" }
  });
}
