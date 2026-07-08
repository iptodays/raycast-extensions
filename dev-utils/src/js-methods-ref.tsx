import { useState, useMemo } from "react";
import { Form } from "@raycast/api";

const METHODS = [
  { name: "Array.map()", sig: "(el, idx, arr) => newArr", desc: "Transform each element" },
  { name: "Array.filter()", sig: "(el, idx, arr) => boolean", desc: "Keep elements matching condition" },
  { name: "Array.reduce()", sig: "(acc, el, idx, arr) => result", desc: "Reduce to single value" },
  { name: "Array.forEach()", sig: "(el, idx, arr) => void", desc: "Iterate (no return)" },
  { name: "Array.find()", sig: "(el, idx, arr) => boolean", desc: "First matching element" },
  { name: "Array.findIndex()", sig: "(el, idx, arr) => boolean", desc: "Index of first match" },
  { name: "Array.some()", sig: "(el, idx, arr) => boolean", desc: "Any element matches?" },
  { name: "Array.every()", sig: "(el, idx, arr) => boolean", desc: "All elements match?" },
  { name: "Array.includes()", sig: "(value, fromIndex?) => boolean", desc: "Value present?" },
  { name: "Array.indexOf()", sig: "(value, fromIndex?) => number", desc: "First index of value" },
  { name: "Array.slice()", sig: "(start, end?) => newArr", desc: "Shallow copy of portion" },
  { name: "Array.splice()", sig: "(start, deleteCount?, items...) => removed", desc: "Remove/replace elements in place" },
  { name: "Array.push()", sig: "(...items) => newLength", desc: "Add to end" },
  { name: "Array.pop()", sig: "() => lastElement", desc: "Remove from end" },
  { name: "Array.shift()", sig: "() => firstElement", desc: "Remove from start" },
  { name: "Array.unshift()", sig: "(...items) => newLength", desc: "Add to start" },
  { name: "Array.sort()", sig: "(compareFn?) => sorted", desc: "Sort in place" },
  { name: "Array.reverse()", sig: "() => reversed", desc: "Reverse in place" },
  { name: "Array.join()", sig: "(sep?) => string", desc: "Join elements to string" },
  { name: "Array.flat()", sig: "(depth?) => flattened", desc: "Flatten nested arrays" },
  { name: "Array.flatMap()", sig: "(el, idx, arr) => flatMapped", desc: "Map then flatten" },
  { name: "Array.from()", sig: "(iterable, mapFn?) => newArr", desc: "Create array from iterable" },
  { name: "Array.of()", sig: "(...items) => newArr", desc: "Create array from args" },
  { name: "String.includes()", sig: "(search, pos?) => boolean", desc: "Substring present?" },
  { name: "String.indexOf()", sig: "(search, pos?) => number", desc: "First index of substring" },
  { name: "String.slice()", sig: "(start, end?) => newStr", desc: "Substring portion" },
  { name: "String.substring()", sig: "(start, end) => newStr", desc: "Substring (no negative index)" },
  { name: "String.split()", sig: "(sep, limit?) => arr", desc: "Split into array" },
  { name: "String.replace()", sig: "(regex|str, newStr|fn) => newStr", desc: "Replace substring" },
  { name: "String.replaceAll()", sig: "(search, replacement) => newStr", desc: "Replace all occurrences" },
  { name: "String.trim()", sig: "() => trimmed", desc: "Remove whitespace from both ends" },
  { name: "String.padStart()", sig: "(len, str?) => padded", desc: "Pad to start" },
  { name: "String.padEnd()", sig: "(len, str?) => padded", desc: "Pad to end" },
  { name: "String.match()", sig: "(regex) => matches[]", desc: "Regex match results" },
  { name: "String.matchAll()", sig: "(regex) => iterator", desc: "All regex matches as iterator" },
  { name: "String.startsWith()", sig: "(search, pos?) => boolean", desc: "Starts with substring?" },
  { name: "String.endsWith()", sig: "(search, len?) => boolean", desc: "Ends with substring?" },
  { name: "String.toLowerCase()", sig: "() => lower", desc: "To lowercase" },
  { name: "String.toUpperCase()", sig: "() => upper", desc: "To uppercase" },
  { name: "String.repeat()", sig: "(count) => repeated", desc: "Repeat string N times" },
  { name: "String.charCodeAt()", sig: "(idx) => codePoint", desc: "UTF-16 code unit at index" },
];

export default function JsMethodsRef() {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => search.trim() ? METHODS.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase())) : METHODS,
    [search]
  );

  return (
    <Form>
      <Form.TextField id="search" title="Search" placeholder="map, reduce, slice…" value={search} onChange={setSearch} />
      {filtered.map((m) => (
        <Form.Description key={m.name} title={`${m.name} → ${m.sig}`} text={m.desc} />
      ))}
    </Form>
  );
}
