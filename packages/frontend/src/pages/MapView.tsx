import { useState } from "react";
import ReactMapGL, { Marker } from "react-map-gl/mapbox";
import type { ViewStateChangeEvent, ViewState } from "react-map-gl/mapbox";
// import axios from 'axios';

const MELB_CENTER = { latitude: -37.8136, longitude: 144.9631 };

// Sample stubbed forecasts
const MOCK_FORECASTS = [
  {
    sensorId: "Swa295_T",
    location: { lat: -37.82, lon: 144.96 },
    prediction: 650,
  },
  {
    sensorId: "Fli114F_T",
    location: { lat: -37.81, lon: 144.97 },
    prediction: 430,
  },
  { sensorId: "WatC", location: { lat: -37.8, lon: 144.98 }, prediction: 210 },
];

export default function MapView() {
  const [viewport, setViewport] = useState<Partial<ViewState>>({
    ...MELB_CENTER,
    zoom: 12,
  });
  // const [forecasts, setForecasts] = useState<any[]>([]);

  // useEffect(() => {
  //   // Fetch latest forecasts (example endpoint)
  //   axios
  //     .get('/api/performance?sensorId=all') // proxy via Vite config or full URL
  //     .then((res) => setForecasts(res.data))
  //     .catch(console.error);
  // }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Pedestrian Predictions Map
        </h2>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
            ← Prev
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
            Next →
          </button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-lg h-[80vh]">
        <ReactMapGL
          {...viewport}
          style={{ width: "100%", height: "100%" }}
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          onMove={(evt: ViewStateChangeEvent) =>
            setViewport((prev) => ({ ...prev, ...evt.viewState }))
          }
        >
          {MOCK_FORECASTS.map((f) => (
            <Marker
              key={f.sensorId}
              longitude={f.location.lon}
              latitude={f.location.lat}
              anchor="bottom"
            >
              <div className="bg-blue-500 text-white px-2 py-1 rounded">
                {f.prediction}
              </div>
            </Marker>
          ))}
        </ReactMapGL>
      </div>
    </div>
  );
}
