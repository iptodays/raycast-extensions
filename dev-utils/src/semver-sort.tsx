import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)(?:-([\w.]+))?(?:\+([\w.]+))?$/;

function valid(v: string): boolean {
  return SEMVER_RE.test(v.trim());
}

function parse(v: string) {
  const m = v.trim().match(SEMVER_RE);
  if (!m) return null;
  return {
    major: parseInt(m[1]!, 10),
    minor: parseInt(m[2]!, 10),
    patch: parseInt(m[3]!, 10),
    prerelease: m[4] || "",
    build: m[5] || "",
  };
}

function compare(a: string, b: string): number {
  const pa = parse(a);
  const pb = parse(b);
  if (!pa || !pb) return 0;
  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  if (pa.patch !== pb.patch) return pa.patch - pb.patch;
  if (pa.prerelease && !pb.prerelease) return -1;
  if (!pa.prerelease && pb.prerelease) return 1;
  if (pa.prerelease && pb.prerelease) return pa.prerelease < pb.prerelease ? -1 : 1;
  return 0;
}

export default function SemverSort() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const sort = useCallback(() => {
    const lines = input
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      setError("Please enter at least 2 version strings, one per line");
      return;
    }

    const invalid = lines.filter((v) => !valid(v));
    if (invalid.length) {
      setError(`Invalid versions: ${invalid.join(", ")}`);
      return;
    }

    setError("");
    setOutput(lines.sort(compare).join("\n"));
  }, [input]);

  const validate = useCallback(() => {
    const v = input.trim();
    if (!v) {
      setError("Please enter a version string");
      return;
    }
    setError("");
    setOutput(valid(v) ? "✓ Valid SemVer" : "✗ Not a valid SemVer");
  }, [input]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Actions">
            <Action title="Sort Versions" icon={Icon.List} onAction={sort} />
            <Action title="Validate Single" icon={Icon.CheckCircle} onAction={validate} />
          </ActionPanel.Section>
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="input" title="Input" placeholder={"1.0.0\n2.1.3\n1.9.9"} value={input} onChange={setInput} />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
