import "leaflet/dist/leaflet.css";
import { Box } from "@mui/material";
import L, { type LeafletMouseEvent } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { LatLon } from "../../lib/geo";

// Leaflet resolves its default marker images relative to its own CSS, which a bundler
// rewrites — point it at the bundled assets explicitly instead.
const markerIconInstance = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

/** Used only when neither a value nor a fallback center is known (Minsk, at country zoom). */
const DEFAULT_CENTER: LatLon = { lat: 53.9, lon: 27.56 };
const DEFAULT_ZOOM = 6;
const POINT_ZOOM = 15;
const OVERVIEW_ZOOM = 11;

interface LocationPickerProps {
  /** The picked point, or null when nothing is picked yet. */
  value: LatLon | null;
  onChange: (value: LatLon) => void;
  /** Where to look when value is null — e.g. the selected city's center. */
  fallbackCenter?: LatLon | null;
  disabled?: boolean;
  height?: number;
}

/**
 * Click-to-place / drag-to-move point picker on OpenStreetMap tiles. Pure UI: it knows
 * nothing about forms — see CoordinatesField for the react-hook-form binding.
 */
export function LocationPicker({
  value,
  onChange,
  fallbackCenter,
  disabled,
  height = 320,
}: LocationPickerProps) {
  const initialCenter = value ?? fallbackCenter ?? DEFAULT_CENTER;
  const initialZoom = value ? POINT_ZOOM : fallbackCenter ? OVERVIEW_ZOOM : DEFAULT_ZOOM;

  return (
    <Box
      sx={{
        height,
        borderRadius: 1,
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
        opacity: disabled ? 0.6 : 1,
        "& .leaflet-container": { height: "100%", width: "100%", cursor: disabled ? "default" : "crosshair" },
      }}
    >
      <MapContainer center={[initialCenter.lat, initialCenter.lon]} zoom={initialZoom} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToPick disabled={disabled} onPick={onChange} />
        <FollowCenter target={value ?? fallbackCenter ?? null} zoom={value ? POINT_ZOOM : OVERVIEW_ZOOM} />
        <JumpToFallback center={fallbackCenter ?? null} />
        {value && <DraggableMarker value={value} disabled={disabled} onChange={onChange} />}
      </MapContainer>
    </Box>
  );
}

function ClickToPick({ disabled, onPick }: { disabled?: boolean; onPick: (value: LatLon) => void }) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      if (!disabled) onPick(fromLatLng(event.latlng));
    },
  });
  return null;
}

/** Pans to target when it moves out of view — e.g. the user typed coordinates or switched city. */
function FollowCenter({ target, zoom }: { target: LatLon | null; zoom: number }) {
  const map = useMap();
  const lat = target?.lat;
  const lon = target?.lon;

  useEffect(() => {
    if (lat === undefined || lon === undefined) return;
    const point = L.latLng(lat, lon);
    if (!map.getBounds().contains(point)) {
      map.setView(point, Math.max(map.getZoom(), zoom));
    }
  }, [map, lat, lon, zoom]);

  return null;
}

/**
 * Moves the map to the fallback center whenever it changes after mount — picking a city
 * means "show me that city", even when it is already somewhere in the current view.
 * The first render is skipped: the initial center already accounts for it, and on an
 * existing place the point, not the city, decides the view.
 */
function JumpToFallback({ center }: { center: LatLon | null }) {
  const map = useMap();
  const lat = center?.lat;
  const lon = center?.lon;
  const previous = useRef({ lat, lon });

  useEffect(() => {
    if (previous.current.lat === lat && previous.current.lon === lon) return;
    previous.current = { lat, lon };
    if (lat === undefined || lon === undefined) return;
    map.setView([lat, lon], OVERVIEW_ZOOM);
  }, [map, lat, lon]);

  return null;
}

function DraggableMarker({
  value,
  disabled,
  onChange,
}: {
  value: LatLon;
  disabled?: boolean;
  onChange: (value: LatLon) => void;
}) {
  const eventHandlers = useMemo(
    () => ({
      dragend(event: L.DragEndEvent) {
        onChange(fromLatLng((event.target as L.Marker).getLatLng()));
      },
    }),
    [onChange],
  );

  return (
    <Marker
      position={[value.lat, value.lon]}
      icon={markerIconInstance}
      draggable={!disabled}
      eventHandlers={eventHandlers}
    />
  );
}

/** Rounds to 6 decimals (~0.1 m) — more precision is noise, and it keeps the inputs readable. */
function fromLatLng(latlng: L.LatLng): LatLon {
  const wrapped = latlng.wrap();
  return { lat: round6(wrapped.lat), lon: round6(wrapped.lng) };
}

function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}
