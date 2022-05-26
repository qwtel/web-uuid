import 'https://gist.githubusercontent.com/qwtel/b14f0f81e3a96189f7771f83ee113f64/raw/TestRequest.ts'
import {
  assert,
  assertExists,
  assertEquals,
  assertStrictEquals,
  assertStringIncludes,
  assertThrows,
  assertRejects,
  assertArrayIncludes,
} from 'https://deno.land/std@0.133.0/testing/asserts.ts'
const { test } = Deno;

import { WebUUID } from '../index.ts'

const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const RE_WEB_UUID = /^[0-9A-Za-z-_]{22}$/

test('basics', () => {
  const u = new WebUUID();
  assertExists(u);
  assert(u instanceof Uint8Array);
  assert(u.buffer instanceof ArrayBuffer);
  assertEquals(u.byteLength, 16);
  assert(RE_WEB_UUID.test(u));
  assert(RE_WEB_UUID.test(u.toString()));
  assert(RE_WEB_UUID.test(u.id));
  assert(RE_UUID.test(u.uuid));
  assert(RE_WEB_UUID.test(u.toJSON()));
})

test('can be created from other uuid', () => {
  const u = new WebUUID();
  const uu = new WebUUID(u)
  assertExists(uu);
  assertEquals(uu.id, u.id);
  assertEquals(uu.uuid, u.uuid);
  assert(uu.id !== u.uuid);
  assert(uu.uuid !== u.id);
})

test('has static v4 factory function', () => {
  const v = WebUUID.v4();
  assertExists(v);
  assert(RE_WEB_UUID.test(v));
})

test('can be created from a buffer', () => {
  const u = new WebUUID();
  const b = new WebUUID(u.buffer);
  assert(b);
  assert(RE_WEB_UUID.test(b));
  assertEquals(b.id, u.id);
})

test('can be created from an UUID string and accessed byte by byte', () => {
  const s = new WebUUID('95fb587f-4911-4aeb-b6bb-464b2b617e2c');
  assertExists(s)
  assertEquals(s.uuid, '95fb587f-4911-4aeb-b6bb-464b2b617e2c');
  const sb = new Uint8Array(s.buffer);
  assertEquals(sb[0], 0x95);
  assertEquals(sb[1], 0xfb);
  assertEquals(sb[2], 0x58);
  assertEquals(sb[3], 0x7f);
  assertEquals(sb[15], 0x2c);
})

test('stringifies to a base64 UUID string', () => {
  const id = new WebUUID('95fb587f-4911-4aeb-b6bb-464b2b617e2c');
  assertEquals(JSON.stringify({ id }), `{"id":"lftYf0kRSuu2u0ZLK2F-LA"}`);
})

test('parses any hex string', () => {
  const t = new WebUUID('95fb587f49114aebb6bb464b2b617e2c');
  assertExists(t);
  assertEquals(t.uuid, '95fb587f-4911-4aeb-b6bb-464b2b617e2c');
  assertEquals(t.id, 'lftYf0kRSuu2u0ZLK2F-LA');
})

test('throws when too little data is provided', () => {
  assertThrows(() => new WebUUID('95fb587f-'));
  assertThrows(() => new WebUUID([0x95, 0xfb, 0x58, 0x75]));
  assertThrows(() => new WebUUID(new Uint8Array([0x95, 0xfb, 0x58, 0x75])));
  assertThrows(() => new WebUUID(new Uint8Array([0x95, 0xfb, 0x58, 0x75]).buffer));
})

test('the stringified format of other typed arrays is not supported (same as other typed array constructors', () => {
  const u = new WebUUID();
  const stringified = JSON.parse(JSON.stringify(new Uint8Array(u.buffer)));
  assertThrows(() => new WebUUID(stringified));
  // Works when treating it with `Object.values` first (but order isn't guaranteed, I think)
  assertEquals(new WebUUID(Object.values(stringified)).id, u.id)
})


test('accepts longer strings, sheds extra data', () => {
  const a = new WebUUID('95fb587f49114aebb6bb464b2b617e2c6593210206284c1394dd331c2ca42107');
  assertExists(a);
  assertEquals(a.uuid, '95fb587f-4911-4aeb-b6bb-464b2b617e2c');
  assertEquals(a.byteLength, 16);
  assertEquals(a.length, 16);
})

test('also accepts more than 16 bytes, will discard the rest', () => {
  const r = crypto.getRandomValues(new Uint8Array(18));
  const c = new WebUUID(r);
  assertEquals(c.byteLength, 16);
  assertEquals(c.buffer.byteLength, 16);
  
  const cb = new Uint8Array(c.buffer);
  assertEquals(cb.length, 16);
  assertEquals(cb[16], undefined);
  assertEquals(cb[17], undefined);
  assertEquals(cb.buffer.byteLength, 16);

  const d = new WebUUID(r.slice(0, 16));
  assertEquals(c.uuid, d.uuid);
})
