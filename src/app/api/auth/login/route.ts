export async function POST(request: Request) {
  return Response.json(
    { error: "Sign in is disabled during development." },
    { status: 403 }
  );
}
