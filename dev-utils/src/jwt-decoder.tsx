import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon } from "@raycast/api";

function decodeBase64Url(s: string): string {
  return s
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(s.length / 4) * 4, "=");
}

function decodeJwt(token: string): { header: string; payload: string; error?: string } {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { header: "", payload: "", error: "Invalid JWT format — expected 3 dot-separated segments" };
  }

  try {
    const header = new TextDecoder().decode(Uint8Array.from(atob(decodeBase64Url(parts[0]!)), (c) => c.charCodeAt(0)));
    const payload = new TextDecoder().decode(Uint8Array.from(atob(decodeBase64Url(parts[1]!)), (c) => c.charCodeAt(0)));
    return { header, payload };
  } catch {
    return { header: "", payload: "", error: "Failed to decode JWT — invalid Base64 encoding" };
  }
}

export default function JwtDecoder() {
  const [input, setInput] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");

  const decode = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter a JWT token");
      return;
    }

    const result = decodeJwt(trimmed);
    if (result.error) {
      setError(result.error);
      setHeader("");
      setPayload("");
      setSignature("");
      return;
    }

    setError("");

    try {
      const h = JSON.parse(result.header);
      setHeader(JSON.stringify(h, null, 2));
    } catch {
      setHeader(result.header);
    }

    try {
      const p = JSON.parse(result.payload);
      setPayload(JSON.stringify(p, null, 2));
    } catch {
      setPayload(result.payload);
    }

    const parts = trimmed.split(".");
    setSignature(parts[2] || "");
  }, [input]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Decode JWT" icon={Icon.ArrowRight} onAction={decode} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="JWT Token"
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        value={input}
        onChange={setInput}
      />
      {header && <Form.TextArea id="header" title="Header" value={header} onChange={() => {}} />}
      {payload && <Form.TextArea id="payload" title="Payload" value={payload} onChange={() => {}} />}
      {signature && <Form.TextField id="signature" title="Signature" value={signature} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
