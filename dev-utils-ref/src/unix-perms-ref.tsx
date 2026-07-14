import { useState, useMemo } from "react";
import { Form } from "@raycast/api";

const ITEMS = [
  { symbol: "r", octal: "4", desc: "Read permission" },
  { symbol: "w", octal: "2", desc: "Write permission" },
  { symbol: "x", octal: "1", desc: "Execute permission" },
  { symbol: "-", octal: "0", desc: "No permission" },
  { symbol: "SUID", octal: "4xxx", desc: "Set user ID — run as file owner" },
  { symbol: "SGID", octal: "2xxx", desc: "Set group ID — run with group permissions" },
  { symbol: "Sticky", octal: "1xxx", desc: "Only owner can delete (used for /tmp)" },
];

export default function UnixPermsRef() {
  const [search, setSearch] = useState("");
  return (
    <Form>
      <Form.TextField
        id="search"
        title="Search"
        placeholder="SUID, sticky, octal…"
        value={search}
        onChange={setSearch}
      />
      {ITEMS.map((i) => (
        <Form.Description key={i.symbol} title={`${i.symbol} (${i.octal})`} text={i.desc} />
      ))}
      <Form.Separator />
      <Form.Description title="Examples" text="755 = rwxr-xr-x | 644 = rw-r--r-- | 1777 = rwxrwxrwt (sticky)" />
    </Form>
  );
}
