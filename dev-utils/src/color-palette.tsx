import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace(/^#/, "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const s1 = s / 100;
  const l1 = l / 100;
  const c = (1 - Math.abs(2 * l1 - 1)) * s1;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l1 - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rr) h = (gg - bb) / d + (gg < bb ? 6 : 0);
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

export default function ColorPalette() {
  const [input, setInput] = useState("");
  const [scheme, setScheme] = useState<"complementary" | "triadic" | "analogous" | "mono">("complementary");
  const [results, setResults] = useState<{ label: string; hex: string; preview: string }[]>([]);
  const [error, setError] = useState("");

  const generate = useCallback(() => {
    const rgb = hexToRgb(input.trim());
    if (!rgb) { setError("Enter a valid hex color like #FF0000"); return; }
    setError("");

    const [h, s, l] = rgbToHsl(...rgb);
    let colors: [number, number, number][] = [];

    switch (scheme) {
      case "complementary":
        colors = [rgb, hslToRgb((h + 180) % 360, s, l)];
        break;
      case "triadic":
        colors = [rgb, hslToRgb((h + 120) % 360, s, l), hslToRgb((h + 240) % 360, s, l)];
        break;
      case "analogous":
        colors = [
          hslToRgb((h + 330) % 360, s, l),
          rgb,
          hslToRgb((h + 30) % 360, s, l),
          hslToRgb((h + 60) % 360, s, l),
          hslToRgb((h + 90) % 360, s, l),
        ];
        break;
      case "mono": {
        for (let i = 0; i < 6; i++) {
          const nl = Math.max(5, Math.min(95, l + (i - 2) * 15));
          colors.push(hslToRgb(h, s, nl));
        }
        break;
      }
    }

    setResults(colors.map((c, i) => ({
      label: `Swatch ${i + 1}`,
      hex: rgbToHex(...c),
      preview: "█".repeat(10),
    })));
  }, [input, scheme]);

  const copy = useCallback(async (hex: string) => {
    await Clipboard.copy(hex);
    showToast(Toast.Style.Success, `Copied ${hex}`);
  }, []);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action title="Generate Palette" icon={Icon.Swatch} onAction={generate} />
        </ActionPanel>
      }
    >
      <Form.TextField id="color" title="Base Color" placeholder="#FF0000" value={input} onChange={setInput} />
      <Form.Dropdown id="scheme" title="Scheme" value={scheme} onChange={(v) => setScheme(v as typeof scheme)}>
        <Form.Dropdown.Item value="complementary" title="Complementary" />
        <Form.Dropdown.Item value="triadic" title="Triadic" />
        <Form.Dropdown.Item value="analogous" title="Analogous" />
        <Form.Dropdown.Item value="mono" title="Monochromatic" />
      </Form.Dropdown>
      {results.map((r, i) => (
        <Form.TextField
          key={i}
          id={`swatch-${i}`}
          title={r.label}
          value={`${r.hex}  ${r.preview}`}
          onChange={() => {}}
        />
      ))}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
