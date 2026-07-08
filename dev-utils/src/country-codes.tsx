import { useState, useMemo } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const COUNTRIES: [string, string, string][] = [
  ["AD", "AND", "Andorra"], ["AE", "ARE", "United Arab Emirates"], ["AF", "AFG", "Afghanistan"],
  ["AG", "ATG", "Antigua and Barbuda"], ["AI", "AIA", "Anguilla"], ["AL", "ALB", "Albania"],
  ["AM", "ARM", "Armenia"], ["AO", "AGO", "Angola"], ["AR", "ARG", "Argentina"],
  ["AT", "AUT", "Austria"], ["AU", "AUS", "Australia"], ["AZ", "AZE", "Azerbaijan"],
  ["BA", "BIH", "Bosnia and Herzegovina"], ["BB", "BRB", "Barbados"], ["BD", "BGD", "Bangladesh"],
  ["BE", "BEL", "Belgium"], ["BG", "BGR", "Bulgaria"], ["BH", "BHR", "Bahrain"],
  ["BN", "BRN", "Brunei"], ["BO", "BOL", "Bolivia"], ["BR", "BRA", "Brazil"],
  ["BS", "BHS", "Bahamas"], ["BT", "BTN", "Bhutan"], ["BW", "BWA", "Botswana"],
  ["BY", "BLR", "Belarus"], ["BZ", "BLZ", "Belize"], ["CA", "CAN", "Canada"],
  ["CD", "COD", "Congo (DRC)"], ["CF", "CAF", "Central African Republic"],
  ["CG", "COG", "Congo (Republic)"], ["CH", "CHE", "Switzerland"],
  ["CI", "CIV", "Côte d'Ivoire"], ["CL", "CHL", "Chile"], ["CM", "CMR", "Cameroon"],
  ["CN", "CHN", "China"], ["CO", "COL", "Colombia"], ["CR", "CRI", "Costa Rica"],
  ["CU", "CUB", "Cuba"], ["CV", "CPV", "Cape Verde"], ["CY", "CYP", "Cyprus"],
  ["CZ", "CZE", "Czech Republic"], ["DE", "DEU", "Germany"], ["DK", "DNK", "Denmark"],
  ["DO", "DOM", "Dominican Republic"], ["DZ", "DZA", "Algeria"], ["EC", "ECU", "Ecuador"],
  ["EE", "EST", "Estonia"], ["EG", "EGY", "Egypt"], ["ES", "ESP", "Spain"],
  ["FI", "FIN", "Finland"], ["FJ", "FJI", "Fiji"], ["FR", "FRA", "France"],
  ["GA", "GAB", "Gabon"], ["GB", "GBR", "United Kingdom"], ["GD", "GRD", "Grenada"],
  ["GE", "GEO", "Georgia"], ["GH", "GHA", "Ghana"], ["GM", "GMB", "Gambia"],
  ["GN", "GIN", "Guinea"], ["GR", "GRC", "Greece"], ["GT", "GTM", "Guatemala"],
  ["GY", "GUY", "Guyana"], ["HK", "HKG", "Hong Kong"], ["HN", "HND", "Honduras"],
  ["HR", "HRV", "Croatia"], ["HT", "HTI", "Haiti"], ["HU", "HUN", "Hungary"],
  ["ID", "IDN", "Indonesia"], ["IE", "IRL", "Ireland"], ["IL", "ISR", "Israel"],
  ["IN", "IND", "India"], ["IQ", "IRQ", "Iraq"], ["IR", "IRN", "Iran"],
  ["IS", "ISL", "Iceland"], ["IT", "ITA", "Italy"], ["JM", "JAM", "Jamaica"],
  ["JO", "JOR", "Jordan"], ["JP", "JPN", "Japan"], ["KE", "KEN", "Kenya"],
  ["KH", "KHM", "Cambodia"], ["KR", "KOR", "South Korea"], ["KW", "KWT", "Kuwait"],
  ["KZ", "KAZ", "Kazakhstan"], ["LA", "LAO", "Laos"], ["LB", "LBN", "Lebanon"],
  ["LI", "LIE", "Liechtenstein"], ["LK", "LKA", "Sri Lanka"], ["LR", "LBR", "Liberia"],
  ["LT", "LTU", "Lithuania"], ["LU", "LUX", "Luxembourg"], ["LV", "LVA", "Latvia"],
  ["LY", "LBY", "Libya"], ["MA", "MAR", "Morocco"], ["MC", "MCO", "Monaco"],
  ["MD", "MDA", "Moldova"], ["ME", "MNE", "Montenegro"], ["MG", "MDG", "Madagascar"],
  ["MK", "MKD", "North Macedonia"], ["ML", "MLI", "Mali"], ["MM", "MMR", "Myanmar"],
  ["MN", "MNG", "Mongolia"], ["MO", "MAC", "Macau"], ["MR", "MRT", "Mauritania"],
  ["MT", "MLT", "Malta"], ["MU", "MUS", "Mauritius"], ["MV", "MDV", "Maldives"],
  ["MW", "MWI", "Malawi"], ["MX", "MEX", "Mexico"], ["MY", "MYS", "Malaysia"],
  ["MZ", "MOZ", "Mozambique"], ["NA", "NAM", "Namibia"], ["NE", "NER", "Niger"],
  ["NG", "NGA", "Nigeria"], ["NI", "NIC", "Nicaragua"], ["NL", "NLD", "Netherlands"],
  ["NO", "NOR", "Norway"], ["NP", "NPL", "Nepal"], ["NZ", "NZL", "New Zealand"],
  ["OM", "OMN", "Oman"], ["PA", "PAN", "Panama"], ["PE", "PER", "Peru"],
  ["PG", "PNG", "Papua New Guinea"], ["PH", "PHL", "Philippines"],
  ["PK", "PAK", "Pakistan"], ["PL", "POL", "Poland"], ["PR", "PRI", "Puerto Rico"],
  ["PT", "PRT", "Portugal"], ["PY", "PRY", "Paraguay"], ["QA", "QAT", "Qatar"],
  ["RO", "ROU", "Romania"], ["RS", "SRB", "Serbia"], ["RU", "RUS", "Russia"],
  ["RW", "RWA", "Rwanda"], ["SA", "SAU", "Saudi Arabia"], ["SC", "SYC", "Seychelles"],
  ["SD", "SDN", "Sudan"], ["SE", "SWE", "Sweden"], ["SG", "SGP", "Singapore"],
  ["SI", "SVN", "Slovenia"], ["SK", "SVK", "Slovakia"], ["SL", "SLE", "Sierra Leone"],
  ["SM", "SMR", "San Marino"], ["SN", "SEN", "Senegal"], ["SO", "SOM", "Somalia"],
  ["SR", "SUR", "Suriname"], ["SS", "SSD", "South Sudan"], ["ST", "STP", "São Tomé and Príncipe"],
  ["SV", "SLV", "El Salvador"], ["SY", "SYR", "Syria"], ["SZ", "SWZ", "Eswatini"],
  ["TD", "TCD", "Chad"], ["TG", "TGO", "Togo"], ["TH", "THA", "Thailand"],
  ["TJ", "TJK", "Tajikistan"], ["TL", "TLS", "Timor-Leste"], ["TM", "TKM", "Turkmenistan"],
  ["TN", "TUN", "Tunisia"], ["TO", "TON", "Tonga"], ["TR", "TUR", "Turkey"],
  ["TT", "TTO", "Trinidad and Tobago"], ["TV", "TUV", "Tuvalu"], ["TW", "TWN", "Taiwan"],
  ["TZ", "TZA", "Tanzania"], ["UA", "UKR", "Ukraine"], ["UG", "UGA", "Uganda"],
  ["US", "USA", "United States"], ["UY", "URY", "Uruguay"], ["UZ", "UZB", "Uzbekistan"],
  ["VA", "VAT", "Vatican City"], ["VC", "VCT", "Saint Vincent and the Grenadines"],
  ["VE", "VEN", "Venezuela"], ["VG", "VGB", "British Virgin Islands"],
  ["VN", "VNM", "Vietnam"], ["VU", "VUT", "Vanuatu"],
  ["WS", "WSM", "Samoa"], ["YE", "YEM", "Yemen"], ["ZA", "ZAF", "South Africa"],
  ["ZM", "ZMB", "Zambia"], ["ZW", "ZWE", "Zimbabwe"],
];

export default function CountryCodes() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      search.trim()
        ? COUNTRIES.filter(
            ([a2, a3, name]) =>
              a2.toLowerCase().includes(search.toLowerCase()) ||
              a3.toLowerCase().includes(search.toLowerCase()) ||
              name.toLowerCase().includes(search.toLowerCase())
          )
        : COUNTRIES,
    [search]
  );

  return (
    <Form>
      <Form.TextField
        id="search"
        title="Search"
        placeholder="Country name, code…"
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
