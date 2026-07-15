import { useState, useMemo } from "react";
import { Form } from "@raycast/api";

const ITEMS = [
  { prop: "display", values: "flex | grid | block | inline | none", desc: "Defines the display type" },
  { prop: "flex-direction", values: "row | column | row-reverse | column-reverse", desc: "Main axis direction" },
  {
    prop: "justify-content",
    values: "flex-start | center | flex-end | space-between | space-around | space-evenly",
    desc: "Alignment along main axis",
  },
  {
    prop: "align-items",
    values: "stretch | flex-start | center | flex-end | baseline",
    desc: "Alignment along cross axis",
  },
  {
    prop: "align-self",
    values: "auto | stretch | flex-start | center | flex-end | baseline",
    desc: "Override align-items for one item",
  },
  { prop: "flex-wrap", values: "nowrap | wrap | wrap-reverse", desc: "Allow items to wrap" },
  { prop: "flex-grow", values: "0–N (default: 0)", desc: "Growth factor relative to siblings" },
  { prop: "flex-shrink", values: "0–N (default: 1)", desc: "Shrink factor" },
  { prop: "flex-basis", values: "auto | <length>", desc: "Initial size before distribution" },
  { prop: "flex", values: "<grow> <shrink> <basis>", desc: "Shorthand (e.g. flex: 1 1 auto)" },
  { prop: "gap", values: "<length>", desc: "Gap between flex items" },
  { prop: "order", values: "integer (default: 0)", desc: "Item order" },
  { prop: "grid-template-columns", values: "repeat(auto-fill, minmax(200px, 1fr))", desc: "Column track definition" },
  { prop: "grid-template-rows", values: "<track> ...", desc: "Row track definition" },
  { prop: "grid-column", values: "<start> / <end> | span <N>", desc: "Grid column placement" },
  { prop: "grid-row", values: "<start> / <end> | span <N>", desc: "Grid row placement" },
  { prop: "grid-area", values: "<name> | <row-start>/<col-start>/<row-end>/<col-end>", desc: "Grid area placement" },
  { prop: "grid-template-areas", values: '"header header" "sidebar main" "footer footer"', desc: "Named grid areas" },
  { prop: "place-items", values: "<align-items> / <justify-items>", desc: "Shorthand for align and justify items" },
  {
    prop: "place-content",
    values: "<align-content> / <justify-content>",
    desc: "Shorthand for align and justify content",
  },
];

export default function CssLayoutRef() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      search.trim()
        ? ITEMS.filter((i) => i.prop.includes(search) || i.desc.toLowerCase().includes(search.toLowerCase()))
        : ITEMS,
    [search],
  );

  return (
    <Form>
      <Form.TextField id="search" title="Search" placeholder="flex, grid, gap…" value={search} onChange={setSearch} />
      {filtered.map((i) => (
        <Form.Description key={i.prop} title={i.prop + ": " + i.values} text={i.desc} />
      ))}
    </Form>
  );
}
