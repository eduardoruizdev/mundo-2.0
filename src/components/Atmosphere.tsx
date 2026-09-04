import { Sphere } from "@react-three/drei";

export default function Atmosphere() {
  return (
    <Sphere args={[2.12, 64, 64]}>
      <meshStandardMaterial
        color="#38bdf8"
        transparent
        opacity={0.15}
        emissive="#38bdf8"
        emissiveIntensity={2}
        side={2}
      />
    </Sphere>
  );
}
