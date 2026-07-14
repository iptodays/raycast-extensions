import { useState, useMemo } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const EMOJIS: [string, string, string][] = [
  ["😀", "Grinning Face", "U+1F600"],
  ["😃", "Grinning Face with Big Eyes", "U+1F603"],
  ["😄", "Grinning Face with Smiling Eyes", "U+1F604"],
  ["😁", "Beaming Face with Smiling Eyes", "U+1F601"],
  ["😅", "Grinning Face with Sweat", "U+1F605"],
  ["😂", "Face with Tears of Joy", "U+1F602"],
  ["🤣", "Rolling on the Floor Laughing", "U+1F923"],
  ["😊", "Smiling Face with Smiling Eyes", "U+1F60A"],
  ["😇", "Smiling Face with Halo", "U+1F607"],
  ["🙂", "Slightly Smiling Face", "U+1F642"],
  ["😉", "Winking Face", "U+1F609"],
  ["😌", "Relieved Face", "U+1F60C"],
  ["😍", "Smiling Face with Heart-Eyes", "U+1F60D"],
  ["🥰", "Smiling Face with Hearts", "U+1F970"],
  ["😘", "Face Blowing a Kiss", "U+1F618"],
  ["😗", "Kissing Face", "U+1F617"],
  ["😋", "Face Savoring Food", "U+1F60B"],
  ["😛", "Face with Tongue", "U+1F61B"],
  ["🤗", "Hugging Face", "U+1F917"],
  ["🤔", "Thinking Face", "U+1F914"],
  ["🤐", "Zipper-Mouth Face", "U+1F910"],
  ["😐", "Neutral Face", "U+1F610"],
  ["😑", "Expressionless Face", "U+1F611"],
  ["😶", "Face Without Mouth", "U+1F636"],
  ["😏", "Smirking Face", "U+1F60F"],
  ["😒", "Unamused Face", "U+1F612"],
  ["🙄", "Face with Rolling Eyes", "U+1F644"],
  ["😬", "Grimacing Face", "U+1F62C"],
  ["😔", "Pensive Face", "U+1F614"],
  ["😴", "Sleeping Face", "U+1F634"],
  ["😷", "Face with Medical Mask", "U+1F637"],
  ["🤒", "Face with Thermometer", "U+1F912"],
  ["🤕", "Face with Head-Bandage", "U+1F915"],
  ["🥺", "Pleading Face", "U+1F97A"],
  ["😎", "Smiling Face with Sunglasses", "U+1F60E"],
  ["🤩", "Star-Struck", "U+1F929"],
  ["😢", "Crying Face", "U+1F622"],
  ["😭", "Loudly Crying Face", "U+1F62D"],
  ["😤", "Face with Steam From Nose", "U+1F624"],
  ["😠", "Angry Face", "U+1F620"],
  ["🤬", "Face with Medical Symbols", "U+1F92C"],
  ["😡", "Pouting Face", "U+1F621"],
  ["🥶", "Cold Face", "U+1F976"],
  ["🥵", "Hot Face", "U+1F975"],
  ["🤯", "Exploding Head", "U+1F92F"],
  ["😱", "Face Screaming in Fear", "U+1F631"],
  ["😨", "Fearful Face", "U+1F628"],
  ["😰", "Anxious Face with Sweat", "U+1F630"],
  ["🥳", "Partying Face", "U+1F973"],
  ["😈", "Smiling Face with Horns", "U+1F608"],
  ["👿", "Angry Face with Horns", "U+1F47F"],
  ["💀", "Skull", "U+1F480"],
  ["☠️", "Skull and Crossbones", "U+2620"],
  ["👻", "Ghost", "U+1F47B"],
  ["👍", "Thumbs Up", "U+1F44D"],
  ["👎", "Thumbs Down", "U+1F44E"],
  ["👏", "Clapping Hands", "U+1F44F"],
  ["🙌", "Raising Hands", "U+1F64C"],
  ["🤝", "Handshake", "U+1F91D"],
  ["💪", "Flexed Biceps", "U+1F4AA"],
  ["✋", "Raised Hand", "U+270B"],
  ["👋", "Waving Hand", "U+1F44B"],
  ["🤚", "Raised Back of Hand", "U+1F91A"],
  ["🖐️", "Hand with Fingers Splayed", "U+1F590"],
  ["✌️", "Victory Hand", "U+270C"],
  ["🤞", "Crossed Fingers", "U+1F91E"],
  ["❤️", "Red Heart", "U+2764"],
  ["🧡", "Orange Heart", "U+1F9E1"],
  ["💛", "Yellow Heart", "U+1F49B"],
  ["💚", "Green Heart", "U+1F49A"],
  ["💙", "Blue Heart", "U+1F499"],
  ["💜", "Purple Heart", "U+1F49C"],
  ["🖤", "Black Heart", "U+1F5A4"],
  ["🤍", "White Heart", "U+1F90D"],
  ["💔", "Broken Heart", "U+1F494"],
  ["🔥", "Fire", "U+1F525"],
  ["⭐", "Star", "U+2B50"],
  ["✨", "Sparkles", "U+2728"],
  ["💡", "Light Bulb", "U+1F4A1"],
  ["📌", "Pushpin", "U+1F4CC"],
  ["🔍", "Magnifying Glass Tilted Left", "U+1F50D"],
  ["✅", "Check Mark Button", "U+2705"],
  ["❌", "Cross Mark", "U+274C"],
  ["🚀", "Rocket", "U+1F680"],
  ["🎉", "Party Popper", "U+1F389"],
  ["🎂", "Birthday Cake", "U+1F382"],
  ["☕", "Hot Beverage", "U+2615"],
  ["🍕", "Pizza", "U+1F355"],
  ["🌍", "Globe Showing Europe-Africa", "U+1F30D"],
  ["🌈", "Rainbow", "U+1F308"],
  ["⚡", "High Voltage", "U+26A1"],
  ["💻", "Laptop", "U+1F4BB"],
  ["📱", "Mobile Phone", "U+1F4F1"],
  ["🔒", "Locked", "U+1F512"],
  ["🔓", "Unlocked", "U+1F513"],
  ["🛡️", "Shield", "U+1F6E1"],
  ["🗝️", "Key", "U+1F5DD"],
  ["🎯", "Direct Hit", "U+1F3AF"],
  ["🧠", "Brain", "U+1F9E0"],
  ["👁️", "Eye", "U+1F441"],
  ["🗣️", "Speaking Head", "U+1F5E3"],
];

export default function EmojiPicker() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      search.trim()
        ? EMOJIS.filter(
            ([emoji, name, code]) =>
              name.toLowerCase().includes(search.toLowerCase()) ||
              code.toLowerCase().includes(search) ||
              emoji === search.trim(),
          )
        : EMOJIS,
    [search],
  );

  return (
    <Form
      actions={
        <ActionPanel>
          {filtered.length === 1 && (
            <Action
              title="Copy Emoji"
              icon={Icon.Clipboard}
              onAction={async () => {
                await Clipboard.copy(filtered[0]![0]);
                showToast(Toast.Style.Success, "Copied to clipboard");
              }}
            />
          )}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="search"
        title="Search"
        placeholder="heart, fire, rocket, smile…"
        value={search}
        onChange={setSearch}
      />
      {filtered.slice(0, 100).map(([emoji, name, code]) => (
        <Form.Description key={code} title={`${emoji}  ${name}`} text={code} />
      ))}
      {filtered.length > 100 && <Form.Description title="" text={`… and ${filtered.length - 100} more`} />}
    </Form>
  );
}
