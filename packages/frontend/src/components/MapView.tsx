import React, { useState } from "react";
import Map, { NavigationControl, ScaleControl } from "react-map-gl/mapbox";
import type { ViewStateChangeEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MapView: React.FC = () => {
  const [viewState, setViewState] = useState({
    longitude: 144.9631, // Melbourne longitude
    latitude: -37.8136, // Melbourne latitude
    zoom: 12,
    pitch: 0,
    bearing: 0,
  });

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-100">
        <p className="text-red-700 text-xl">
          Mapbox token is not configured. Please set VITE_MAPBOX_TOKEN in your
          .env file.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Map
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11" // You can choose other map styles
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />
        <ScaleControl />
      </Map>
    </div>
  );
};

export default MapView;
