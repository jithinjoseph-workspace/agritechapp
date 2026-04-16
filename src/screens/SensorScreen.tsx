import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  TextInput,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import { authService } from '../api/authService';
import { useState, useEffect } from 'react';
import { ActivityIndicator, Alert } from 'react-native';

const IconPlaceholder = ({ name, color, size }: { name: string, color: string, size: number }) => (
  <Text style={{ color, fontSize: size, fontWeight: 'bold' }}>
    {name === 'grid_view' ? '☰' : 
     name === 'science' ? '🧪' : 
     name === 'thermostat' ? '🌡️' : 
     name === 'water_drop' ? '💧' : 
     name === 'light_mode' ? '☀️' : 
     name === 'humidity_mid' ? '💨' : 
     name === 'compost' ? '🌱' : 
     name === 'sync' ? '🔄' : 
     name === 'dashboard' ? '📊' : 
     name === 'sensors' ? '🎛️' : 
     name === 'psychology' ? '🧠' : 
     name === 'person' ? '👤' : ''}
  </Text>
);

export const SensorScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { activeBlock, refreshActiveBlockSensors } = useFarm();

  const [ph, setPh] = useState('');
  const [temp, setTemp] = useState(''); // Maps specifically to Soil Temperature
  const [moisture, setMoisture] = useState('');
  const [sunlight, setSunlight] = useState('');
  const [humidity, setHumidity] = useState('');
  const [fertility, setFertility] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeBlock && activeBlock.sensors && activeBlock.sensors.sensors) {
      const getVal = (type: string) => activeBlock.sensors.sensors.find(s => s.sensor_type === type)?.value.toString() || '';
      setPh(getVal('ph_level'));
      setTemp(getVal('soil_temperature')); // Targeted to soil temp
      setMoisture(getVal('soil_moisture'));
      setHumidity(getVal('humidity'));
      setSunlight('850');
      setFertility('78');
    }
  }, [activeBlock]);

  const handleSave = async () => {
    console.warn('🚀 [DEBUG] handleSave triggered');
    if (!activeBlock) {
      console.error('❌ [DEBUG] Save failed: No activeBlock found in context');
      Alert.alert("Debug Error", "No farm block is selected. Please select a block on the dashboard first.");
      return;
    }

    Alert.alert("DEBUG", "Starting API Call to " + activeBlock.block_id);
    setIsLoading(true);
    try {
      const payload = {
        moisture: parseFloat(moisture) || 0,
        temp: parseFloat(temp) || 0,
        humidity: parseFloat(humidity) || 0,
        ph_level: parseFloat(ph) || 0,
        sunlight: parseFloat(sunlight) || 0,
        fertility: parseFloat(fertility) || 0,
      };
      
      console.warn('📡 [API POST] Payload:', JSON.stringify(payload));
      await authService.postSensorSnapshot(activeBlock.block_id, payload);
      
      console.warn('🔄 [DEBUG] Snapshot saved. Starting refresh...');
      await refreshActiveBlockSensors(activeBlock.block_id);
      
      Alert.alert("Success", "Soil data updated and refreshed from API.", [
        { text: "OK", onPress: () => navigation.navigate('DashboardTab') }
      ]);
    } catch (e) {
      Alert.alert("Error", "Could not save values.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>{activeBlock?.crop || 'Crop'} Details</Text>
          <Text style={styles.blockSubtitle}>{activeBlock?.lanslu || 'RECORD OBSERVATIONS'}</Text>
          <Text style={styles.screenDescription}>Manual entry for Soil Temperature and other key sensors.</Text>
        </View>
        <View style={styles.grid}>
          {[
            { label: 'pH Level', value: ph, setter: setPh, unit: 'pH', icon: 'science', tag: 'SOIL HEALTH' },
            { label: 'Soil Temperature', value: temp, setter: setTemp, unit: '°C', icon: 'thermostat', tag: 'THERMAL' },
            { label: 'Soil Moisture', value: moisture, setter: setMoisture, unit: '%', icon: 'water_drop', tag: 'MOISTURE' },
            { label: 'Sunlight', value: sunlight, setter: setSunlight, unit: 'W/m²', icon: 'light_mode', tag: 'SOLAR' },
            { label: 'Humidity', value: humidity, setter: setHumidity, unit: '%', icon: 'humidity_mid', tag: 'ATMOSPHERE' },
            { label: 'Soil Fertility', value: fertility, setter: setFertility, unit: 'EC', icon: 'compost', tag: 'NUTRIENTS' },
          ].map((item, idx) => (
            <View key={idx} style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <IconPlaceholder name={item.icon} color={colors.secondary} size={20} />
                <Text style={styles.cardTag}>{item.tag}</Text>
              </View>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <View style={styles.inputRow}>
                <TextInput style={styles.cardInput} value={item.value} onChangeText={item.setter} keyboardType="numeric" />
                <Text style={styles.cardUnit}>{item.unit}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.syncButton} onPress={handleSave} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color={colors.onPrimary} /> : (
              <><IconPlaceholder name="sync" color={colors.onPrimary} size={20} /><Text style={styles.syncButtonText}>Save Observations</Text></>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 120 },
  headerBlock: {
    marginBottom: 32,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  blockSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.secondary,
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  screenDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardContainer: {
    width: '47%', // approximation for grid-cols-2 with gap
    backgroundColor: colors.surfaceContainerLowest,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(193, 200, 194, 0.2)', // outlineVariant/20
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTag: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: 'rgba(65, 72, 68, 0.6)',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  cardInput: {
    flex: 1,
    borderBottomWidth: 2,
    borderColor: colors.outlineVariant,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.onSurface,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  cardUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
  },
  ctaContainer: {
    marginTop: 48,
    marginBottom: 32,
    alignItems: 'center',
  },
  syncButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 20,
    borderRadius: 20,
    gap: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  syncButtonText: {
    color: colors.onPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  blockNameInfo: {
    marginTop: 16,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.secondary,
  },
});
