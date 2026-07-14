import { useState, useCallback } from "react";
import { hmacSha256 } from "./crypto-shim";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function base64UrlEncode(data: string): string {
  return btoa(data).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export default function JwtSigner() {
  const [header, setHeader] = useState('{"alg":"HS256","typ":"JWT"}');
  const [payload, setPayload] = useState('{"sub":"123","name":"John"}');
  const [secret, setSecret] = useState("your-secret");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const sign = useCallback(async () => {
    try {
      JSON.parse(header);
      JSON.parse(payload);
    } catch {
      setError("Header or payload is not valid JSON");
      return;
    }
    if (!secret.trim()) {
      setError("Please enter a secret key");
      return;
    }

    setError("");
    try {
      const encHeader = base64UrlEncode(header);
      const encPayload = base64UrlEncode(payload);
      const signature = await hmacSha256(secret, `${encHeader}.${encPayload}`);
      const sigBytes = new Uint8Array(signature.length / 2);
      for (let i = 0; i < signature.length; i += 2) {
        sigBytes[i / 2] = parseInt(signature.slice(i, i + 2), 16);
      }
      const encSig = base64UrlEncode(
        Array.from(sigBytes)
          .map((b) => String.fromCodePoint(b))
          .join(""),
      );
      const token = `${encHeader}.${encPayload}.${encSig}`;
      setOutput(token);
      showToast(Toast.Style.Success, "JWT signed");
    } catch {
      setError("Signing failed");
    }
  }, [header, payload, secret]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Sign JWT" icon={Icon.Lock} onAction={sign} />
          {output && <Action title="Copy Token" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="header" title="Header" value={header} onChange={setHeader} />
      <Form.TextArea id="payload" title="Payload" value={payload} onChange={setPayload} />
      <Form.TextField id="secret" title="Secret Key" placeholder="your-secret" value={secret} onChange={setSecret} />
      {output && <Form.TextArea id="output" title="JWT Token" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
