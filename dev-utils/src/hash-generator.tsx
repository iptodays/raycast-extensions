import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, showToast, Toast, Icon } from "@raycast/api";

import { digest } from "./crypto-shim";

type HashAlgo = "SHA-1" | "SHA-256" | "SHA-512";

const ALGO_LABELS: HashAlgo[] = ["SHA-1", "SHA-256", "SHA-512"];

async function hash(algo: HashAlgo, text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hash = await digest(algo, data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<{ algo: HashAlgo; hash: string }[]>([]);
  const [error, setError] = useState("");

  const generate = useCallback(async () => {
    if (!input.trim()) {
      setError("Please enter text");
      setResults([]);
      return;
    }
    try {
      setError("");
      const res = await Promise.all(ALGO_LABELS.map((algo) => hash(algo, input).then((hash) => ({ algo, hash }))));
      setResults(res);
    } catch {
      setError("Hashing failed");
    }
  }, [input]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Generate Hashes" icon={Icon.ArrowRight} onAction={generate} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="Input"
        placeholder="Text to hash…"
        value={input}
        onChange={setInput}
      />
      {results.map((r) => (
        <Form.TextField
          key={r.algo}
          id={r.algo}
          title={r.algo}
          value={r.hash}
          onChange={() => {}}
        />
      ))}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
