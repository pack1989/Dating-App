export async function GET() {
  return new Response(JSON.stringify({ chats: [] }), {
    headers: { "content-type": "application/json" }
  });
}
