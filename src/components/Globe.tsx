import Globe from "react-globe.gl";

import { useEffect, useRef, useState } from "react";

import { MeshBasicMaterial, TextureLoader, DoubleSide, Texture } from "three";

import * as THREE from "three";

import CountryLabel from "./CountryLabel";
import CountryCard from "./CountryCard";

import "../styles/globe.css";

import { getCountryPlacement } from "../utils/geoPlacement";
import { getIso2 } from "../utils/flags";

/* =========================================================
   TIPOS
   ========================================================= */

type CountryPolygon = {
  properties: Record<string, any>;
  geometry: any;
};

/* =========================================================
   TEXTURAS
   ========================================================= */

const textureLoader = new TextureLoader();

const flagTextures = new Map<string, Texture>();

const flagMaterials = new Map<string, MeshBasicMaterial>();

/* =========================================================
   CARREGAR BANDEIRA
   ========================================================= */

function getFlagTexture(iso2: string) {
  const iso = iso2.toLowerCase();

  const cached = flagTextures.get(iso);

  if (cached) {
    return cached;
  }

  const texture = textureLoader.load(`https://flagcdn.com/w640/${iso}.png`);

  texture.generateMipmaps = true;

  texture.minFilter = THREE.LinearMipmapLinearFilter;

  texture.magFilter = THREE.LinearFilter;

  texture.colorSpace = THREE.SRGBColorSpace;

  flagTextures.set(iso, texture);

  return texture;
}

/* =========================================================
   MATERIAL DA BANDEIRA
   ========================================================= */

function getFlagMaterial(iso2: string, hovered: boolean) {
  const iso = iso2.toLowerCase();

  let material = flagMaterials.get(iso);

  if (!material) {
    material = new MeshBasicMaterial({
      map: getFlagTexture(iso),

      transparent: true,

      opacity: 0.94,

      side: DoubleSide,

      depthWrite: true,

      toneMapped: false,
    });

    flagMaterials.set(iso, material);
  }

  material.opacity = hovered ? 1 : 0.94;

  return material;
}

/* =========================================================
   NOME DO PAÍS
   ========================================================= */

function getCountryName(country: CountryPolygon) {
  const p = country.properties;

  return (
    p.ADMIN ||
    p.admin ||
    p.NAME ||
    p.name ||
    p.NAME_LONG ||
    p.name_long ||
    p.SOVEREIGNT ||
    "País"
  );
}

/* =========================================================
   ISO DO PAÍS
   ========================================================= */

function getISO(country: CountryPolygon) {
  const p = country.properties;

  return p.ISO_A3 || p.iso_a3 || p.ADM0_A3 || p.adm0_a3 || p.ISO3 || null;
}

/* =========================================================
   COMPONENTE
   ========================================================= */

