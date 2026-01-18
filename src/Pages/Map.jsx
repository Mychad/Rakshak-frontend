import React, { useEffect, useMemo, useState } from "react";
import { getAllCrimeLocation } from "../controllers/Map.controller";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import {
  MapPin,
  Loader2,
  Navigation,
  Layers,
  AlertTriangle,
  Shield,
  Info,
  TrendingUp,
  X,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* ---------- Static list of major Mumbai areas with accurate radii ---------- */
const STATIC_AREAS = [
  { name: "colaba", coords: [18.911, 72.814], count: 0, baseRadius: 1200 },
  { name: "churchgate", coords: [18.936, 72.828], count: 0, baseRadius: 800 },
  { name: "grant road", coords: [18.975, 72.825], count: 0, baseRadius: 900 },
  {
    name: "charni road",
    coords: [18.9586, 72.8126],
    count: 0,
    baseRadius: 700,
  },
  { name: "byculla", coords: [18.989, 72.844], count: 0, baseRadius: 1500 },
  { name: "mazgaon", coords: [18.956, 72.84], count: 0, baseRadius: 1100 },
  { name: "pydhonie", coords: [18.952, 72.833], count: 0, baseRadius: 600 },
  { name: "dongri", coords: [18.948, 72.83], count: 0, baseRadius: 800 },
  { name: "dadar", coords: [19.018, 72.845], count: 0, baseRadius: 2000 },
  { name: "parel", coords: [19.0, 72.824], count: 0, baseRadius: 1800 },
  { name: "lower parel", coords: [18.993, 72.811], count: 0, baseRadius: 1400 },
  { name: "worli", coords: [19.018, 72.812], count: 0, baseRadius: 1600 },
  { name: "prabhadevi", coords: [18.989, 72.807], count: 0, baseRadius: 1000 },
  { name: "mahim", coords: [19.036, 72.835], count: 0, baseRadius: 1300 },
  { name: "sion", coords: [19.017, 72.856], count: 0, baseRadius: 1700 },
  { name: "kurla", coords: [19.066, 72.873], count: 0, baseRadius: 3000 },
  { name: "chunabhatti", coords: [19.035, 72.863], count: 0, baseRadius: 1200 },
  { name: "wadala", coords: [19.012, 72.866], count: 0, baseRadius: 2200 },
  { name: "chembur", coords: [19.042, 72.9], count: 0, baseRadius: 2500 },
  { name: "govandi", coords: [19.036, 72.912], count: 0, baseRadius: 2000 },
  { name: "mankhurd", coords: [19.044, 72.955], count: 0, baseRadius: 2800 },
  { name: "bandra", coords: [19.059, 72.829], count: 0, baseRadius: 2200 },
  { name: "khar", coords: [19.056, 72.816], count: 0, baseRadius: 1400 },
  { name: "santacruz", coords: [19.064, 72.842], count: 0, baseRadius: 2000 },
  { name: "juhu", coords: [19.098, 72.826], count: 0, baseRadius: 1800 },
  { name: "vile parle", coords: [19.102, 72.834], count: 0, baseRadius: 1600 },
  { name: "andheri", coords: [19.1197, 72.8464], count: 0, baseRadius: 4000 },
  { name: "jogeshwari", coords: [19.133, 72.846], count: 0, baseRadius: 2200 },
  { name: "goregaon", coords: [19.146, 72.852], count: 0, baseRadius: 2800 },
  { name: "malad", coords: [19.1796, 72.8561], count: 0, baseRadius: 3200 },
  { name: "kandivali", coords: [19.205, 72.844], count: 0, baseRadius: 2600 },
  { name: "borivali", coords: [19.23, 72.846], count: 0, baseRadius: 3500 },
  { name: "dahisar", coords: [19.28, 72.85], count: 0, baseRadius: 2400 },
  { name: "ghatkopar", coords: [19.091, 72.882], count: 0, baseRadius: 2800 },
  { name: "vidyavihar", coords: [19.071, 72.899], count: 0, baseRadius: 1500 },
  { name: "vikhroli", coords: [19.089, 72.909], count: 0, baseRadius: 2200 },
  { name: "kanjurmarg", coords: [19.123, 72.913], count: 0, baseRadius: 2000 },
  { name: "bhandup", coords: [19.144, 72.918], count: 0, baseRadius: 2400 },
  { name: "mulund", coords: [19.167, 72.966], count: 0, baseRadius: 3000 },
  { name: "vashi", coords: [19.079, 72.998], count: 0, baseRadius: 2600 },
  { name: "nerul", coords: [19.035, 73.013], count: 0, baseRadius: 2800 },
  { name: "belapur", coords: [18.998, 73.028], count: 0, baseRadius: 3200 },
  { name: "sanpada", coords: [19.029, 72.997], count: 0, baseRadius: 1800 },
  {
    name: "kopar khairane",
    coords: [19.072, 73.019],
    count: 0,
    baseRadius: 2200,
  },
  { name: "airoli", coords: [19.148, 72.994], count: 0, baseRadius: 2400 },
  { name: "panvel", coords: [18.996, 73.116], count: 0, baseRadius: 4000 },
  { name: "thane", coords: [19.2183, 72.9781], count: 0, baseRadius: 5000 },
  { name: "kalwa", coords: [19.203, 72.975], count: 0, baseRadius: 2000 },
  { name: "mumbra", coords: [19.175, 72.956], count: 0, baseRadius: 2600 },
  { name: "diva", coords: [19.16, 72.904], count: 0, baseRadius: 1800 },
  { name: "bhiwandi", coords: [19.277, 73.008], count: 0, baseRadius: 3500 },
  { name: "vasai", coords: [19.3919, 72.8397], count: 0, baseRadius: 4500 },
  { name: "virar", coords: [19.4559, 72.8114], count: 0, baseRadius: 4000 },
  { name: "nallasopara", coords: [19.444, 72.787], count: 0, baseRadius: 3000 },
  { name: "palghar", coords: [19.695, 72.771], count: 0, baseRadius: 3800 },
];

/* ---------- Helpers ---------- */
const SEVERITY_COLORS = {
  safe: "#10b981",
  low: "#fbbf24",
  medium: "#f59e0b",
  high: "#f97316",
  veryHigh: "#ef4444",
};

// Compute radius based on base area size + crime intensity
const computeRadius = (baseRadius, count, maxCount) => {
  if (maxCount === 0) return baseRadius;
  const intensityFactor = 1 + (count / maxCount) * 0.4; // Max 40% increase
  return Math.round(baseRadius * intensityFactor);
};

function getSeverityDynamic(count, thresholds) {
  if (!thresholds) {
    return { key: "safe", label: "Safe", color: SEVERITY_COLORS.safe };
  }

  const { min = 0, max = 0, lowThreshold = 0, highThreshold = 0 } = thresholds;

  if (max === min) {
    if (max === 0)
      return { key: "safe", label: "Safe", color: SEVERITY_COLORS.safe };
    return { key: "medium", label: "Medium", color: SEVERITY_COLORS.medium };
  }

  if (count > highThreshold) {
    const span = max - highThreshold;
    if (span > 0 && count >= highThreshold + Math.max(1, span * 0.6)) {
      return {
        key: "veryHigh",
        label: "Very High",
        color: SEVERITY_COLORS.veryHigh,
      };
    }
    return { key: "high", label: "High", color: SEVERITY_COLORS.high };
  }

  if (count > lowThreshold) {
    return { key: "medium", label: "Medium", color: SEVERITY_COLORS.medium };
  }

  if (count > 0) {
    return { key: "low", label: "Low", color: SEVERITY_COLORS.low };
  }

  return { key: "safe", label: "Safe", color: SEVERITY_COLORS.safe };
}

// Map bounds adjuster and controller
function MapController({ areas, thresholds, center, onMapReady }) {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useEffect(() => {
    if (areas.length > 0 && thresholds) {
      const bounds = areas.map((a) => a.coords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [areas, thresholds, map]);

  return null;
}

// Recenter button component
function RecenterButton({ center }) {
  const map = useMap();

  return (
    <button
      onClick={() => map.setView(center, 11, { animate: true })}
      className="absolute bottom-24 right-4 z-[1000] bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl shadow-2xl transition-all hover:scale-110 border border-slate-600"
      title="Recenter Map"
    >
      <Navigation className="w-6 h-6" />
    </button>
  );
}

export default function Map() {
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState(STATIC_AREAS);
  const [mapStyle, setMapStyle] = useState({
    name: "Streets",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "OpenStreetMap",
  });
  const [showStyles, setShowStyles] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [showTopAreas, setShowTopAreas] = useState(true);
  const [thresholds, setThresholds] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    safe: 0,
    low: 0,
    medium: 0,
    high: 0,
    veryHigh: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function loadCounts() {
      try {
        const res = await getAllCrimeLocation();

        // 1️⃣ Normalize API response
        const apiData = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        // 2️⃣ Build name -> crimeCount map
        const crimeCountMap = {};
        apiData.forEach((item) => {
          if (!item?.name) return;

          const key = item.name.trim().toLowerCase();
          crimeCountMap[key] = Number(item.crimeCount ?? item.count) || 0;
        });

        // 3️⃣ Merge STATIC_AREAS with API counts
        const merged = STATIC_AREAS.map((area) => {
          const key = area.name.toLowerCase();

          return {
            ...area, // coords + baseRadius
            count: crimeCountMap[key] ?? 0, // backend crimeCount
          };
        });

        // 4️⃣ Calculate thresholds & stats (same logic as before)
        const counts = merged.map((m) => m.count);
        const min = Math.min(...counts);
        const max = Math.max(...counts);
        const total = counts.reduce((s, x) => s + x, 0);
        const avg = counts.length ? total / counts.length : 0;
        const range = max - min;

        const lowThreshold = avg - 0.25 * range;
        const highThreshold = avg + 0.25 * range;

        let safe = 0,
          low = 0,
          medium = 0,
          high = 0,
          veryHigh = 0;

        merged.forEach((m) => {
          const sev = getSeverityDynamic(m.count, {
            min,
            max,
            avg,
            lowThreshold,
            highThreshold,
          });

          if (sev.key === "safe") safe++;
          else if (sev.key === "low") low++;
          else if (sev.key === "medium") medium++;
          else if (sev.key === "high") high++;
          else if (sev.key === "veryHigh") veryHigh++;
        });

        // 5️⃣ Update state (IMPORTANT PART)
        setAreas(merged);
        setThresholds({ min, max, avg, lowThreshold, highThreshold });
        setStats({ total, safe, low, medium, high, veryHigh });
        setLoading(false);
      } catch (err) {
        console.warn("Map: failed to fetch counts", err);
        setAreas(STATIC_AREAS);
        setLoading(false);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
        () => setCenter([19.076, 72.8777]),
        { maximumAge: 60000, timeout: 20000 }
      );
    } else {
      setCenter([19.076, 72.8777]);
    }

    loadCounts();
    return () => {
      mounted = false;
    };
  }, []);

  const topAreas = useMemo(() => {
    return [...areas].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [areas]);

  // Fly to area function
  const [mapInstance, setMapInstance] = useState(null);

  const flyToArea = (coords) => {
    if (mapInstance) {
      mapInstance.flyTo(coords, 14, { duration: 1.5 });
    }
  };

  if (loading || !center) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-blue-400 mx-auto mb-4" />
            <div className="absolute inset-0 w-16 h-16 mx-auto animate-ping opacity-20">
              <div className="w-full h-full rounded-full bg-blue-400"></div>
            </div>
          </div>
          <p className="text-xl text-white font-bold">Loading Crime Heatmap</p>
          <p className="text-sm text-blue-300 mt-2">
            Analyzing Mumbai crime data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-slate-900">
      <MapContainer
        center={center}
        zoom={11}
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer url={mapStyle.url} attribution={mapStyle.attribution} />
        <ZoomControl position="bottomright" />
        <MapController
          areas={areas}
          thresholds={thresholds}
          center={center}
          onMapReady={setMapInstance}
        />

        <RecenterButton center={center} />

        <Marker position={center}>
          <Popup className="custom-popup">
            <div className="p-2 text-center">
              <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="font-semibold text-gray-800">Your Location</p>
              <p className="text-xs text-gray-500 mt-1">
                {center[0].toFixed(4)}, {center[1].toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>

        {areas.map((a) => {
          const sev = getSeverityDynamic(a.count, thresholds || {});
          const radius = computeRadius(
            a.baseRadius,
            a.count,
            thresholds?.max || 1
          );

          return (
            <Circle
              key={a.name}
              center={a.coords}
              radius={radius}
              pathOptions={{
                color: sev.color,
                fillColor: sev.color,
                fillOpacity: 0.35,
                weight: 2,
                opacity: 0.8,
              }}
            >
              <Popup className="custom-popup">
                <div className="p-4 min-w-[240px]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-lg capitalize">
                      {a.name}
                    </h3>
                    {sev.key === "veryHigh" && (
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    )}
                    {sev.key === "safe" && (
                      <Shield className="w-6 h-6 text-green-500" />
                    )}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-600 font-medium">
                        Incidents
                      </span>
                      <span className="font-bold text-gray-900 text-lg">
                        {a.count}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-600 font-medium">
                        Risk Level
                      </span>
                      <span
                        className="font-bold text-base"
                        style={{ color: sev.color }}
                      >
                        {sev.label}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-600 font-medium">
                        Area Coverage
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {(radius / 1000).toFixed(1)} km
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Relative Intensity</span>
                      <span>
                        {Math.round(
                          (a.count / Math.max(1, thresholds?.max ?? 1)) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (a.count / Math.max(1, thresholds?.max ?? 1)) * 100
                          )}%`,
                          backgroundColor: sev.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>

      {/* Map Style Selector */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={() => setShowStyles(!showStyles)}
          className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all hover:scale-105 border border-slate-600"
        >
          <Layers className="w-5 h-5" />
          <span className="font-semibold">{mapStyle.name}</span>
        </button>

        {showStyles && (
          <div className="absolute top-14 right-0 bg-slate-800 rounded-xl shadow-2xl overflow-hidden min-w-[180px] border border-slate-700">
            {[
              {
                name: "Streets",
                url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                attribution: "OpenStreetMap",
              },
              {
                name: "Dark",
                url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
                attribution: "CartoDB",
              },
              {
                name: "Satellite",
                url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                attribution: "Esri",
              },
              {
                name: "Terrain",
                url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
                attribution: "OpenTopoMap",
              },
            ].map((s) => (
              <button
                key={s.name}
                onClick={() => {
                  setMapStyle(s);
                  setShowStyles(false);
                }}
                className={`block w-full px-5 py-3 text-left text-sm transition-colors ${
                  mapStyle.name === s.name
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Location Info  */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">Your Location</p>
            <p className="text-xs text-blue-200">
              {center[0].toFixed(4)}, {center[1].toFixed(4)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
