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

      <div className="video-container">
        <iframe
          src={country.video}
          title={`Vídeo sobre ${country.name}`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
