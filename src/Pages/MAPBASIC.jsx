import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Map() {
  const [center, setCenter] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.log("Permission denied or error", err);
        setCenter([19.0760, 72.8777]);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
      }
    );
  }, []);

  if (!center) return <p>Loading map...</p>;

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "80vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center}>
        <Popup>You are here 📍</Popup>
      </Marker>
    </MapContainer>
  );
}
