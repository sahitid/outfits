export function createBucketAdapter(client, name = 'closet-private') {
  const bucket = client.storage.from(name);
  return {
    async put(key, body, options = {}) {
      const { error } = await bucket.upload(key, body, { contentType: options.httpMetadata?.contentType || 'application/octet-stream', upsert: true });
      if (error) throw new Error('Could not store private file');
    },
    async get(key) {
      const { data, error } = await bucket.download(key);
      if (error) {
        if (String(error.status || error.statusCode) === '404' || error.message === 'Object not found') return null;
        throw new Error('Could not read private file');
      }
      return { body: data.stream(), httpMetadata: { contentType: data.type }, text: () => data.text(), arrayBuffer: () => data.arrayBuffer() };
    },
    async delete(key) { const { error } = await bucket.remove([key]); if (error) throw new Error('Could not remove private file'); },
  };
}
