type Props = {
  country: string | null;
};

export default function CountryLabel({ country }: Props) {
  if (!country) return null;

  return <div className="country-label">🌍 {country}</div>;
}
