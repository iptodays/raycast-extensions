import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const TIMEZONES = [
  "UTC", "GMT", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Europe/Istanbul", "Asia/Dubai", "Asia/Kolkata", "Asia/Shanghai",
  "Asia/Tokyo", "Asia/Seoul", "Asia/Singapore", "Asia/Hong_Kong",
  "Australia/Sydney", "Australia/Perth", "Pacific/Auckland",
  "Africa/Cairo", "Africa/Lagos", "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires", "America/Mexico_City",
];

function formatTz(date: Date, tz: string): string {
  try {
    return date.toLocaleString("en-US", { timeZone: tz });
  } catch {
    return "N/A";
  }
}

export default function TimezoneTool() {
  const [reference, setReference] = useState("UTC");
  const [offset, setOffset] = useState("0");
  const [inputTime, setInputTime] = useState("");
  const [results, setResults] = useState<{ tz: string; time: string }[]>([]);

  const convert = useCallback(() => {
    let refDate: Date;
    if (inputTime.trim()) {
      refDate = new Date(inputTime);
      if (isNaN(refDate.getTime())) {
        showToast(Toast.Style.Failure, "Cannot parse date/time. Try ISO format: 2024-01-01T12:00:00");
        return;
      }
    } else {
      refDate = new Date();
    }

    setResults(
      TIMEZONES.map((tz) => ({
        tz,
        time: formatTz(refDate, tz),
      }))
    );
  }, [inputTime]);

  const copy = useCallback(async () => {
    if (!results.length) return;
    const lines = results.map((r) => `${r.tz}: ${r.time}`).join("\n");
    await Clipboard.copy(lines);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [results]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Convert" icon={Icon.ArrowRight} onAction={convert} />
          {results.length > 0 && <Action title="Copy All" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="inputTime"
        title="Date/Time (optional, defaults to now)"
        placeholder="2024-01-01T12:00:00"
        value={inputTime}
        onChange={setInputTime}
      />
      {results.map((r) => (
        <Form.Description key={r.tz} title={r.tz} text={r.time} />
      ))}
    </Form>
  );
}
