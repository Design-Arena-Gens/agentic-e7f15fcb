"use client";

import { useEffect, useRef } from 'react';
import L, { Map as LeafletMap, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import countries from '../data/countries.json';
import { useMapActions } from './MapActionsContext';

// Fix default icon paths for Leaflet in bundlers
// @ts-ignore - leaflet internal
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function Map() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const { register, lastCommand } = useMapActions();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      worldCopyJump: true,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Initial markers for sample countries
    for (const c of countries) {
      const key = `country:${c.name.toLowerCase()}`;
      const marker = L.marker([c.lat, c.lng]).addTo(map);
      marker.bindPopup(`<b>${c.name}</b><br/>Capital: ${c.capital}<br/>Population: ${c.population.toLocaleString()}`);
      markersRef.current[key] = marker;
    }

    // Expose map actions
    register({
      flyTo(lat: number, lng: number, label?: string) {
        map.flyTo([lat, lng], Math.max(map.getZoom(), 5), { duration: 0.75 });
        if (label) {
          const temp = L.popup({ autoClose: true, closeButton: false })
            .setLatLng([lat, lng])
            .setContent(`<div style=\"font-weight:600\">${label}</div>`)
            .openOn(map);
          setTimeout(() => map.closePopup(temp), 2000);
        }
      },
      focusCountryByName(name: string) {
        const c = countries.find(
          (x) => x.name.toLowerCase() === name.toLowerCase()
        );
        if (!c) return false;
        map.flyTo([c.lat, c.lng], 6, { duration: 0.8 });
        const key = `country:${c.name.toLowerCase()}`;
        const m = markersRef.current[key];
        if (m) m.openPopup();
        return true;
      },
      highlightCapitalByName(capital: string) {
        const c = countries.find(
          (x) => x.capital.toLowerCase() === capital.toLowerCase()
        );
        if (!c) return false;
        map.flyTo([c.lat, c.lng], 7, { duration: 0.8 });
        const popup = L.popup()
          .setLatLng([c.lat, c.lng])
          .setContent(`<b>${c.capital}</b> ? capital of ${c.name}`)
          .openOn(map);
        setTimeout(() => map.closePopup(popup), 3000);
        return true;
      },
    });
  }, [register]);

  // React to last command with optional pan
  useEffect(() => {
    if (!lastCommand || !mapRef.current) return;
    if (lastCommand.type === 'pan') {
      mapRef.current.flyTo([lastCommand.lat, lastCommand.lng], 6, { duration: 0.8 });
    }
  }, [lastCommand]);

  return <div ref={containerRef} className="w-full h-full" aria-label="World map" />;
}
