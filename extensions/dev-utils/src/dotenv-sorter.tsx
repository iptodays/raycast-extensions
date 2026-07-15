import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function DotenvSorter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [sortType, setSortType] = useState<"alpha" | "grouped">("alpha");
  const [uppercase, setUppercase] = useState(true);

  const sort = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter .env content");
      return;
    }

    const lines = input.split("\n");
    const vars: { key: string; value: string; raw: string; comment: string }[] = [];
    let currentComment = "";

    for (const line of lines) {
      if (line.trim().startsWith("#")) {
        currentComment += (currentComment ? "\n" : "") + line;
        continue;
      }
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (m) {
        let key = m[1]!;
        const value = m[2]!;
        if (uppercase) key = key.toUpperCase();
        vars.push({ key, value, raw: `${key}=${value}`, comment: currentComment });
        currentComment = "";
      } else if (line.trim()) {
        // Keep other lines as comments
        currentComment += (currentComment ? "\n" : "") + line;
      }
    }

    if (sortType === "alpha") {
      vars.sort((a, b) => a.key.localeCompare(b.key));
    } else {
      const grouped = ["NODE_", "REACT_", "VUE_", "NEXT_", "VITE_", "API_", "DB_", "REDIS_", "AWS_", "LOG_"];
      vars.sort((a, b) => {
        for (const prefix of grouped) {
          const aMatch = a.key.startsWith(prefix);
          const bMatch = b.key.startsWith(prefix);
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          if (aMatch && bMatch) return a.key.localeCompare(b.key);
        }
        return a.key.localeCompare(b.key);
      });
    }

    setOutput(vars.map((v) => (v.comment ? v.comment + "\n" : "") + v.raw).join("\n"));
    setError("");
  }, [input, sortType, uppercase]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Sort" icon={Icon.ArrowRight} onAction={sort} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="sortType"
        title="Sort Type"
        value={sortType}
        onChange={(v) => setSortType(v as "alpha" | "grouped")}
      >
        <Form.Dropdown.Item value="alpha" title="Alphabetical" />
        <Form.Dropdown.Item value="grouped" title="Grouped by Prefix" />
      </Form.Dropdown>
      <Form.Checkbox id="uppercase" label="Uppercase Keys" value={uppercase} onChange={setUppercase} />
      <Form.TextArea
        id="input"
        title="Input"
        placeholder={"DB_HOST=localhost\nAPI_KEY=abc123\nNODE_ENV=dev"}
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Sorted" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
