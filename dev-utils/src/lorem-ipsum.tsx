import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const LOREM_WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "ut",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "ut",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "dolor",
  "in",
  "reprehenderit",
  "in",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "dolore",
  "eu",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "in",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
];

function generateParagraph(wordCount: number): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]!);
  }
  const sentence = words.join(" ");
  return sentence[0]!.toUpperCase() + sentence.slice(1) + ".";
}

function generateSentences(count: number): string {
  return Array.from({ length: count }, () => generateParagraph(8 + Math.floor(Math.random() * 12))).join(" ");
}

function generateParagraphs(count: number): string {
  return Array.from({ length: count }, () => generateParagraph(30 + Math.floor(Math.random() * 40))).join("\n\n");
}

export default function LoremIpsum() {
  const [sentences, setSentences] = useState("");
  const [paragraphs, setParagraphs] = useState("");

  const generateSentencesOnly = useCallback((count: number) => {
    const text = generateSentences(count);
    setSentences(text);
    setParagraphs("");
  }, []);

  const generateParagraphsOnly = useCallback((count: number) => {
    const text = generateParagraphs(count);
    setParagraphs(text);
    setSentences("");
  }, []);

  const copy = useCallback(async (text: string) => {
    await Clipboard.copy(text);
    showToast(Toast.Style.Success, "Copied to clipboard");
  }, []);

  const displayText = sentences || paragraphs;

  return (
    <Form
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Generate">
            <Action title="1 Sentence" icon={Icon.Text} onAction={() => generateSentencesOnly(1)} />
            <Action title="3 Sentences" icon={Icon.Text} onAction={() => generateSentencesOnly(3)} />
            <Action title="5 Sentences" icon={Icon.Text} onAction={() => generateSentencesOnly(5)} />
          </ActionPanel.Section>
          <ActionPanel.Section title="Paragraphs">
            <Action title="1 Paragraph" icon={Icon.Paragraph} onAction={() => generateParagraphsOnly(1)} />
            <Action title="3 Paragraphs" icon={Icon.Paragraph} onAction={() => generateParagraphsOnly(3)} />
            <Action title="5 Paragraphs" icon={Icon.Paragraph} onAction={() => generateParagraphsOnly(5)} />
          </ActionPanel.Section>
          {displayText && (
            <ActionPanel.Section title="Copy">
              <Action title="Copy Output" icon={Icon.Clipboard} onAction={() => copy(displayText)} />
            </ActionPanel.Section>
          )}
        </ActionPanel>
      }
    >
      {displayText && (
        <Form.TextArea
          id="output"
          title="Output"
          value={displayText}
          onChange={() => {}}
          info="Use Copy Output action to copy to clipboard"
        />
      )}
      {!displayText && <Form.Description text="Select an action to generate placeholder text." />}
    </Form>
  );
}