export default function GlobeComponent() {
  const globeRef = useRef<any>(null);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const [countries, setCountries] = useState<CountryPolygon[]>([]);

  const [hoverCountry, setHoverCountry] = useState<CountryPolygon | null>(null);

  const [selectedCountry, setSelectedCountry] = useState<CountryPolygon | null>(
    null,
  );

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  /* =======================================================
     CARREGAR GEOJSON
     ======================================================= */

  useEffect(() => {
    let cancelled = false;

    fetch("/countries.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Não foi possível carregar countries.geojson");
        }

        return response.json();
      })

      .then((data) => {
        if (cancelled) return;

        setCountries(Array.isArray(data?.features) ? data.features : []);
      })

      .catch((error) => {
        console.error("Erro ao carregar GeoJSON:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     RESPONSIVIDADE
     ======================================================= */

  useEffect(() => {
    let timeout: number | undefined;

    const handleResize = () => {
      window.clearTimeout(timeout);

      timeout = window.setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      window.clearTimeout(timeout);
    };
  }, []);

  /* =======================================================
     CONFIGURAÇÃO DO GLOBO
     ======================================================= */

  useEffect(() => {
    if (!globeRef.current) {
      return;
    }

    const globe = globeRef.current;

    /* -----------------------------------------------------
       CONTROLES
       ----------------------------------------------------- */

    const controls = globe.controls();

    controls.autoRotate = true;

    controls.autoRotateSpeed = 0.16;

    controls.enableDamping = true;

    controls.dampingFactor = 0.06;

    controls.enablePan = false;

    controls.minDistance = 120;

    controls.maxDistance = 500;

    /* -----------------------------------------------------
       POSIÇÃO INICIAL
       ----------------------------------------------------- */

    globe.pointOfView(
      {
        lat: 18,
        lng: -25,
        altitude: 2.15,
      },
      0,
    );

    /* -----------------------------------------------------
       RENDERER
       ----------------------------------------------------- */

    const renderer = globe.renderer();

    rendererRef.current = renderer;

    /*
      1.5 é proposital.

      2.0 ou 3.0 aumenta bastante
      o número de pixels que a GPU
      precisa renderizar.
    */

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.1;

    /*
      Sombras desligadas.

      O globo não precisa delas porque
      as bandeiras usam MeshBasicMaterial.
    */

    renderer.shadowMap.enabled = false;

    /* -----------------------------------------------------
       ANISOTROPIA
       ----------------------------------------------------- */

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    flagTextures.forEach((texture) => {
      texture.anisotropy = Math.min(maxAnisotropy, 4);
    });

    /* -----------------------------------------------------
       SCENE
       ----------------------------------------------------- */

    const scene = globe.scene();

    /* -----------------------------------------------------
       ILUMINAÇÃO
       ----------------------------------------------------- */

    const ambient = new THREE.AmbientLight(0xffffff, 1.4);

    scene.add(ambient);

    /* -----------------------------------------------------
       HALO DO PLANETA
       ----------------------------------------------------- */

    const haloGeometry = new THREE.SphereGeometry(101, 32, 32);

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: "#2563EB",

      transparent: true,

      opacity: 0.055,

      side: THREE.BackSide,

      depthWrite: false,
    });

    const halo = new THREE.Mesh(haloGeometry, haloMaterial);

    halo.scale.multiplyScalar(1.07);

    scene.add(halo);

    /* -----------------------------------------------------
       LIMPEZA
       ----------------------------------------------------- */

    return () => {
      scene.remove(ambient);

      scene.remove(halo);

      haloGeometry.dispose();

      haloMaterial.dispose();

      rendererRef.current = null;
    };
  }, []);

  /* =======================================================
     GARANTIR ANISOTROPIA NAS NOVAS TEXTURAS
     ======================================================= */

  useEffect(() => {
    const renderer = rendererRef.current;

    if (!renderer) {
      return;
    }

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    flagTextures.forEach((texture) => {
      texture.anisotropy = Math.min(maxAnisotropy, 4);
    });
  }, [countries, hoverCountry]);

  /* =======================================================
     IR PARA O PAÍS
     ======================================================= */

  function flyToCountry(country: CountryPolygon) {
    if (!globeRef.current) {
      return;
    }

    const placement = getCountryPlacement(country.geometry);

    if (!placement) {
      return;
    }

    globeRef.current.controls().autoRotate = false;

    globeRef.current.pointOfView(
      {
        lat: placement.lat,

        lng: placement.lng,

        altitude: 0.55,
      },

      1800,
    );

    setSelectedCountry(country);
  }

  /* =======================================================
     FECHAR PAÍS
     ======================================================= */

  function closeCountry() {
    setSelectedCountry(null);

    if (!globeRef.current) {
      return;
    }

    globeRef.current.controls().autoRotate = true;

    globeRef.current.pointOfView(
      {
        lat: 18,

        lng: -25,

        altitude: 2.15,
      },

      1600,
    );
  }

  /* =======================================================
     NOME DO HOVER
     ======================================================= */

  const countryName = hoverCountry ? getCountryName(hoverCountry) : null;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="globe-container">
      {/* =================================================
          PLANETAS DECORATIVOS
          ================================================= */}

      <div className="decorative-planets" aria-hidden="true">
        {/* MARTE */}

        <img
          className="decorative-planet planet-mars"
          src="/planets/mars.png"
          alt=""
          draggable="false"
        />

        {/* JÚPITER */}

        <img
          className="decorative-planet planet-jupiter"
          src="/planets/jupiter.png"
          alt=""
          draggable="false"
        />

        {/* SATURNO */}

        <img
          className="decorative-planet planet-saturn"
          src="/planets/saturn.png"
          alt=""
          draggable="false"
        />

        {/* NETUNO */}

        <img
          className="decorative-planet planet-neptune"
          src="/planets/neptune.png"
          alt=""
          draggable="false"
        />
      </div>

      {/* =================================================
          TÍTULO
          ================================================= */}

      <div className="app-title">
        <h1>🌍 Mundo </h1>

        <p>Atlas Mundial Interativo</p>
      </div>

      {/* =================================================
          LABEL
          ================================================= */}

      <CountryLabel country={countryName} />

      {/* =================================================
          CARD
          ================================================= */}

      <CountryCard
        iso={selectedCountry ? getISO(selectedCountry) : null}
        onClose={closeCountry}
      />

      {/* =================================================
          GLOBO
          ================================================= */}

      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        /* -----------------------------------------------
           TEXTURA DA TERRA
           ----------------------------------------------- */

        globeImageUrl={
          "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        }
        /* -----------------------------------------------
           RELEVO
           ----------------------------------------------- */

        bumpImageUrl={
          "https://unpkg.com/three-globe/example/img/earth-topology.png"
        }
        /* -----------------------------------------------
           ATMOSFERA
           ----------------------------------------------- */

        showAtmosphere={true}
        atmosphereColor="#60A5FA"
        atmosphereAltitude={0.16}
        /* -----------------------------------------------
           PAÍSES
           ----------------------------------------------- */

        polygonsData={countries}
        /* -----------------------------------------------
           BANDEIRAS
           ----------------------------------------------- */

        polygonCapMaterial={(obj: object) => {
          const country = obj as CountryPolygon;

          const iso2 =
            getIso2(country.properties) ||
            country.properties.iso_a2 ||
            country.properties.ISO_A2 ||
            country.properties.postal;

          if (!iso2) {
            return new MeshBasicMaterial({
              color: "#0f172a",

              transparent: true,

              opacity: 0.4,

              side: DoubleSide,

              depthWrite: true,
            });
          }

          return getFlagMaterial(iso2, country === hoverCountry);
        }}
        /* -----------------------------------------------
           BORDA
           ----------------------------------------------- */

        polygonStrokeColor={() => "#CBD5E1"}
        /* -----------------------------------------------
           ALTURA
           ----------------------------------------------- */

        polygonAltitude={(obj: object) => {
          const country = obj as CountryPolygon;

          return country === hoverCountry ? 0.018 : 0.006;
        }}
        /* -----------------------------------------------
           LATERAL
           ----------------------------------------------- */

        polygonSideColor={(obj: object) => {
          const country = obj as CountryPolygon;

          return country === hoverCountry
            ? "rgba(59,130,246,.45)"
            : "rgba(15,23,42,.55)";
        }}
        /* -----------------------------------------------
           RESOLUÇÃO
           ----------------------------------------------- */

        polygonCapCurvatureResolution={2}
        /* -----------------------------------------------
           TRANSIÇÃO
           ----------------------------------------------- */

        polygonsTransitionDuration={180}
        /* -----------------------------------------------
           TOOLTIP
           ----------------------------------------------- */

        polygonLabel={(obj: object) => {
          const country = obj as CountryPolygon;

          const p = country.properties;

          const name = p.ADMIN || p.NAME || p.NAME_LONG || "País";

          const continent =
            p.CONTINENT || p.REGION_UN || p.REGION_WB || "Continente";

          return `
              <div class="globe-tooltip">

                <strong>
                  ${name}
                </strong>

                <span>
                  🌍 ${continent}
                </span>

              </div>
            `;
        }}
        /* -----------------------------------------------
           HOVER
           ----------------------------------------------- */

        onPolygonHover={(obj) => {
          setHoverCountry(obj as CountryPolygon | null);
        }}
        /* -----------------------------------------------
           CLICK
           ----------------------------------------------- */

        onPolygonClick={(obj) => {
          flyToCountry(obj as CountryPolygon);
        }}
      />
    </div>
  );
}
