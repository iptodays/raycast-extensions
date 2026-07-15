import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

type Field = { value: string; label: string };

function buildCron(parts: string[]): string {
  return parts.join(" ");
}

const EVERY = ["*", "*/1", "*/2", "*/5", "*/10", "*/15", "*/30"];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]!,
}));
const DOWS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export default function CronGenerator() {
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dom, setDom] = useState("*");
  const [month, setMonth] = useState("*");
  const [dow, setDow] = useState("*");
  const [output, setOutput] = useState("");
  const [description, setDescription] = useState("");

  const generate = useCallback(() => {
    const expr = `${minute} ${hour} ${dom} ${month} ${dow}`;
    setOutput(expr);

    // Build natural language description
    const parts: string[] = [];
    if (minute.startsWith("*/")) parts.push(`every ${minute.slice(2)} minute(s)`);
    else if (minute === "*") parts.push("every minute");
    else parts.push(`at minute ${minute}`);

    if (hour.startsWith("*/")) parts.push(`every ${hour.slice(2)} hour(s)`);
    else if (hour !== "*") parts.push(`at ${hour}:00`);

    if (dom !== "*") parts.push(`on day ${dom}`);
    if (month !== "*") parts.push(`in ${MONTHS[Number(month) - 1]?.label}`);
    if (dow !== "*") parts.push(`on ${DOWS[Number(dow)]?.label}`);
    else if (dom === "*") parts.push("every day");

    setDescription(parts.join(", "));
  }, [minute, hour, dom, month, dow]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Generate" icon={Icon.ArrowRight} onAction={generate} />
          {output && <Action title="Copy Cron" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown id="minute" title="Minute" value={minute} onChange={setMinute}>
        {EVERY.map((v) => (
          <Form.Dropdown.Item key={v} value={v} title={v === "*" ? "Every minute" : `Every ${v.slice(2)} min`} />
        ))}
        {Array.from({ length: 60 }, (_, i) => (
          <Form.Dropdown.Item key={i} value={String(i)} title={`At minute ${i}`} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="hour" title="Hour" value={hour} onChange={setHour}>
        <Form.Dropdown.Item value="*" title="Every hour" />
        {Array.from({ length: 24 }, (_, i) => (
          <Form.Dropdown.Item key={i} value={String(i)} title={`${String(i).padStart(2, "0")}:00`} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="dom" title="Day of Month" value={dom} onChange={setDom}>
        <Form.Dropdown.Item value="*" title="Every day" />
        {Array.from({ length: 31 }, (_, i) => (
          <Form.Dropdown.Item key={i + 1} value={String(i + 1)} title={`Day ${i + 1}`} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="month" title="Month" value={month} onChange={setMonth}>
        <Form.Dropdown.Item value="*" title="Every month" />
        {MONTHS.map((m) => (
          <Form.Dropdown.Item key={m.value} value={m.value} title={m.label} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="dow" title="Day of Week" value={dow} onChange={setDow}>
        <Form.Dropdown.Item value="*" title="Every day" />
        {DOWS.map((d) => (
          <Form.Dropdown.Item key={d.value} value={d.value} title={d.label} />
        ))}
      </Form.Dropdown>

      {output && (
        <>
          <Form.TextField id="output" title="Cron Expression" value={output} onChange={() => {}} />
          <Form.Description title="Meaning" text={description} />
        </>
      )}
    </Form>
  );
}
