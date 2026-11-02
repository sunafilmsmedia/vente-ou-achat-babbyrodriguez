"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { BRAND } from "@/lib/brand";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });

// Centre de la carte décorative du hero (configuré par déploiement).
const MAP_CENTER: [number, number] = BRAND.map.center;

// La carte est montée dans un conteneur en fondu (absolute) : Leaflet calcule
// sa taille avant que le conteneur ait ses dimensions finales et affiche des
// tuiles pour un viewport de taille 0. On force le recalcul après le montage.
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timers = [80, 300, 700].map((d) => setTimeout(() => map.invalidateSize(), d));
    return () => timers.forEach(clearTimeout);
  }, [map]);
  return null;
}

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="map-mono map-no-interaction absolute inset-0">
        <MapContainer
          center={MAP_CENTER}
          zoom={BRAND.map.zoom}
          zoomControl={false}
          attributionControl={true}
          dragging={false}
          touchZoom={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          boxZoom={false}
          keyboard={false}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
          />
          <MapResizer />
        </MapContainer>
      </div>

      {/* Voile gris clair : la carte reste perceptible, le titre (noir) parfaitement lisible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 32%, rgba(236,236,234,0.45) 0%, rgba(226,226,224,0.65) 40%, rgba(208,208,206,0.92) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(226,226,224,0.7) 0%, rgba(240,240,238,0.3) 22%, rgba(232,232,230,0.4) 70%, rgba(205,205,203,0.95) 100%)",
        }}
      />
    </div>
  );
}
