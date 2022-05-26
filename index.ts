// deno-lint-ignore-file constructor-super no-explicit-any
import { UUID } from 'https://ghuc.cc/qwtel/uuid-class/index.ts'
import { Base64Decoder, Base64Encoder } from 'https://ghuc.cc/qwtel/base64-encoding/index.ts';

/**
 * A UUID class that stringifies to URL-safe base64.
 * 
 * WebUUIDs are represented as bytes (`Uint8Array`) and converted to strings on-demand.
 * 
 * This class implements `toString` and `toJSON` for better language integration,
 * as well as inspection for node and Deno for a better development experience.
 * 
 * For the most part, `WebUUID` can be used where  UUID strings are used,
 * except for equality checks. For those cases, `WebUUID` provides quick access 
 * to the string representations via the `id` field.
 */
export class WebUUID extends UUID {
  /**
   * Generate a new UUID version 4 (random).
   * 
   * __Note that `crypto.getRandomValues` needs to be available in the global JS object!__
   */
  static v4(): WebUUID {
    return new WebUUID(UUID.v4())
  }

  /**
   * Generated a new UUID version 5 (hashed)
   * 
   * __Note that `crypto.subtle` needs to be available in the global JS object (Not the case on non-HTTPS sites)!__
   * 
   * @param value 
   * @param namespace 
   */
  static async v5(value: string | BufferSource, namespace: string | WebUUID): Promise<WebUUID> {
    return new WebUUID(await UUID.v5(value, namespace))
  }

  /**
   * Generate a new UUID version 4 (random).
   * __Note that `crypto.getRandomValues` needs to be available in the global JS object!__
   */
  constructor();
  /** Creates a new UUID object from the provided string, which must be a valid UUID string. */
  constructor(value: string);
  /** Creates a copy of the provided UUID */
  constructor(value: UUID);
  /** Create a UUID from the provided iterable, where every value will be interpreted as a unsigned 8 bit integer. */
  constructor(value: Iterable<number>);
  /** Create a new UUID from the provided array-like structure. */
  constructor(value: ArrayLike<number> | ArrayBufferLike);
  /** Creates a UUID from the array buffer using 16 bytes started from the provided offset. */
  constructor(value: ArrayBufferLike, byteOffset: number);
  constructor(value?: string | UUID | Iterable<number> | ArrayLike<number> | ArrayBufferLike, byteOffset?: number) {
    if (typeof value === 'string' && value.length === 22) super(new Base64Decoder().decode(value))
    else super(<any>value, <any>byteOffset)
  }

  /**
   * Quick access to the string representation for easier comparison.
   * @example if (myUUID.id === otherUUID.id) { ... }
   */
  get id() {
    return new Base64Encoder({ url: true }).encode(this);
  }

  toString() {
    return new Base64Encoder({ url: true }).encode(this);
  }

  toJSON() {
    return new Base64Encoder({ url: true }).encode(this);
  }

  // We don't want operations like `map`, `subarray`, etc. to preserve the UUID class status
  static get [Symbol.species]() { return Uint8Array }

  // Custom inspects..
  [Symbol.for('nodejs.util.inspect.custom')]() { return `WebUUID [ ${this.id} ]` }
  [Symbol.for('Deno.customInspect')]() { return `WebUUID [ ${this.id} ]` }
}

