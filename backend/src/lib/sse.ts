export interface SSEStreamingApi {
  writeSSE(message: { event?: string; data: string; id?: string; retry?: number }): Promise<void>;
}

const connections = new Map<string, Set<SSEStreamingApi>>();

export const addConnection = (key: string, stream: SSEStreamingApi) => {
  if (!connections.has(key)) {
    connections.set(key, new Set());
  }
  connections.get(key)!.add(stream);
  console.log(`[SSE] Added connection for key: ${key}. Total clients: ${connections.get(key)!.size}`);
};

export const removeConnection = (key: string, stream: SSEStreamingApi) => {
  const clients = connections.get(key);
  if (clients) {
    clients.delete(stream);
    if (clients.size === 0) {
      connections.delete(key);
    }
    console.log(`[SSE] Removed connection for key: ${key}. Remaining clients: ${clients.size}`);
  }
};

export const publish = (key: string, event: string, data: unknown) => {
  const clients = connections.get(key);
  if (!clients || clients.size === 0) {
    console.log(`[SSE] No active clients connected for key: ${key}`);
    return;
  }
  const payload = JSON.stringify(data);
  console.log(`[SSE] Publishing to key: ${key}, event: ${event}`);
  clients.forEach((stream) => {
    stream.writeSSE({ event, data: payload }).catch((err) => {
      console.error(`[SSE] Failed to write SSE to client on key: ${key}`, err);
    });
  });
};
