import { useState, useMemo } from "react";
import { Form } from "@raycast/api";

const METHODS: { method: string; description: string; safe: string; idempotent: string }[] = [
  {
    method: "GET",
    description: "Retrieve a resource. Should not modify server state.",
    safe: "Yes",
    idempotent: "Yes",
  },
  { method: "POST", description: "Create a new resource. Not idempotent.", safe: "No", idempotent: "No" },
  { method: "PUT", description: "Replace a resource (full update). Idempotent.", safe: "No", idempotent: "Yes" },
  {
    method: "PATCH",
    description: "Partial update to a resource. Not idempotent (usually).",
    safe: "No",
    idempotent: "No",
  },
  { method: "DELETE", description: "Remove a resource. Idempotent.", safe: "No", idempotent: "Yes" },
  { method: "HEAD", description: "GET without body — only response headers.", safe: "Yes", idempotent: "Yes" },
  { method: "OPTIONS", description: "Query allowed methods for a resource.", safe: "Yes", idempotent: "Yes" },
  { method: "TRACE", description: "Performs message loop-back test.", safe: "Yes", idempotent: "Yes" },
  { method: "CONNECT", description: "Establish tunnel for SSL/TLS.", safe: "No", idempotent: "No" },
];

export default function HttpMethodsRef() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      search.trim()
        ? METHODS.filter(
            (m) =>
              m.method.includes(search.toUpperCase()) || m.description.toLowerCase().includes(search.toLowerCase()),
          )
        : METHODS,
    [search],
  );
  return (
    <Form>
      <Form.TextField id="search" title="Search" placeholder="GET, POST…" value={search} onChange={setSearch} />
      {filtered.map((m) => (
        <Form.Description
          key={m.method}
          title={m.method}
          text={`${m.description} | Safe: ${m.safe} | Idempotent: ${m.idempotent}`}
        />
      ))}
    </Form>
  );
}
