import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  DeviceEventEmitter,
  PermissionsAndroid,
  Vibration,
  Platform
} from 'react-native';
import { MapLeaflet } from '../components/MapLeaflet';
import Geolocation from '@react-native-community/geolocation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useFarm } from '../context/FarmContext';

interface LatLng {
  latitude: number;
  longitude: number;
}

export const MappingScreen = ({ navigation }: any) => {
  const { activeBlock } = useFarm();
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [points, setPoints] = useState<LatLng[]>([]);
  const [trail, setTrail] = useState<LatLng[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'Searching' | 'Connected' | 'Denied' | 'Error'>('Searching');

  useEffect(() => {
    let watchId: number | null = null;
    
    const startWatching = (highAccuracy = true) => {
      console.log(`🌐 [GPS] Starting watch (HighAccuracy: ${highAccuracy})`);
      
      // Kickstart with a single position fetch
      Geolocation.getCurrentPosition(
        (pos) => {
          console.log('✅ [GPS] First position acquired!');
          setGpsStatus('Connected');
          setCurrentLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        (err) => console.log('⚠️ [GPS] Kickstart failed, relying on watch...'),
        { enableHighAccuracy: highAccuracy, timeout: 5000 }
      );

      watchId = Geolocation.watchPosition(
        (position) => {
          console.log('🛰️ [GPS] Signal Received:', position.coords.latitude, position.coords.longitude);
          setGpsStatus('Connected');
          const newLoc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(newLoc);
          
          // Log to Trail (only if moved > 2m)
          setTrail(prev => {
            if (prev.length === 0) return [newLoc];
            const last = prev[prev.length - 1];
            const dist = calculateDistance(newLoc.latitude, newLoc.longitude, last.latitude, last.longitude);
            return dist > 2 ? [...prev, newLoc] : prev;
          });
        },
        (error) => {
          console.error('❌ [GPS Error]:', error.code, error.message);
          
          if (highAccuracy && (error.code === 3 || error.code === 2)) {
            console.warn('🔄 [GPS] High accuracy failed/timeout. Retrying with basic location...');
            if (watchId !== null) Geolocation.clearWatch(watchId);
            startWatching(false); // Fallback to non-high accuracy
          } else if (error.code === 1) {
            setGpsStatus('Denied');
            Alert.alert("Location Disabled", "Please enable GPS and location permissions in your phone settings.");
          } else {
            setGpsStatus('Error');
          }
        },
        { 
          enableHighAccuracy: highAccuracy, 
          distanceFilter: 1, 
          interval: 1000, 
          fastestInterval: 500,
          timeout: 10000 // 10 second timeout per signal attempt
        }
      );
    };

    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Farm Mapping GPS",
              message: "We need your GPS to map the farm corners.",
              buttonPositive: "OK"
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            startWatching();
          } else {
            setGpsStatus('Denied');
          }
        } catch (err) {
          console.warn(err);
          setGpsStatus('Error');
        }
      } else {
        startWatching();
      }
    };

    requestLocationPermission();

    return () => {
      if (watchId !== null) Geolocation.clearWatch(watchId);
    };
  }, []);

  // FREE Fallback: Simulate Location for testing when GPS is slow
  const simulateLocation = () => {
    const mockPoint = {
      latitude: -34.195 + (Math.random() * 0.002),
      longitude: 140.755 + (Math.random() * 0.002),
    };
    setCurrentLocation(mockPoint);
    console.log('🧪 [SIMULATION] Location Injected:', mockPoint);
    Alert.alert("Simulation Active", "A test location has been injected for mapping.");
  };

  const addPoint = () => {
    if (isFinalized) return;
    if (!currentLocation) {
      Alert.alert("GPS Waiting", "Still getting your location. Please wait a moment.");
      return;
    }
    
    // Check if we are closing the loop (near first point)
    if (points.length >= 3) {
      const firstPoint = points[0];
      const dist = calculateDistance(currentLocation.latitude, currentLocation.longitude, firstPoint.latitude, firstPoint.longitude);
      if (dist < 15) { // Within 15 meters for easier field capture
        finalizeBoundary(); // AUTO-CLOSE
        return;
      }
    }

    // Feedback: Vibrate and animate button
    Vibration.vibrate(100);
    setIsCapturing(true);
    setTimeout(() => setIsCapturing(false), 300);

    setPoints([...points, currentLocation]);
    console.log('📍 [Mapping] Captured Point:', currentLocation);
  };

  // Haversine formula for distance in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const finalizeBoundary = () => {
    if (points.length < 3) return;
    
    // No need to manually add the first point to the points array anymore.
    // L.polygon in MapLeaflet will automatically close the loop for us.
    setIsFinalized(true);
    
    Vibration.vibrate([0, 100, 50, 100]);
    Alert.alert("Boundary Closed", "The loop is now closed and your farm area is visible!");
  };

  const undoLastPoint = () => {
    setPoints(points.slice(0, -1));
  };

  const clearPoints = () => {
    Alert.alert("Clear Mapping", "Remove all captured points?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", onPress: () => {
        setPoints([]);
        setTrail([]);
        setIsFinalized(false);
      }, style: "destructive" }
    ]);
  };

  const saveBoundary = () => {
    if (!activeBlock) {
      Alert.alert("Context Error", "useFarm must be used within a FarmProvider");
      return;
    }
    if (points.length < 3) {
      Alert.alert("Incomplete", "A farm boundary needs at least 3 points to form a shape.");
      return;
    }

    // Convert to GeoJSON Polygon
    // GeoJSON requires the first and last point to be the same to close the ring
    const coordinates = [
      ...points.map(p => [p.longitude, p.latitude]),
      [points[0].longitude, points[0].latitude]
    ];

    const geoJson = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coordinates]
      },
      properties: {
        block_id: activeBlock?.block_id,
        block_name: activeBlock?.block_name,
        captured_at: new Date().toISOString(),
        manual_mapping: true
      }
    };

    console.warn('✅ [MAPPING SUCCESS] GeoJSON Created:');
    console.log(JSON.stringify(geoJson, null, 2));

    Alert.alert(
      "Boundary Saved",
      "Mapping completed. Check your console for the GeoJSON output. I will enable the API sync soon!",
      [{ text: "Great", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Boundary Mapper</Text>
          <Text style={[
            styles.subtitle, 
            gpsStatus === 'Connected' ? { color: '#4ade80' } : { color: '#fb7185' }
          ]}>
            GPS: {gpsStatus} • {points.length} Points
          </Text>
        </View>
        <TouchableOpacity onPress={simulateLocation} style={styles.simulateButton}>
          <Text style={styles.simulateText}>TEST GPS</Text>
        </TouchableOpacity>
      </View>

      {/* Free Map Alternative (Leaflet) */}
      <MapLeaflet 
        currentLocation={currentLocation}
        points={points}
        trail={trail}
        isFinalized={isFinalized}
        onMapTap={(point) => {
          if (!isFinalized) {
            setPoints([...points, point]);
          }
        }}
      />

      {/* Controls Overlay */}
      <View style={styles.controls}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={clearPoints}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={undoLastPoint}>
            <Text style={styles.buttonText}>Undo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
            styles.captureButton, 
            isCapturing && styles.captureSuccess,
            points.length >= 3 && currentLocation && calculateDistance(currentLocation.latitude, currentLocation.longitude, points[0].latitude, points[0].longitude) < 15 && { backgroundColor: '#4ade80' }
          ]} 
          onPress={addPoint}
        >
          <View style={styles.captureInner}>
            <Text style={styles.capturePlus}>
              {points.length >= 3 && currentLocation && calculateDistance(currentLocation.latitude, currentLocation.longitude, points[0].latitude, points[0].longitude) < 15 ? "✓" : "+"}
            </Text>
            <Text style={styles.captureText}>
              {points.length >= 3 && currentLocation && calculateDistance(currentLocation.latitude, currentLocation.longitude, points[0].latitude, points[0].longitude) < 15 ? "Close & Save" : "Capture Corner"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton, 
            (points.length < 3 || isFinalized) && styles.disabledButton,
            isFinalized && { backgroundColor: (colors as any).success || '#4ade80' }
          ]}
          onPress={isFinalized ? saveBoundary : finalizeBoundary}
        >
          <Text style={styles.saveText}>{isFinalized ? "Save & Exit" : "Finalize Boundary"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 10,
    gap: 15,
  },
  backButton: {
    padding: 10,
  },
  backText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  map: { flex: 1 },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    gap: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  captureButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  captureSuccess: {
    backgroundColor: '#4ade80', // Green success color
    transform: [{ scale: 1.05 }],
  },
  captureInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  capturePlus: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  captureText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  saveText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  disabledButton: { opacity: 0.5 },
  simulateButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  simulateText: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: 'bold',
  }
});
