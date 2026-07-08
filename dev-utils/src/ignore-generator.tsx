import { useState, useCallback } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const TEMPLATES: { name: string; content: string }[] = [
  {
    name: "Node.js",
    content: `node_modules/
dist/
build/
.env
.env.local
*.log
coverage/
.DS_Store
*.tsbuildinfo
.eslintcache
`,
  },
  {
    name: "Python",
    content: `__pycache__/
*.py[cod]
*.egg-info/
dist/
build/
.venv/
venv/
env/
*.env
.coverage
htmlcov/
.tox/
.mypy_cache/
.ruff_cache/
`,
  },
  {
    name: "Go",
    content: `vendor/
bin/
*.exe
*.test
*.out
coverage.out
.env
dist/
`,
  },
  {
    name: "Rust",
    content: `target/
**/*.rs.bk
Cargo.lock
.env
`,
  },
  {
    name: "Java",
    content: `target/
*.class
*.jar
*.war
*.log
.idea/
*.iml
.settings/
.classpath
.project
build/
.gradle/
`,
  },
  {
    name: "macOS",
    content: `.DS_Store
.AppleDouble
.LSOverride
Icon
.Spotlight-V100
.Trashes
`,
  },
  {
    name: "Windows",
    content: `Thumbs.db
Desktop.ini
ehthumbs.db
$RECYCLE.BIN/
*.tmp
`,
  },
  {
    name: "Docker",
    content: `.dockerignore:
.git
node_modules/
dist/
build/
.env
*.log
Dockerfile
Dockerfile.*
docker-compose*.yml
`,
  },
  {
    name: "React / CRA",
    content: `node_modules/
build/
.env.local
.env.development.local
.env.test.local
.env.production.local
coverage/
.DS_Store
*.log
`,
  },
  {
    name: "Next.js",
    content: `node_modules/
.next/
out/
.env.local
.env*.local
*.tsbuildinfo
next-env.d.ts
coverage/
.DS_Store
`,
  },
  {
    name: "Vue",
    content: `node_modules/
dist/
*.local
.DS_Store
coverage/
`,
  },
  {
    name: "Common",
    content: `node_modules/
dist/
build/
.env
.env.*
*.log
.DS_Store
.DS_Store?
coverage/
.nyc_output/
*.swp
*.swo
*~
`,
  },
];

export default function IgnoreGenerator() {
  const [template, setTemplate] = useState("Common");
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    const t = TEMPLATES.find((t) => t.name === template);
    setOutput(t?.content || "");
  }, [template]);

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
          {output && <Action title="Copy Output" icon={Icon.Clipboard} onAction={copy} />}
        </ActionPanel>
      }
    >
      <Form.Dropdown id="template" title="Template" value={template} onChange={setTemplate}>
        {TEMPLATES.map((t) => (
          <Form.Dropdown.Item key={t.name} value={t.name} title={t.name} />
        ))}
      </Form.Dropdown>
      {output && <Form.TextArea id="output" title={".gitignore"} value={output} onChange={() => {}} />}
    </Form>
  );
}
