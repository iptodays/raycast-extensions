import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function DateCalculator() {
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [days, setDays] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"diff" | "add" | "info">("diff");

  const calcDiff = useCallback(() => {
    if (!date1.trim() || !date2.trim()) {
      setError("Please enter both dates");
      return;
    }
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      setError("Invalid date format. Try YYYY-MM-DD or ISO 8601");
      return;
    }
    setError("");
    const ms = Math.abs(d2.getTime() - d1.getTime());
    const totalDays = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const years = Math.floor(totalDays / 365.25);
    const months = Math.floor((totalDays % 365.25) / 30.44);
    const remDays = Math.floor(totalDays % 30.44);

    setOutput(
      [
        `Difference:`,
        `  ${totalDays} days (${hours}h ${minutes}m)`,
        `  ~${years}y ${months}m ${remDays}d`,
        `  ${ms} ms`,
        ``,
        `Date 1: ${d1.toLocaleDateString()} ${d1.toLocaleTimeString()}`,
        `Date 2: ${d2.toLocaleDateString()} ${d2.toLocaleTimeString()}`,
      ].join("\n")
    );
  }, [date1, date2]);

  const addDays = useCallback(() => {
    if (!date1.trim() || !days.trim()) {
      setError("Please enter a date and number of days");
      return;
    }
    const d = new Date(date1);
    if (isNaN(d.getTime())) {
      setError("Invalid date");
      return;
    }
    const n = parseInt(days, 10);
    if (isNaN(n)) {
      setError("Invalid number of days");
      return;
    }
    setError("");
    d.setDate(d.getDate() + n);
    setOutput(
      `${date1} ${n >= 0 ? "+" : ""}${n} days = ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
    );
  }, [date1, days]);

  const dateInfo = useCallback(() => {
    if (!date1.trim()) {
      setError("Please enter a date");
      return;
    }
    const d = new Date(date1);
    if (isNaN(d.getTime())) {
      setError("Invalid date");
      return;
    }
    setError("");
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / 86400000);
    const weekNum = Math.ceil(dayOfYear / 7);

    setOutput(
      [
        `Date: ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`,
        `Day of Year: ${dayOfYear}`,
        `Week Number: ~${weekNum}`,
        `Day of Week: ${d.toLocaleDateString("en-US", { weekday: "long" })}`,
        `Quarter: Q${Math.floor(d.getMonth() / 3) + 1}`,
        `Unix (s): ${Math.floor(d.getTime() / 1000)}`,
        `Unix (ms): ${d.getTime()}`,
        `ISO: ${d.toISOString()}`,
        `UTC: ${d.toUTCString()}`,
      ].join("\n")
    );
  }, [date1]);

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
            <Action title="Difference" icon={Icon.ArrowRight} onAction={calcDiff} />
            <Action title="Add Days" icon={Icon.Plus} onAction={addDays} />
            <Action title="Date Info" icon={Icon.Info} onAction={dateInfo} />
          </ActionPanel.Section>
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="date1"
        title="Date 1"
        placeholder="2024-01-15 or 2024-01-15T12:00:00"
        value={date1}
        onChange={setDate1}
      />
      <Form.TextField
        id="date2"
        title="Date 2 (for difference)"
        placeholder="2024-02-20"
        value={date2}
        onChange={setDate2}
      />
      <Form.TextField
        id="days"
        title="Days to Add"
        placeholder="7, -30, 90"
        value={days}
        onChange={setDays}
      />
      {output && <Form.TextArea id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
