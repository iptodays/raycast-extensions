import { useState, useMemo } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const LANGUAGES: [string, string, string][] = [
  ["aa", "aar", "Afar"], ["ab", "abk", "Abkhazian"], ["af", "afr", "Afrikaans"],
  ["ak", "aka", "Akan"], ["am", "amh", "Amharic"], ["ar", "ara", "Arabic"],
  ["as", "asm", "Assamese"], ["ay", "aym", "Aymara"], ["az", "aze", "Azerbaijani"],
  ["ba", "bak", "Bashkir"], ["be", "bel", "Belarusian"], ["bg", "bul", "Bulgarian"],
  ["bh", "bih", "Bihari"], ["bi", "bis", "Bislama"], ["bm", "bam", "Bambara"],
  ["bn", "ben", "Bengali"], ["bo", "bod", "Tibetan"], ["br", "bre", "Breton"],
  ["bs", "bos", "Bosnian"], ["ca", "cat", "Catalan"], ["ce", "che", "Chechen"],
  ["ch", "cha", "Chamorro"], ["co", "cos", "Corsican"], ["cr", "cre", "Cree"],
  ["cs", "ces", "Czech"], ["cv", "chv", "Chuvash"], ["cy", "cym", "Welsh"],
  ["da", "dan", "Danish"], ["de", "deu", "German"], ["dz", "dzo", "Dzongkha"],
  ["ee", "ewe", "Ewe"], ["el", "ell", "Greek"], ["en", "eng", "English"],
  ["eo", "epo", "Esperanto"], ["es", "spa", "Spanish"], ["et", "est", "Estonian"],
  ["eu", "eus", "Basque"], ["fa", "fas", "Persian"], ["ff", "ful", "Fulah"],
  ["fi", "fin", "Finnish"], ["fj", "fij", "Fijian"], ["fo", "fao", "Faroese"],
  ["fr", "fra", "French"], ["fy", "fry", "Frisian"], ["ga", "gle", "Irish"],
  ["gd", "gla", "Scottish Gaelic"], ["gl", "glg", "Galician"], ["gn", "grn", "Guarani"],
  ["gu", "guj", "Gujarati"], ["gv", "glv", "Manx"], ["ha", "hau", "Hausa"],
  ["he", "heb", "Hebrew"], ["hi", "hin", "Hindi"], ["ho", "hmo", "Hiri Motu"],
  ["hr", "hrv", "Croatian"], ["ht", "hat", "Haitian"], ["hu", "hun", "Hungarian"],
  ["hy", "hye", "Armenian"], ["hz", "her", "Herero"], ["ia", "ina", "Interlingua"],
  ["id", "ind", "Indonesian"], ["ie", "ile", "Interlingue"], ["ig", "ibo", "Igbo"],
  ["ii", "iii", "Sichuan Yi"], ["ik", "ipk", "Inupiaq"], ["io", "ido", "Ido"],
  ["is", "isl", "Icelandic"], ["it", "ita", "Italian"], ["iu", "iku", "Inuktitut"],
  ["ja", "jpn", "Japanese"], ["jv", "jav", "Javanese"], ["ka", "kat", "Georgian"],
  ["kg", "kon", "Kongo"], ["ki", "kik", "Kikuyu"], ["kj", "kua", "Kwanyama"],
  ["kk", "kaz", "Kazakh"], ["kl", "kal", "Kalaallisut"], ["km", "khm", "Khmer"],
  ["kn", "kan", "Kannada"], ["ko", "kor", "Korean"], ["kr", "kau", "Kanuri"],
  ["ks", "kas", "Kashmiri"], ["ku", "kur", "Kurdish"], ["kv", "kom", "Komi"],
  ["kw", "cor", "Cornish"], ["ky", "kir", "Kyrgyz"], ["la", "lat", "Latin"],
  ["lb", "ltz", "Luxembourgish"], ["lg", "lug", "Ganda"], ["li", "lim", "Limburgish"],
  ["ln", "lin", "Lingala"], ["lo", "lao", "Lao"], ["lt", "lit", "Lithuanian"],
  ["lu", "lub", "Luba-Katanga"], ["lv", "lav", "Latvian"], ["mg", "mlg", "Malagasy"],
  ["mh", "mah", "Marshallese"], ["mi", "mri", "Maori"], ["mk", "mkd", "Macedonian"],
  ["ml", "mal", "Malayalam"], ["mn", "mon", "Mongolian"], ["mr", "mar", "Marathi"],
  ["ms", "msa", "Malay"], ["mt", "mlt", "Maltese"], ["my", "mya", "Burmese"],
  ["na", "nau", "Nauru"], ["nb", "nob", "Norwegian Bokmål"], ["nd", "nde", "North Ndebele"],
  ["ne", "nep", "Nepali"], ["ng", "ndo", "Ndonga"], ["nl", "nld", "Dutch"],
  ["nn", "nno", "Norwegian Nynorsk"], ["no", "nor", "Norwegian"],
  ["nr", "nbl", "South Ndebele"], ["nv", "nav", "Navajo"], ["ny", "nya", "Chichewa"],
  ["oc", "oci", "Occitan"], ["oj", "oji", "Ojibwa"], ["om", "orm", "Oromo"],
  ["or", "ori", "Oriya"], ["os", "oss", "Ossetian"], ["pa", "pan", "Punjabi"],
  ["pi", "pli", "Pali"], ["pl", "pol", "Polish"], ["ps", "pus", "Pashto"],
  ["pt", "por", "Portuguese"], ["qu", "que", "Quechua"], ["rm", "roh", "Romansh"],
  ["rn", "run", "Rundi"], ["ro", "ron", "Romanian"], ["ru", "rus", "Russian"],
  ["rw", "kin", "Kinyarwanda"], ["sa", "san", "Sanskrit"], ["sc", "srd", "Sardinian"],
  ["sd", "snd", "Sindhi"], ["se", "sme", "Northern Sami"], ["sg", "sag", "Sango"],
  ["si", "sin", "Sinhala"], ["sk", "slk", "Slovak"], ["sl", "slv", "Slovenian"],
  ["sm", "smo", "Samoan"], ["sn", "sna", "Shona"], ["so", "som", "Somali"],
  ["sq", "sqi", "Albanian"], ["sr", "srp", "Serbian"], ["ss", "ssw", "Swati"],
  ["st", "sot", "Sesotho"], ["su", "sun", "Sundanese"], ["sv", "swe", "Swedish"],
  ["sw", "swa", "Swahili"], ["ta", "tam", "Tamil"], ["te", "tel", "Telugu"],
  ["tg", "tgk", "Tajik"], ["th", "tha", "Thai"], ["ti", "tir", "Tigrinya"],
  ["tk", "tuk", "Turkmen"], ["tl", "tgl", "Tagalog"], ["tn", "tsn", "Tswana"],
  ["to", "ton", "Tongan"], ["tr", "tur", "Turkish"], ["ts", "tso", "Tsonga"],
  ["tt", "tat", "Tatar"], ["tw", "twi", "Twi"], ["ty", "tah", "Tahitian"],
  ["ug", "uig", "Uighur"], ["uk", "ukr", "Ukrainian"], ["ur", "urd", "Urdu"],
  ["uz", "uzb", "Uzbek"], ["ve", "ven", "Venda"], ["vi", "vie", "Vietnamese"],
  ["vo", "vol", "Volapük"], ["wa", "wln", "Walloon"], ["wo", "wol", "Wolof"],
  ["xh", "xho", "Xhosa"], ["yi", "yid", "Yiddish"], ["yo", "yor", "Yoruba"],
  ["za", "zha", "Zhuang"], ["zh", "zho", "Chinese"], ["zu", "zul", "Zulu"],
];

export default function LanguageCodes() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      search.trim()
        ? LANGUAGES.filter(
            ([a2, a3, name]) =>
              a2.toLowerCase().includes(search.toLowerCase()) ||
              a3.toLowerCase().includes(search.toLowerCase()) ||
              name.toLowerCase().includes(search.toLowerCase())
          )
        : LANGUAGES,
    [search]
  );

  return (
    <Form>
      <Form.TextField
        id="search"
        title="Search"
        placeholder="Language name or code…"
        value={search}
        onChange={setSearch}
      />
      {filtered.slice(0, 100).map(([a2, a3, name]) => (
        <Form.Description key={a2} title={name} text={`${a2} / ${a3}`} />
      ))}
      {filtered.length > 100 && (
        <Form.Description title="" text={`… and ${filtered.length - 100} more`} />
      )}
    </Form>
  );
}
