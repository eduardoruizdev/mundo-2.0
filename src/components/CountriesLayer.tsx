import { useLoader } from "@react-three/fiber";
import { FileLoader } from "three";
import { useMemo } from "react";

export default function CountriesLayer() {
  const geoJsonText = useLoader(FileLoader, "/src/data/countries.geojson");

  const countries = useMemo(() => {
    return JSON.parse(geoJsonText as string);
  }, [geoJsonText]);

  console.log(countries);

  return null;
}
