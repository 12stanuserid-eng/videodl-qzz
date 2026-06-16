export function json(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...(init?.headers || {})
    }
  });
}

export function errorJson(message: string, status = 400, details?: unknown): Response {
  return json({ error: { message, details } }, { status });
}
