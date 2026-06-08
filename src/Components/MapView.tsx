import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import type { Hospital } from "../lib/hospitals";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

type MapViewProps = {
  hospitals: Hospital[];
  selectedId: string | null;
  onSelectHospital: (id: string) => void;
};

function MapView({ hospitals, selectedId, onSelectHospital }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);

  const map = useRef<mapboxgl.Map | null>(null);

  const markers = useRef<{ [id: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [3.3792, 6.5244],
      zoom: 11,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
  }, []);

  useEffect(() => {
    if (!map.current) return;

    Object.values(markers.current).forEach((marker) => marker.remove());
    markers.current = {};

    const hospitalsWithCoords = hospitals.filter(
      (h) => h.latitude && h.longitude,
    );

    if (hospitalsWithCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      hospitalsWithCoords.forEach((h) => {
        bounds.extend([h.longitude!, h.latitude!]);
      });
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    }

    hospitals.forEach((hospital) => {
      if (!hospital.latitude || !hospital.longitude) return;

      const el = document.createElement("div");
      el.style.cssText = `
        width: 28px;
        height: 28px;
        background: #0F6E56;
        border: 2.5px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        transition: transform 0.15s, background 0.15s;
      `;

      const popup = new mapboxgl.Popup({
        offset: 20,
        closeButton: false,
        className: "hospital-popup",
      }).setHTML(`
        <div style="font-family:Inter,sans-serif;padding:4px 2px;">
          <p style="font-size:13px;font-weight:500;color:#1A1A18;margin:0 0 2px;">
            ${hospital.name}
          </p>
          <p style="font-size:11px;color:#888780;margin:0;">
            ${hospital.city} · ${hospital.ownership_type}
          </p>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([hospital.longitude, hospital.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener("click", () => {
        onSelectHospital(hospital.id);

        const card = document.getElementById(`hospital-card-${hospital.id}`);
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });

      markers.current[hospital.id] = marker;
    });
  }, [hospitals]);

  useEffect(() => {
    Object.entries(markers.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      if (id === selectedId) {
        el.style.background = "#085041";
        el.style.transform = "rotate(-45deg) scale(1.4)";
        el.style.zIndex = "10";
        marker.getPopup()?.addTo(map.current!);
      } else {
        el.style.background = "#0F6E56";
        el.style.transform = "rotate(-45deg) scale(1)";
        el.style.zIndex = "1";
        marker.getPopup()?.remove();
      }
    });
  }, [selectedId]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
}

export default MapView;
