export async function GET() {
  return new Response(JSON.stringify({ likes: [] }), {
    headers: { "content-type": "application/json" }
  });
}
