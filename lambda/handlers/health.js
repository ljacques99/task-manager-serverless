export function handleHealth() {
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, data: { status: "ok", timestamp: new Date().toISOString() }, error: null }),
  };
}
