import { useState } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function generateTable(): string {
  const lines: string[] = [];
  lines.push("Dec  Hex  Char   Dec  Hex  Char   Dec  Hex  Char   Dec  Hex  Char");
  lines.push("─".repeat(56));

  for (let row = 0; row < 32; row++) {
    const cols: string[] = [];
    for (let block = 0; block < 4; block++) {
      const code = row + block * 32;
      const char =
        code <= 0x7f ? (code >= 0x20 && code !== 0x7f ? String.fromCodePoint(code) : code === 0x20 ? "␣" : "␀") : "-";
      cols.push(`${String(code).padStart(3)}  ${code.toString(16).toUpperCase().padStart(2)}  ${char.padEnd(3)}`);
    }
    lines.push(cols.join("   "));
  }

  return lines.join("\n");
}

const TABLE = generateTable();

export default function AsciiTable() {
  const [output] = useState(TABLE);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action
            title="Copy Table"
            icon={Icon.Clipboard}
            onAction={async () => {
              await Clipboard.copy(output);
              showToast(Toast.Style.Success, "Copied to clipboard");
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Description text="ASCII table (0–127) — use Copy Table to copy." />
      <Form.TextArea id="output" title="ASCII Table" value={output} onChange={() => {}} />
    </Form>
  );
}
