import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Bed, ShieldCheck, ArrowRight, Activity, Phone } from 'lucide-react';
import { TierBadge } from './StatusBadge';
import { useLanguage } from '../context/LanguageContext';

// Fix Leaflet default icon paths in React Vite bundle
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored SVG pin generator for tiers
const createCustomIcon = (tier) => {
  let color = '#2563EB'; // default blue
  if (tier === 'Specialized Hospital') color = '#9333EA'; // purple
  else if (tier === 'District Hospital') color = '#4F46E5'; // indigo
  else if (tier === 'Rural Hospital') color = '#0284C7'; // sky
  else if (tier === 'PHC') color = '#0D9488'; // teal
  else if (tier === 'Sub-Centre') color = '#D97706'; // amber

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="36">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="#ffffff"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-marker',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -32],
  });
};

function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 12, { animate: true });
    }
  }, [coords, map]);
  return null;
}

const FacilityMapView = ({ facilities = [], onSelectFacility, initialCenter = [26.8500, 80.9500] }) => {
  const { t } = useLanguage();
  const [center, setCenter] = useState(initialCenter);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setCenter(coords);
        setUserLocation(coords);
        setLocating(false);
      },
      () => {
        // Fallback demo location (Mohanlalganj PHC)
        const demoCoords = [26.7900, 80.9800];
        setCenter(demoCoords);
        setUserLocation(demoCoords);
        setLocating(false);
      }
    );
  };

  return (
    <div className="card rounded-3xl p-4 overflow-hidden border border-slate-200 relative shadow-md">
      {/* Map Control Bar */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy">Interactive Healthcare Facility Network Map</h3>
            <p className="text-[11px] text-slate-500">
              Showing active public health facilities, primary centers, and district hospitals
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-sm font-bold"
        >
          <Navigation className={`w-3.5 h-3.5 text-primary ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Locating...' : 'Find Facilities Near Me'}</span>
        </button>
      </div>

      {/* Leaflet Container */}
      <div className="h-[420px] rounded-2xl overflow-hidden border border-slate-200 relative z-0">
        <MapContainer
          center={center}
          zoom={11}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeMapView coords={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User location pin if detected */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={L.divIcon({
                html: `<div class="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg animate-ping"></div>`,
                className: 'user-pin',
                iconSize: [16, 16],
              })}
            >
              <Popup>
                <div className="text-xs font-bold text-navy">Your Current Location</div>
              </Popup>
            </Marker>
          )}

          {/* Facilities markers */}
          {facilities.map((item, idx) => {
            const h = item.hospital || item;
            const coords = h.location?.coordinates;
            if (!coords || coords.length < 2) return null;
            const [lng, lat] = coords;
            const fType = h.facilityType || h.hospitalType || 'Multispeciality Hospital';
            const icuAvail = h.beds?.icu?.available ?? 0;
            const genAvail = h.beds?.general?.available ?? 0;

            return (
              <Marker
                key={idx}
                position={[lat, lng]}
                icon={createCustomIcon(fType)}
              >
                <Popup>
                  <div className="p-1 min-w-[200px]">
                    <div className="mb-1">
                      <TierBadge tier={fType} />
                    </div>
                    <div className="font-extrabold text-xs text-navy leading-tight mt-1">
                      {h.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {h.address}, {h.district || h.city}
                    </div>

                    <div className="my-2 py-1.5 border-y border-slate-100 grid grid-cols-2 gap-1 text-[11px]">
                      <div>
                        <span className="text-slate-400">ICU Beds: </span>
                        <span className={icuAvail > 0 ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                          {icuAvail} vacant
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Gen Beds: </span>
                        <span className="font-bold text-navy">{genAvail} vacant</span>
                      </div>
                    </div>

                    {item.distanceKm !== undefined && (
                      <div className="text-[11px] font-bold text-primary mb-2">
                        Distance: {item.distanceKm} km away
                      </div>
                    )}

                    {onSelectFacility && (
                      <button
                        type="button"
                        onClick={() => onSelectFacility(h)}
                        className="btn-primary text-[11px] px-3 py-1.5 w-full flex items-center justify-center gap-1 font-bold"
                      >
                        <span>Select for Referral</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-4 text-[11px] text-slate-600 flex-wrap">
        <span className="font-bold text-navy">Tiers:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Sub-Centre
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" /> PHC
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" /> Rural Hospital (CHC)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" /> District Hospital
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" /> Specialized Hospital
        </span>
      </div>
    </div>
  );
};

export default FacilityMapView;
