import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function describeField(value: string, min: number, max: number, names: string[]): string {
  if (value === "*") return "every";
  if (value.startsWith("*/")) {
    const step = parseInt(value.slice(2), 10);
    return `every ${step} (${min}–${max})`;
  }
  if (value.includes(",")) {
    return value
      .split(",")
      .map((v) => {
        const n = parseInt(v, 10);
        return names[n] || String(n);
      })
      .join(", ");
  }
  if (value.includes("-")) {
    const [a, b] = value.split("-").map(Number);
    return `${names[a!] || a}–${names[b!] || b}`;
  }
  const n = parseInt(value, 10);
  return names[n] || String(n);
}

function parseCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5 && parts.length !== 6) {
    return "Expected 5 or 6 fields: minute hour dom month dow";
  }

  const offset = parts.length === 6 ? 1 : 0;
  const [minute, hour, dom, month, dow] = offset ? parts.slice(1) : parts;

  const minDesc = describeField(minute!, 0, 59, []);
  const hrDesc = describeField(hour!, 0, 23, []);
  const domDesc = describeField(dom!, 1, 31, []);
  const monDesc = describeField(month!, 1, 12, MONTHS);
  const dowDesc = describeField(dow!, 0, 6, DOW);

  return [
    `Minute:  ${minDesc}`,
    `Hour:    ${hrDesc}`,
    `Day:     ${domDesc} (of month)`,
    `Month:   ${monDesc}`,
    `Weekday: ${dowDesc}`,
  ].join("\n");
}

export default function CronParser() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const parse = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter a cron expression");
      return;
    }
    const result = parseCron(input);
    if (result.startsWith("Expected")) {
      setError(result);
      setOutput("");
      return;
    }
    setError("");
    setOutput(result);
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
          <Action title="Parse" icon={Icon.MagnifyingGlass} onAction={parse} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField id="input" title="Cron Expression" placeholder="*/5 * * * *" value={input} onChange={setInput} />
      {output && <Form.TextArea id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
