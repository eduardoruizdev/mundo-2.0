import { countriesInfo } from "../data/countries";
import "../styles/CountryCard.css";

type Props = {
  iso: string | null;
  onClose: () => void;
};

export default function CountryCard({ iso, onClose }: Props) {
  if (!iso) return null;

  const country = countriesInfo[iso as keyof typeof countriesInfo];

  if (!country) return null;

  return (
    <div className="country-card">
      <button className="close-country" onClick={onClose}>
        ✕
      </button>

      <img
        className="country-flag"
        src={`https://flagcdn.com/w320/${iso.slice(0, 2).toLowerCase()}.png`}
        alt={country.name}
      />

      <h2>{country.name}</h2>

      <p className="description">{country.description}</p>

      <div className="info-grid">
        <div>
          <span>Capital</span>
          <strong>{country.capital}</strong>
        </div>

        <div>
          <span>Continente</span>
          <strong>{country.continent}</strong>
        </div>

        <div>
          <span>População</span>
          <strong>{country.population}</strong>
        </div>

        <div>
          <span>Moeda</span>
          <strong>{country.currency}</strong>
        </div>

        <div>
          <span>Idioma</span>
          <strong>{country.language}</strong>
        </div>
      </div>

      <div className="video-container">
        <iframe
          src={country.video}
          title={country.name}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
