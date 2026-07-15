import { useState, useCallback, useEffect } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

export default function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed(Date.now() - startTime), 100);
    return () => clearInterval(id);
  }, [running, startTime]);

  const start = useCallback(() => {
    setStartTime(Date.now());
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
  }, []);

  const copyTime = useCallback(async () => {
    const s = Math.floor(elapsed / 1000);
    const ms = elapsed % 1000;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
    await Clipboard.copy(time);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [elapsed]);

  const formatElapsed = () => {
    const s = Math.floor(elapsed / 1000);
    const ms = elapsed % 1000;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Controls">
            {!running && <Action title="Start" icon={Icon.Play} onAction={start} />}
            {running && <Action title="Pause" icon={Icon.Pause} onAction={pause} />}
            <Action title="Reset" icon={Icon.RotateClockwise} onAction={reset} />
          </ActionPanel.Section>
          {elapsed > 0 && <Action title="Copy Time" icon={Icon.Clipboard} onAction={copyTime} />}
        </ActionPanel>
      }
    >
      <Form.Description title="Elapsed" text={formatElapsed()} />
      <Form.Description title="Seconds" text={(elapsed / 1000).toFixed(1)} />
      <Form.Description title="Status" text={running ? "▶ Running" : "⏸ Paused"} />
    </Form>
  );
}
