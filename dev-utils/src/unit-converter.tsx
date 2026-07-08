import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function round(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(4).replace(/\.?0+$/, "");
}

interface ConverterCategory {
  name: string;
  units: string[];
  convert: (value: number, from: string, to: string) => number;
}

const CONVERTERS: Record<string, ConverterCategory> = {
  Temperature: {
    name: "Temperature",
    units: ["Celsius", "Fahrenheit", "Kelvin"],
    convert(v, from, to) {
      let c: number;
      if (from === "Celsius") c = v;
      else if (from === "Fahrenheit") c = (v - 32) * 5 / 9;
      else c = v - 273.15;

      if (to === "Celsius") return c;
      if (to === "Fahrenheit") return c * 9 / 5 + 32;
      return c + 273.15;
    },
  },
  Length: {
    name: "Length",
    units: ["Meter", "Kilometer", "Centimeter", "Millimeter", "Mile", "Yard", "Foot", "Inch"],
    convert(v, from, to) {
      const toMeter: Record<string, number> = {
        Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001,
        Mile: 1609.344, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254,
      };
      return v * toMeter[from]! / toMeter[to]!;
    },
  },
  Weight: {
    name: "Weight",
    units: ["Kilogram", "Gram", "Milligram", "Metric Ton", "Pound", "Ounce", "Stone"],
    convert(v, from, to) {
      const toKg: Record<string, number> = {
        Kilogram: 1, Gram: 0.001, Milligram: 0.000001,
        "Metric Ton": 1000, Pound: 0.453592, Ounce: 0.0283495, Stone: 6.35029,
      };
      return v * toKg[from]! / toKg[to]!;
    },
  },
  Speed: {
    name: "Speed",
    units: ["km/h", "m/s", "mph", "knot"],
    convert(v, from, to) {
      const toMs: Record<string, number> = { "m/s": 1, "km/h": 1 / 3.6, mph: 0.44704, knot: 0.514444 };
      return v * toMs[from]! / toMs[to]!;
    },
  },
  Area: {
    name: "Area",
    units: ["Square Meter", "Square Kilometer", "Square Mile", "Acre", "Hectare", "Square Foot"],
    convert(v, from, to) {
      const toSqm: Record<string, number> = {
        "Square Meter": 1, "Square Kilometer": 1e6, "Square Mile": 2.59e6,
        Acre: 4046.86, Hectare: 10000, "Square Foot": 0.092903,
      };
      return v * toSqm[from]! / toSqm[to]!;
    },
  },
  Volume: {
    name: "Volume",
    units: ["Liter", "Milliliter", "Gallon (US)", "Quart (US)", "Cubic Meter", "Cubic Foot"],
    convert(v, from, to) {
      const toL: Record<string, number> = {
        Liter: 1, Milliliter: 0.001, "Gallon (US)": 3.78541,
        "Quart (US)": 0.946353, "Cubic Meter": 1000, "Cubic Foot": 28.3168,
      };
      return v * toL[from]! / toL[to]!;
    },
  },
  Data: {
    name: "Data",
    units: ["Byte", "Kilobyte", "Megabyte", "Gigabyte", "Terabyte", "Petabyte"],
    convert(v, from, to) {
      const toB: Record<string, number> = {
        Byte: 1, Kilobyte: 1024, Megabyte: 1024 ** 2, Gigabyte: 1024 ** 3,
        Terabyte: 1024 ** 4, Petabyte: 1024 ** 5,
      };
      return v * toB[from]! / toB[to]!;
    },
  },
};

export default function UnitConverter() {
  const [category, setCategory] = useState("Length");
  const [from, setFrom] = useState("Meter");
  const [to, setTo] = useState("Kilometer");
  const [value, setValue] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const conv = CONVERTERS[category]!;

  const convert = useCallback(() => {
    if (!value.trim()) {
      setError("Please enter a value");
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
      setError("Invalid number");
      return;
    }
    setError("");
    const out = conv.convert(num, from, to);
    setResult(`${value} ${from} = ${round(out)} ${to}`);
  }, [category, from, to, value]);

  const copy = useCallback(async () => {
    if (!result) return;
    await Clipboard.copy(result);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, [result]);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Convert" icon={Icon.ArrowRight} onAction={convert} />
          {result && <Action title="Copy Result" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown id="category" title="Category" value={category} onChange={(v) => {
        setCategory(v);
        const c = CONVERTERS[v]!;
        setFrom(c.units[0]!);
        setTo(c.units[1] ?? c.units[0]!);
        setResult("");
      }}>
        {Object.keys(CONVERTERS).map((k) => (
          <Form.Dropdown.Item key={k} value={k} title={k} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="from" title="From" value={from} onChange={(v) => { setFrom(v); setResult(""); }}>
        {conv.units.map((u) => (
          <Form.Dropdown.Item key={u} value={u} title={u} />
        ))}
      </Form.Dropdown>
      <Form.Dropdown id="to" title="To" value={to} onChange={(v) => { setTo(v); setResult(""); }}>
        {conv.units.map((u) => (
          <Form.Dropdown.Item key={u} value={u} title={u} />
        ))}
      </Form.Dropdown>
      <Form.TextField id="value" title="Value" placeholder="1" value={value} onChange={setValue} />
      {result && <Form.TextField id="result" title="Result" value={result} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
