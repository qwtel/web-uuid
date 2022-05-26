# Web UUID
A UUID class that stringifies to URL-safe base64.

WebUUIDs are represented as bytes (`Uint8Array`) and converted to strings on-demand.

This class implements `toString` and `toJSON` for better language integration,
as well as inspection for node and Deno for a better development experience.

For the most part, `WebUUID` can be used where  UUID strings are used,
except for equality checks. For those cases, `WebUUID` provides quick access 
to the string representations via the `id` field.
