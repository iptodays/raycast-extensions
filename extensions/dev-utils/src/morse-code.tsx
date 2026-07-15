import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const MORSE_MAP: Record<string, string> = {
  a: ".-",
  b: "-...",
  c: "-.-.",
  d: "-..",
  e: ".",
  f: "..-.",
  g: "--.",
  h: "....",
  i: "..",
  j: ".---",
  k: "-.-",
  l: ".-..",
  m: "--",
  n: "-.",
  o: "---",
  p: ".--.",
  q: "--.-",
  r: ".-.",
  s: "...",
  t: "-",
  u: "..-",
  v: "...-",
  w: ".--",
  x: "-..-",
  y: "-.--",
  z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "!": "-.-.--",
  ":": "---...",
  ";": "-.-.-.",
  "'": ".----.",
  '"': ".-..-.",
  "-": "-....-",
  "/": "-..-.",
  "@": ".--.-.",
  "=": "-...-",
  "+": ".-.-.",
};

const REVERSE_MORSE: Record<string, string> = {};
for (const [k, v] of Object.entries(MORSE_MAP)) {
  REVERSE_MORSE[v] = k;
}

function textToMorse(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((ch) => MORSE_MAP[ch] ?? (ch === " " ? "/" : ch))
    .join(" ");
}

function morseToText(morse: string): string {
  return morse
    .trim()
    .split(/\s+\/\s+|\s+/)
    .map((sym) => REVERSE_MORSE[sym] ?? (sym === "/" ? " " : sym))
    .join("");
}

export default function MorseCode() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const toMorse = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter text");
      return;
    }
    setError("");
    setOutput(textToMorse(input));
  }, [input]);

  const fromMorse = useCallback(() => {
    if (!input.trim()) {
      setError("Please enter Morse code");
      return;
    }
    setError("");
    setOutput(morseToText(input));
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
          <ActionPanel.Section title="Actions">
            <Action title="Text → Morse" icon={Icon.ArrowRight} onAction={toMorse} />
            <Action title="Morse → Text" icon={Icon.ArrowLeft} onAction={fromMorse} />
          </ActionPanel.Section>
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.TextArea id="input" title="Input" placeholder="SOS or ... --- ..." value={input} onChange={setInput} />
      {output && <Form.TextArea id="output" title="Output" value={output} onChange={() => {}} />}
      {error && <Form.Description text={`⚠️ ${error}`} />}
    </Form>
  );
}
