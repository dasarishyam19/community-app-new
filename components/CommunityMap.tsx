'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface CommunityMapProps {
  center: [number, number];
  zoom: number;
  communities: Array<{
    id: number;
    name: string;
    city: string;
    lat: number;
    lng: number;
    units: number;
  }>;
  selectedCommunity: any;
  onCommunitySelect: (community: any) => void;
  onMapClick: (e: any) => void;
}

// Component to handle map events
function MapClickHandler({ onMapClick }: { onMapClick: (e: any) => void }) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

export default function CommunityMap({
  center,
  zoom,
  communities,
  selectedCommunity,
  onCommunitySelect,
  onMapClick,
}: CommunityMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (map) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      ref={setMap}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onMapClick={onMapClick} />

      {communities.map((community) => (
        <Marker
          key={community.id}
          position={[community.lat, community.lng]}
          eventHandlers={{
            click: () => onCommunitySelect(community),
          }}
        >
          <Popup>
            <div className="text-center">
              <p className="font-semibold">{community.name}</p>
              <p className="text-xs text-gray-600">{community.city}</p>
              <p className="text-xs text-gray-500">{community.units} units</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {selectedCommunity && 'isCustom' in selectedCommunity && selectedCommunity.isCustom && (
        <Marker position={[selectedCommunity.lat, selectedCommunity.lng]}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold">{selectedCommunity.name}</p>
              <p className="text-xs text-gray-600">{selectedCommunity.city}</p>
              <p className="text-xs text-amber-600">Custom Location</p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
