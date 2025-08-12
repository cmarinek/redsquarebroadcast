import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map as MapboxMapType, GeoJSONSource } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";

export interface ScreenPoint {
  id: string;
  screen_name?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface Props {
  coords: { lat: number; lng: number } | null;
  screens: ScreenPoint[];
  onSelectScreen?: (id: string) => void;
}

const MapboxMap: React.FC<Props> = ({ coords, screens, onSelectScreen }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMapType | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const hasCenteredOnUser = useRef(false);
  const [tokenReady, setTokenReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Mapbox public token with fallbacks (URL param, localStorage, edge function)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const urlToken = typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('mapbox') : null;
        const lsToken = typeof window !== 'undefined' ? localStorage.getItem('mapbox_public_token') : null;
        const firstToken = urlToken || lsToken;

        if (firstToken) {
          mapboxgl.accessToken = firstToken;
          if (mounted) { setTokenReady(true); setLoading(false); setError(null); }
          return;
        }

        let token: string | undefined;
        let lastErr: any = null;
        for (let i = 0; i < 3; i++) {
          const { data, error } = await supabase.functions.invoke("get-mapbox-token");
          if (!error) {
            token = (data as any)?.token as string | undefined;
            if (token) break;
          } else {
            lastErr = error;
          }
          await new Promise((r) => setTimeout(r, 400 * Math.pow(2, i)));
        }

        if (!token) throw lastErr || new Error("No token returned");

        mapboxgl.accessToken = token;
        if (mounted) { setTokenReady(true); setError(null); }
      } catch (e) {
        console.error("Failed to get Mapbox token:", e);
        if (mounted) setError("Map service temporarily unavailable.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!tokenReady || !containerRef.current) return;
    if (mapRef.current) return; // already initialized

    const center = coords ? [coords.lng, coords.lat] : [-122.4194, 37.7749];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center,
      zoom: coords ? 13 : 10,
      attributionControl: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    setLoading(false);
    map.on('dragstart', () => { hasCenteredOnUser.current = true; });

    map.on("load", () => {
      // Screens source with clustering
      const features = (screens || [])
        .filter((s) => s.latitude != null && s.longitude != null)
        .map((s) => ({
          type: "Feature",
          properties: {
            id: s.id,
            title: s.screen_name || "Digital Screen",
            location: s.location || "",
          },
          geometry: { type: "Point", coordinates: [s.longitude as number, s.latitude as number] },
        }));

      map.addSource("screens", {
        type: "geojson",
        data: { type: "FeatureCollection", features },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Cluster circles
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "screens",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#93c5fd", // small clusters
            10,
            "#60a5fa",
            30,
            "#3b82f6",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            16,
            10,
            22,
            30,
            28,
          ],
        },
      });

      // Cluster count labels
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "screens",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Inter Regular", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: { "text-color": "#0f172a" },
      });

      // Unclustered points
      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "screens",
        filter: ["!has", "point_count"],
        paint: {
          "circle-color": "#0ea5e9",
          "circle-radius": 7,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Click to zoom clusters
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource("screens") as GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.easeTo({ center: (features[0].geometry as any).coordinates, zoom });
        });
      });

      // Click single point -> navigate
      map.on("click", "unclustered-point", (e) => {
        const f = e.features?.[0];
        const id = (f?.properties as any)?.id as string | undefined;
        if (id && onSelectScreen) onSelectScreen(id);
      });

      // Cursor styles
      map.on("mouseenter", "clusters", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "clusters", () => (map.getCanvas().style.cursor = ""));
      map.on("mouseenter", "unclustered-point", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "unclustered-point", () => (map.getCanvas().style.cursor = ""));

      // User location marker
      if (coords) {
        userMarkerRef.current = new mapboxgl.Marker({ color: "#22c55e" })
          .setLngLat([coords.lng, coords.lat])
          .setPopup(new mapboxgl.Popup({ offset: 24 }).setText("You are here"))
          .addTo(map);
      }
    });

    mapRef.current = map;

    return () => {
      userMarkerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [tokenReady]);

  // Update screens source when list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const src = map.getSource("screens") as GeoJSONSource | undefined;
    if (!src) return;
    const features = (screens || [])
      .filter((s) => s.latitude != null && s.longitude != null)
      .map((s) => ({
        type: "Feature",
        properties: { id: s.id, title: s.screen_name || "Digital Screen", location: s.location || "" },
        geometry: { type: "Point", coordinates: [s.longitude as number, s.latitude as number] },
      }));
    src.setData({ type: "FeatureCollection", features } as any);
  }, [screens]);

  // Update user marker and optionally recenter
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (coords) {
      // Place or update user marker
      if (!userMarkerRef.current) {
        userMarkerRef.current = new mapboxgl.Marker({ color: "#22c55e" })
          .setLngLat([coords.lng, coords.lat])
          .setPopup(new mapboxgl.Popup({ offset: 24 }).setText("You are here"))
          .addTo(map);
      } else {
        userMarkerRef.current.setLngLat([coords.lng, coords.lat]);
      }
      // Recenter to user's location once when it's first available
      if (!hasCenteredOnUser.current) {
        map.easeTo({ center: [coords.lng, coords.lat], zoom: Math.max(map.getZoom(), 13) });
        hasCenteredOnUser.current = true;
      }
    } else {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
    }
  }, [coords]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {(loading || error) && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-md bg-background/80 px-3 py-2 text-sm text-foreground shadow">
            {loading ? "Loading map..." : "Map unavailable. Retrying soon or refresh."}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
