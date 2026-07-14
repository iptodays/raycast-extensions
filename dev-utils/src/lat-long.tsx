import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function dmsToDecimal(deg: number, min: number, sec: number, dir: string): number {
  let dec = deg + min / 60 + sec / 3600;
  if (dir === "S" || dir === "W") dec = -dec;
  return dec;
}

function decimalToDMS(dec: number, isLat: boolean): string {
  const dir = isLat ? (dec >= 0 ? "N" : "S") : dec >= 0 ? "E" : "W";
  const abs = Math.abs(dec);
  const deg = Math.floor(abs);
  const min = Math.floor((abs - deg) * 60);
  const sec = (abs - deg - min / 60) * 3600;
  return `${deg}°${min}'${sec.toFixed(2)}"${dir}`;
}

export default function LatLongTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [direction, setDirection] = useState<"dms" | "dec">("dec");

  const convert = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter coordinates");
      return;
    }

    if (direction === "dec") {
      // Decimal → DMS
      const parts = trimmed.split(/[,\s]+/).filter(Boolean);
      if (parts.length < 2) {
        setError("Enter lat, lng (e.g. 40.7128, -74.0060)");
        return;
      }
      const lat = parseFloat(parts[0]!);
      const lng = parseFloat(parts[1]!);
      if (isNaN(lat) || isNaN(lng)) {
        setError("Invalid numbers");
        return;
      }
      setError("");
      setOutput([decimalToDMS(lat, true), decimalToDMS(lng, false)].join("\n"));
    } else {
      // DMS → Decimal
      const m = trimmed.match(/(\d+)[°d]\s*(\d+)['m]\s*([\d.]+)["s]?\s*([NSEW])/i);
      if (!m) {
        setError("Format: 40°42'46\"N 74°00'21\"W");
        return;
      }
      const deg = parseFloat(m[1]!);
      const min = parseFloat(m[2]!);
      const sec = parseFloat(m[3]!);
      const dir = m[4]!.toUpperCase();
      if (isNaN(deg) || isNaN(min) || isNaN(sec)) {
        setError("Invalid DMS values");
        return;
      }
      setError("");
      setOutput(String(dmsToDecimal(deg, min, sec, dir)));
    }
  }, [input, direction]);

  const copy = useCallback(async () => {
    if (!output) return;
    await Clipboard.copy(output);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [output]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Convert" icon={Icon.ArrowRight} onAction={convert} />
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="direction"
        title="Direction"
        value={direction}
        onChange={(v) => setDirection(v as "dms" | "dec")}
      >
        <Form.Dropdown.Item value="dec" title="Decimal → DMS" />
        <Form.Dropdown.Item value="dms" title="DMS → Decimal" />
      </Form.Dropdown>
      <Form.TextField
        id="input"
        title="Input"
        placeholder={direction === "dec" ? "40.7128, -74.0060" : "40°42'46\"N 74°00'21\"W"}
        value={input}
        onChange={setInput}
      />
      {output && <Form.TextArea id="output" title="Result" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
