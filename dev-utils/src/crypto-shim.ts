import crypto from "crypto";

export function getRandomValues(arr: Uint8Array): Uint8Array {
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    return globalThis.crypto.getRandomValues(arr);
  }
  return crypto.randomFillSync(arr);
}

export async function digest(algorithm: string, data: Uint8Array): Promise<Uint8Array> {
  if (typeof globalThis.crypto?.subtle?.digest === "function") {
    return new Uint8Array(await globalThis.crypto.subtle.digest(algorithm, data));
  }
  const algo = algorithm === "SHA-1" ? "sha1" : algorithm === "SHA-256" ? "sha256" : "sha512";
  return crypto.createHash(algo).update(data).digest();
}

export async function hmacSha256(secret: string, data: string): Promise<string> {
  if (typeof globalThis.crypto?.subtle?.importKey === "function") {
    const enc = new TextEncoder();
    const key = await globalThis.crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await globalThis.crypto.subtle.sign("HMAC", key, enc.encode(data));
    return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export function randomHex(bytes: number): string {
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const arr = new Uint8Array(bytes);
    globalThis.crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return crypto.randomBytes(bytes).toString("hex");
}
