import test from 'node:test';
import assert from 'node:assert/strict';
import { validateInput, parseListing, generateListing, getOllamaStatus } from '../src/ai.js';
const input = { images: ['data:image/png;base64,aGVsbG8='], platform: 'Etsy', notes: 'Cotton bag', tone: 'Warm & friendly' };
test('validates image, platform, notes and image count', () => {
  assert.doesNotThrow(() => validateInput(input));
  for (const patch of [{ images: [] }, { images: Array(5).fill(input.images[0]) }, { images: ['https://example.com/image.jpg'] }, { platform: 'Unknown' }, { notes: 'a'.repeat(2001) }]) assert.throws(() => validateInput({ ...input, ...patch }), { status: 400 });
});
test('parses and bounds model response', () => {
  const result = parseListing(JSON.stringify({ title: 'a'.repeat(200), description: 'A bag', tags: Array(15).fill('cotton') }));
  assert.equal(result.title.length, 140); assert.equal(result.tags.length, 13);
  assert.throws(() => parseListing('{"title":"Bag"}'));
  assert.throws(() => parseListing('{"title":"","description":"x","tags":[]}'));
});
test('sends images and correct model prompt to Ollama', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.match(url, /\/api\/chat$/); const body = JSON.parse(options.body);
    assert.equal(body.model, 'gemma3:4b'); assert.deepEqual(body.messages[0].images, ['aGVsbG8=']); assert.match(body.messages[0].content, /Never invent/); assert.equal(body.stream, false);
    return new Response(JSON.stringify({ message: { content: JSON.stringify({ title: 'Cotton tote', description: 'A simple bag.', tags: ['tote'] }) } }));
  };
  try { const result = await generateListing(input); assert.equal(result.title, 'Cotton tote'); assert.equal(result.model, 'gemma3:4b'); } finally { globalThis.fetch = original; }
});
test('reports missing runtime and inference failure honestly', async () => {
  const original = globalThis.fetch; globalThis.fetch = async () => { throw new Error('offline'); };
  try { assert.deepEqual(await getOllamaStatus(), { connected: false, ready: false, model: 'gemma3:4b' }); await assert.rejects(generateListing(input), /Could not reach the local model/); } finally { globalThis.fetch = original; }
});
