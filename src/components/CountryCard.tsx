import { countriesInfo } from "../data/countries";
import "../styles/CountryCard.css";

type Props = {
  iso: string | null;
  onClose: () => void;
};

// Códigos das bandeiras (FlagCDN usa 2 letras)
const flagCodes: Record<string, string> = {
  BRA: "br",
  ARG: "ar",
  USA: "us",
  RUS: "ru",
  CHN: "cn", // China
  TWN: "tw", // Taiwan
};

export default function CountryCard({ iso, onClose }: Props) {
  if (!iso) return null;

  const country = countriesInfo[iso as keyof typeof countriesInfo];

  if (!country) return null;

  // Usa o código da bandeira, e caso não exista, pega as duas primeiras letras do ISO.
  const flagCode = flagCodes[iso] || iso.slice(0, 2).toLowerCase();

  return (
    <div className="country-card">
      <button className="close-country" onClick={onClose}>
        ✕
      </button>

      <img
        className="country-flag"
        src={`https://flagcdn.com/w320/${flagCode}.png`}
        alt={country.name}
      />

      <h2>{country.name}</h2>

      {/* Vídeo (Brasil, Rússia, EUA, etc.) */}
      {"video" in country && country.video && (
        <div className="video-container">
          <iframe
            src={country.video}
            title={`Vídeo sobre ${country.name}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* PDF (China e Taiwan) */}
      {"pdf" in country && country.pdf && (
        <>
          <a
            href={country.pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="open-pdf-button"
          >
            📄 Abrir documento em nova aba
          </a>

          <div className="pdf-container">
            <iframe
              src={country.pdf}
              title={`Documento sobre ${country.name}`}
            />
          </div>
        </>
      )}
    </div>
  );
}
