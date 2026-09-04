// Mapa completo ISO 3166-1 alpha-3 -> alpha-2.
// Necessário porque o campo ISO_A2 do Natural Earth (usado no GeoJSON)
// vem como "-99" (inválido) para dezenas de países, e o slice(0,2) do
// alpha-3 só acerta por coincidência (ex: "SWE" -> "SW" está ERRADO,
// o correto é "SE"). Esse mapa resolve isso de forma correta e completa.
export const ISO3_TO_ISO2: Record<string, string> = {
  AFG: "AF", ALB: "AL", DZA: "DZ", ASM: "AS", AND: "AD", AGO: "AO",
  AIA: "AI", ATA: "AQ", ATG: "AG", ARG: "AR", ARM: "AM", ABW: "AW",
  AUS: "AU", AUT: "AT", AZE: "AZ", BHS: "BS", BHR: "BH", BGD: "BD",
  BRB: "BB", BLR: "BY", BEL: "BE", BLZ: "BZ", BEN: "BJ", BMU: "BM",
  BTN: "BT", BOL: "BO", BIH: "BA", BWA: "BW", BVT: "BV", BRA: "BR",
  IOT: "IO", BRN: "BN", BGR: "BG", BFA: "BF", BDI: "BI", KHM: "KH",
  CMR: "CM", CAN: "CA", CPV: "CV", CYM: "KY", CAF: "CF", TCD: "TD",
  CHL: "CL", CHN: "CN", CXR: "CX", CCK: "CC", COL: "CO", COM: "KM",
  COG: "CG", COD: "CD", COK: "CK", CRI: "CR", CIV: "CI", HRV: "HR",
  CUB: "CU", CYP: "CY", CZE: "CZ", DNK: "DK", DJI: "DJ", DMA: "DM",
  DOM: "DO", ECU: "EC", EGY: "EG", SLV: "SV", GNQ: "GQ", ERI: "ER",
  EST: "EE", ETH: "ET", FLK: "FK", FRO: "FO", FJI: "FJ", FIN: "FI",
  FRA: "FR", GUF: "GF", PYF: "PF", ATF: "TF", GAB: "GA", GMB: "GM",
  GEO: "GE", DEU: "DE", GHA: "GH", GIB: "GI", GRC: "GR", GRL: "GL",
  GRD: "GD", GLP: "GP", GUM: "GU", GTM: "GT", GGY: "GG", GIN: "GN",
  GNB: "GW", GUY: "GY", HTI: "HT", HMD: "HM", VAT: "VA", HND: "HN",
  HKG: "HK", HUN: "HU", ISL: "IS", IND: "IN", IDN: "ID", IRN: "IR",
  IRQ: "IQ", IRL: "IE", IMN: "IM", ISR: "IL", ITA: "IT", JAM: "JM",
  JPN: "JP", JEY: "JE", JOR: "JO", KAZ: "KZ", KEN: "KE", KIR: "KI",
  PRK: "KP", KOR: "KR", KWT: "KW", KGZ: "KG", LAO: "LA", LVA: "LV",
  LBN: "LB", LSO: "LS", LBR: "LR", LBY: "LY", LIE: "LI", LTU: "LT",
  LUX: "LU", MAC: "MO", MKD: "MK", MDG: "MG", MWI: "MW", MYS: "MY",
  MDV: "MV", MLI: "ML", MLT: "MT", MHL: "MH", MTQ: "MQ", MRT: "MR",
  MUS: "MU", MYT: "YT", MEX: "MX", FSM: "FM", MDA: "MD", MCO: "MC",
  MNG: "MN", MNE: "ME", MSR: "MS", MAR: "MA", MOZ: "MZ", MMR: "MM",
  NAM: "NA", NRU: "NR", NPL: "NP", NLD: "NL", NCL: "NC", NZL: "NZ",
  NIC: "NI", NER: "NE", NGA: "NG", NIU: "NU", NFK: "NF", MNP: "MP",
  NOR: "NO", OMN: "OM", PAK: "PK", PLW: "PW", PSE: "PS", PAN: "PA",
  PNG: "PG", PRY: "PY", PER: "PE", PHL: "PH", PCN: "PN", POL: "PL",
  PRT: "PT", PRI: "PR", QAT: "QA", REU: "RE", ROU: "RO", RUS: "RU",
  RWA: "RW", SHN: "SH", KNA: "KN", LCA: "LC", SPM: "PM", VCT: "VC",
  WSM: "WS", SMR: "SM", STP: "ST", SAU: "SA", SEN: "SN", SRB: "RS",
  SYC: "SC", SLE: "SL", SGP: "SG", SVK: "SK", SVN: "SI", SLB: "SB",
  SOM: "SO", ZAF: "ZA", SGS: "GS", SSD: "SS", ESP: "ES", LKA: "LK",
  SDN: "SD", SUR: "SR", SJM: "SJ", SWZ: "SZ", SWE: "SE", CHE: "CH",
  SYR: "SY", TWN: "TW", TJK: "TJ", TZA: "TZ", THA: "TH", TLS: "TL",
  TGO: "TG", TKL: "TK", TON: "TO", TTO: "TT", TUN: "TN", TUR: "TR",
  TKM: "TM", TCA: "TC", TUV: "TV", UGA: "UG", UKR: "UA", ARE: "AE",
  GBR: "GB", USA: "US", UMI: "UM", URY: "UY", UZB: "UZ", VUT: "VU",
  VEN: "VE", VNM: "VN", VGB: "VG", VIR: "VI", WLF: "WF", ESH: "EH",
  YEM: "YE", ZMB: "ZM", ZWE: "ZW", ALA: "AX", XKX: "XK",
};

/**
 * Extrai o código ISO alpha-2 correto a partir das properties de um país
 * do GeoJSON, tentando primeiro os campos alpha-2 diretos (quando válidos)
 * e, se não houver, convertendo o alpha-3 através do mapa ISO3_TO_ISO2.
 */
export function getIso2(properties: Record<string, any>): string | null {
  const isValid = (v: any) =>
    typeof v === "string" && v.length === 2 && v !== "-9" && v !== "-99";

  const direct =
    properties.ISO_A2_EH ||
    properties.ISO_A2 ||
    properties.iso_a2 ||
    properties.ISO2 ||
    properties.WB_A2;

  if (isValid(direct)) return direct.toUpperCase();

  const a3 =
    properties.ISO_A3_EH ||
    properties.ISO_A3 ||
    properties.iso_a3 ||
    properties.ADM0_A3 ||
    properties.SU_A3 ||
    properties.BRK_A3;

  if (typeof a3 === "string" && ISO3_TO_ISO2[a3.toUpperCase()]) {
    return ISO3_TO_ISO2[a3.toUpperCase()];
  }

  return null;
}

export function getFlagUrl(properties: Record<string, any>) {
  const iso = getIso2(properties);

  if (!iso) return null;

  return `https://flagcdn.com/w320/${iso.toLowerCase()}.png`;
}
