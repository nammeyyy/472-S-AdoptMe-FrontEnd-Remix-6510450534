import React, { useEffect, useState, useRef } from "react";
import { Map, Marker, NavigationControl, Popup, useMap } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { EmergencyPlace } from "~/components/emergencyCard";    

interface MapLibreComponentProps {
  emergencyPlaces: EmergencyPlace[];
  width?: string | number;
  height?: number;
  onMarkerClick?: (place: EmergencyPlace) => void;
}

// ClientOnly wrapper to prevent SSR issues
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) {
    return <div className="h-64 bg-gray-100 flex items-center justify-center">Loading map...</div>;
  }
  
  //client-side rendering
  return <>{children}</>;
}

export default function MapLibreComponent({ 
  emergencyPlaces, 
  width = "100%", 
  height = 500,
  onMarkerClick
}: MapLibreComponentProps) {
  const [selectedPlace, setSelectedPlace] = useState<EmergencyPlace | null>(null);
  const mapRef = useRef(null);
  
  // Find center of the map based on emergency places
//   const [popupLocation, setPopupLocation] = useState(middleOfThailand);
  const map = useMap();
  const center = getCenterCoordinates(emergencyPlaces);
  
  // Type-specific marker colors
  const getMarkerColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'veterinary': return '#ef4444';
      case 'shelter': return '#3b82f6';
      case 'rescue': return '#22c55e';
      default: return '#f97316';
    }
  };

  const handleMarkerClick = (place: EmergencyPlace) => {
    setSelectedPlace(place);
    if (onMarkerClick) {
      onMarkerClick(place);
    }
  };

  return (
    <ClientOnly>
      <div className="w-full rounded-lg overflow-hidden shadow-md" style={{ height }}>
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: center.longitude,
            latitude: center.latitude,
            zoom: 11
          }}
          style={{ width, height }}
          mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        >
          <NavigationControl position="top-right" />
          
          {emergencyPlaces.map((place) => (
            <Marker
              key={place.id}
              longitude={place.longitude}
              latitude={place.latitude}
              color={getMarkerColor(place.type)}
              onClick={() => handleMarkerClick(place)}
            />
          ))}
          
          {selectedPlace && (
            <Popup
              longitude={selectedPlace.longitude}
              latitude={selectedPlace.latitude}
              anchor="bottom"
              offset={[0, -10]}
              onClose={() => setSelectedPlace(null)}
              closeOnClick={false}
              className="z-50"
            >
              <div className="p-2 max-w-xs">
                <div className="font-semibold mb-1">{selectedPlace.name}</div>
                <div className="text-xs text-gray-700 mb-1">
                  ข้อมูลที่ : {selectedPlace.id}<br />
                  เวลาที่เปิด : {selectedPlace.open_hours || "ไม่ระบุ"}<br />
                  หมวดหมู่ : {selectedPlace.type}<br />
                  {selectedPlace.contact && (
                    <>ช่องทางติดต่อ : {selectedPlace.contact}<br /></>
                  )}
                </div>
                <button 
                  className="bg-green-500 text-white text-xs py-1 px-3 rounded-full mt-1"
                  onClick={() => window.location.href = `/emergency/${selectedPlace.id}`}
                >
                  บริจาค
                </button>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </ClientOnly>
  );
}

// Helper function to calculate the center of all markers
function getCenterCoordinates(places: EmergencyPlace[]) {
  if (places.length === 0) {
    // Default to a central location if no places
    return { latitude: 13.7563, longitude: 100.5018 }; // Bangkok as default
  }
  
  const sum = places.reduce(
    (acc, place) => ({
      latitude: acc.latitude + place.latitude,
      longitude: acc.longitude + place.longitude
    }),
    { latitude: 0, longitude: 0 }
  );
  
  return {
    latitude: sum.latitude / places.length,
    longitude: sum.longitude / places.length
  };
}