import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface LatLng {
  latitude: number;
  longitude: number;
}

interface MapLeafletProps {
  currentLocation: LatLng | null;
  points: LatLng[];
  trail?: LatLng[];
  isFinalized?: boolean;
  onMapTap?: (point: LatLng) => void;
  onMapReady?: () => void;
}
export const MapLeaflet: React.FC<MapLeafletProps> = ({ 
  currentLocation, 
  points,
  trail = [],
  isFinalized = false,
  onMapTap,
  onMapReady
}) => {
  const webViewRef = useRef<WebView>(null);
  const initialLoadRef = useRef(true);

  // Memoize the HTML so it's only generated once.
  // This is CRITICAL to prevent flickering/reloading when GPS updates.
  const mapHtml = React.useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Leaflet Map</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; height: 100vh; width: 100vw; }
        #map { height: 100%; width: 100%; background: #000; }
        .leaflet-control-attribution { display: none; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: false
        }).setView([${currentLocation?.latitude || 0}, ${currentLocation?.longitude || 0}], ${currentLocation ? 17 : 2});

        var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19
        }).addTo(map);

        var userMarker = null;
        var pointsMarkers = [];
        var shape = null;
        var trailLayer = null;
        var initialCentered = ${currentLocation ? 'true' : 'false'};

        window.updateMap = function(data) {
          try {
            var parsed = JSON.parse(data);
            if (!parsed) return;

            // Update User Location
            if (parsed.currentLocation) {
              var latlng = [parsed.currentLocation.latitude, parsed.currentLocation.longitude];
              
              if (!initialCentered && latlng[0] !== 0) {
                map.setView(latlng, 17);
                initialCentered = true;
                setTimeout(function() { map.invalidateSize(); }, 200);
              }

              if (!userMarker) {
                userMarker = L.circleMarker(latlng, {
                  radius: 8,
                  fillColor: "#3b82f6",
                  color: "#fff",
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8
                }).addTo(map);
              } else {
                userMarker.setLatLng(latlng);
              }
            }

            // Update Walking Trail
            if (trailLayer) {
              map.removeLayer(trailLayer);
              trailLayer = null;
            }
            if (parsed.trail && parsed.trail.length >= 2) {
              var trailLatLngs = parsed.trail.map(function(p) { return [p.latitude, p.longitude]; });
              trailLayer = L.polyline(trailLatLngs, {
                color: "#3b82f6",
                weight: 4,
                opacity: 0.4,
                lineJoin: 'round'
              }).addTo(map);
            }

            // Update Points Markers
            pointsMarkers.forEach(function(m) { map.removeLayer(m); });
            pointsMarkers = [];
            
            // Clear previous shape
            if (shape) {
              map.removeLayer(shape);
              shape = null;
            }

            if (parsed.points && parsed.points.length > 0) {
              var latlngs = parsed.points.map(function(p) { return [p.latitude, p.longitude]; });
              
              latlngs.forEach(function(ll) {
                var m = L.circleMarker(ll, {
                  radius: 6,
                  fillColor: "#10b981",
                  color: "#fff",
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 1
                }).addTo(map);
                pointsMarkers.push(m);
              });

              if (latlngs.length >= 2) {
                if (parsed.isFinalized) {
                  shape = L.polygon(latlngs, {
                    color: "#059669",
                    fillColor: "#10b981",
                    fillOpacity: 0.3,
                    weight: 3
                  }).addTo(map);
                } else {
                  shape = L.polyline(latlngs, {
                    color: "#3b82f6",
                    weight: 3,
                    dashArray: "5, 10"
                  }).addTo(map);
                }
              }
            }
          } catch (e) {
            console.error("Leaflet JS Error:", e);
          }
        };

        map.on('click', function(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MAP_TAP',
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
          }));
        });

        window.onload = function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
        };
      </script>
    </body>
    </html>
  `, []);

  // Use a constant source object to prevent WebView reloads
  const webViewSource = React.useMemo(() => ({ html: mapHtml }), [mapHtml]);

  useEffect(() => {
    // Only inject if coordinates exist
    if (currentLocation || points.length > 0 || trail.length > 0) {
      const data = JSON.stringify({ currentLocation, points, trail, isFinalized });
      webViewRef.current?.injectJavaScript(`if(window.updateMap) { window.updateMap('${data}'); } true;`);
    }
  }, [currentLocation, points, trail, isFinalized]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={webViewSource}
        style={styles.map}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'MAP_TAP' && onMapTap) {
              onMapTap({ latitude: data.latitude, longitude: data.longitude });
            } else if (data.type === 'MAP_READY' && onMapReady) {
              onMapReady();
              // Push initial data immediately on ready
              const initData = JSON.stringify({ currentLocation, points, trail, isFinalized });
              webViewRef.current?.injectJavaScript(`window.updateMap('${initData}'); true;`);
            }
          } catch (e) {
            console.error("WebView Message Error:", e);
          }
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
