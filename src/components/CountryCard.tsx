import { countriesInfo } from "../data/countries";
import "../styles/CountryCard.css";

type Props = {
  iso: string | null;
  onClose: () => void;
};

// Códigos das bandeiras (FlagCDN usa 2 letras)
const flagCodes: Record<string, string> = {
  // África
  DZA: "dz",
  AGO: "ao",
  BEN: "bj",
  BWA: "bw",
  BFA: "bf",
  BDI: "bi",
  CMR: "cm",
  CPV: "cv",
  CAF: "cf",
  TCD: "td",
  COM: "km",
  COD: "cd",
  COG: "cg",
  CIV: "ci",
  DJI: "dj",
  EGY: "eg",
  GNQ: "gq",
  ERI: "er",
  SWZ: "sz",
  ETH: "et",
  GAB: "ga",
  GMB: "gm",
  GHA: "gh",
  GIN: "gn",
  GNB: "gw",
  KEN: "ke",
  LSO: "ls",
  LBR: "lr",
  LBY: "ly",
  MDG: "mg",
  MWI: "mw",
  MLI: "ml",
  MRT: "mr",
  MUS: "mu",
  MAR: "ma",
  MOZ: "mz",
  NAM: "na",
  NER: "ne",
  NGA: "ng",
  RWA: "rw",
  STP: "st",
  SEN: "sn",
  SYC: "sc",
  SLE: "sl",
  SOM: "so",
  ZAF: "za",
  SSD: "ss",
  SDN: "sd",
  TZA: "tz",
  TGO: "tg",
  TUN: "tn",
  UGA: "ug",
  ZMB: "zm",
  ZWE: "zw",

  // América do Norte e Caribe
  ATG: "ag",
  BHS: "bs",
  BRB: "bb",
  BLZ: "bz",
  CAN: "ca",
  CRI: "cr",
  CUB: "cu",
  DMA: "dm",
  DOM: "do",
  SLV: "sv",
  GRD: "gd",
  GTM: "gt",
  HTI: "ht",
  HND: "hn",
  JAM: "jm",
  MEX: "mx",
  NIC: "ni",
  PAN: "pa",
  KNA: "kn",
  LCA: "lc",
  VCT: "vc",
  TTO: "tt",
  USA: "us",

  // América do Sul
  ARG: "ar",
  BOL: "bo",
  BRA: "br",
  CHL: "cl",
  COL: "co",
  ECU: "ec",
  GUY: "gy",
  PRY: "py",
  PER: "pe",
  SUR: "sr",
  URY: "uy",
  VEN: "ve",

  // Europa
  ALB: "al",
  AND: "ad",
  AUT: "at",
  BEL: "be",
  BIH: "ba",
  BGR: "bg",
  HRV: "hr",
  CYP: "cy",
  CZE: "cz",
  DNK: "dk",
  EST: "ee",
  FIN: "fi",
  FRA: "fr",
  DEU: "de",
  GRC: "gr",
  HUN: "hu",
  ISL: "is",
  IRL: "ie",
  ITA: "it",
  LVA: "lv",
  LIE: "li",
  LTU: "lt",
  LUX: "lu",
  MLT: "mt",
  MDA: "md",
  MCO: "mc",
  MNE: "me",
  NLD: "nl",
  MKD: "mk",
  NOR: "no",
  POL: "pl",
  PRT: "pt",
  ROU: "ro",
  RUS: "ru",
  SMR: "sm",
  SRB: "rs",
  SVK: "sk",
  SVN: "si",
  ESP: "es",
  SWE: "se",
  CHE: "ch",
  UKR: "ua",
  GBR: "gb",
  VAT: "va",
  BLR: "by",

  // Ásia
  AFG: "af",
  ARM: "am",
  AZE: "az",
  BHR: "bh",
  BGD: "bd",
  BTN: "bt",
  BRN: "bn",
  KHM: "kh",
  CHN: "cn",
  TWN: "tw",
  GEO: "ge",
  IND: "in",
  IDN: "id",
  IRN: "ir",
  IRQ: "iq",
  ISR: "il",
  JPN: "jp",
  JOR: "jo",
  KAZ: "kz",
  KWT: "kw",
  KGZ: "kg",
  LAO: "la",
  LBN: "lb",
  MYS: "my",
  MDV: "mv",
  MNG: "mn",
  MMR: "mm",
  NPL: "np",
  PRK: "kp",
  KOR: "kr",
  OMN: "om",
  PAK: "pk",
  PHL: "ph",
  QAT: "qa",
  SAU: "sa",
  SGP: "sg",
  LKA: "lk",
  SYR: "sy",
  TJK: "tj",
  THA: "th",
  TLS: "tl",
  TUR: "tr",
  TKM: "tm",
  ARE: "ae",
  UZB: "uz",
  VNM: "vn",
  YEM: "ye",
  PSE: "ps",

  // Oceania
  AUS: "au",
  FJI: "fj",
  KIR: "ki",
  MHL: "mh",
  FSM: "fm",
  NRU: "nr",
  NZL: "nz",
  PLW: "pw",
  PNG: "pg",
  WSM: "ws",
  SLB: "sb",
  TON: "to",
  TUV: "tv",
  VUT: "vu",

  // Territórios mais comuns no mapa
  GRL: "gl",
  HKG: "hk",
  MAC: "mo",
  PRI: "pr",
  GUM: "gu",
  CUW: "cw",
  ABW: "aw",
  BES: "bq",
  FRO: "fo",
  NCL: "nc",
  PYF: "pf",
};

export default function CountryCard({ iso, onClose }: Props) {
  if (!iso) return null;

  const country = countriesInfo[iso as keyof typeof countriesInfo];

  // Nome do país (se não estiver no countries.ts usa o próprio ISO)
  const countryName = country?.name || iso;

  // Bandeira correta
  const flagCode = flagCodes[iso] || iso.slice(0, 2).toLowerCase();

  // Conteúdo (vídeo ou PDF)
  const video = country && "video" in country ? country.video : undefined;
  const pdf = country && "pdf" in country ? country.pdf : undefined;

  return (
    <div className="country-card">
      {/* Botão fechar */}
      <button className="close-country" onClick={onClose}>
        ✕
      </button>

      {/* Bandeira */}
      <img
        className="country-flag"
        src={`https://flagcdn.com/w320/${flagCode}.png`}
        alt={countryName}
      />

      {/* Nome do país */}
      <h2>{countryName}</h2>

      {/* Vídeo */}
      {video && (
        <div className="video-container">
          <iframe
            src={video}
            title={`Vídeo sobre ${countryName}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* PDF */}
      {pdf && (
        <>
          <a
            href={pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="open-pdf-button"
          >
            📄 Abrir documento em nova aba
          </a>

          <div className="pdf-container">
            <iframe src={pdf} title={`Documento sobre ${countryName}`} />
          </div>
        </>
      )}
    </div>
  );
}
