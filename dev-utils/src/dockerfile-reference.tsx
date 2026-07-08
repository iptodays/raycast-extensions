import { useState, useMemo } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const INSTRUCTIONS: { instr: string; description: string; example: string }[] = [
  { instr: "FROM", description: "Set base image", example: "FROM node:20-alpine" },
  { instr: "RUN", description: "Execute a command in a new layer", example: "RUN npm ci --omit=dev" },
  { instr: "CMD", description: "Default command at container start", example: "CMD [\"node\", \"server.js\"]" },
  { instr: "ENTRYPOINT", description: "Main command (harder to override)", example: "ENTRYPOINT [\"docker-entrypoint.sh\"]" },
  { instr: "LABEL", description: "Add metadata (key=value)", example: "LABEL version=\"1.0\" maintainer=\"dev@example.com\"" },
  { instr: "EXPOSE", description: "Document container port", example: "EXPOSE 3000" },
  { instr: "ENV", description: "Set environment variable", example: "ENV NODE_ENV=production" },
  { instr: "ARG", description: "Build-time variable", example: "ARG VERSION=latest" },
  { instr: "COPY", description: "Copy files from context to image", example: "COPY package*.json ./" },
  { instr: "ADD", description: "Copy files (with URL/tar support)", example: "ADD https://example.com/file.tar.gz /tmp/" },
  { instr: "WORKDIR", description: "Set working directory", example: "WORKDIR /app" },
  { instr: "USER", description: "Set user for subsequent commands", example: "USER node" },
  { instr: "VOLUME", description: "Create mount point", example: "VOLUME /data" },
  { instr: "SHELL", description: "Override default shell", example: "SHELL [\"/bin/bash\", \"-c\"]" },
  { instr: "HEALTHCHECK", description: "Check container health", example: "HEALTHCHECK --interval=30s CMD curl -f http://localhost/" },
  { instr: "STOPSIGNAL", description: "Signal to stop the container", example: "STOPSIGNAL SIGTERM" },
  { instr: "ONBUILD", description: "Trigger on downstream build", example: "ONBUILD COPY . /app/src" },
];

export default function DockerfileReference() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      search.trim()
        ? INSTRUCTIONS.filter(
            (i) =>
              i.instr.toLowerCase().includes(search.toLowerCase()) ||
              i.description.toLowerCase().includes(search.toLowerCase())
          )
        : INSTRUCTIONS,
    [search]
  );

  return (
    <Form>
      <Form.TextField
        id="search"
        title="Search"
        placeholder="FROM, RUN, CMD…"
        value={search}
        onChange={setSearch}
      />
      {filtered.map((i) => (
        <Form.Description key={i.instr} title={i.instr} text={`${i.description}  (e.g. ${i.example})`} />
      ))}
    </Form>
  );
}
