import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function PackageJsonInspector() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const inspect = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter package.json content");
      return;
    }
    try {
      const pkg = JSON.parse(input);
      const problems: string[] = [];

      if (!pkg.name) problems.push("Missing 'name' field");
      if (!pkg.version) problems.push("Missing 'version' field");
      if (pkg.name && !/^(@[a-z0-9-]+\/)?[a-z0-9-]+$/.test(pkg.name)) problems.push("Invalid package name format");
      if (pkg.version && !/^\d+\.\d+\.\d+/.test(pkg.version)) problems.push("Version should be semver (e.g. 1.0.0)");
      if (pkg.license === undefined) problems.push("Missing 'license' field");
      if (pkg.private && pkg.publishConfig) problems.push("Note: package is marked private but has publishConfig");

      const summary = [
        `Name: ${pkg.name || "(missing)"}`,
        `Version: ${pkg.version || "(missing)"}`,
        `License: ${pkg.license || "(missing)"}`,
        `Private: ${pkg.private ? "Yes" : "No"}`,
        `Dependencies: ${Object.keys(pkg.dependencies || {}).length}`,
        `DevDependencies: ${Object.keys(pkg.devDependencies || {}).length}`,
        `Scripts: ${Object.keys(pkg.scripts || {}).length}`,
        `Total keys: ${Object.keys(pkg).length}`,
      ];

      if (problems.length) {
        summary.push("", "--- Issues ---", ...problems);
      } else {
        summary.push("", "No issues found.");
      }

      setError("");
      setOutput(summary.join("\n"));
    } catch {
      setError("Invalid JSON");
    }
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
          <Action title="Inspect" icon={Icon.MagnifyingGlass} onAction={inspect} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="input"
        title="package.json"
        placeholder='{"name":"my-app","version":"1.0.0"}'
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Inspection" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
