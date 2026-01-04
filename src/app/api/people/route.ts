export async function GET() {
  return new Response(JSON.stringify({ people: [] }), {
    headers: { "content-type": "application/json" }
  });
}
