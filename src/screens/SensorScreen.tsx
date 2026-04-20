import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useFarm } from '../context/FarmContext';
import { authService } from '../api/authService';
import { AppIcon } from '../components/AppIcon';

const SENSOR_FIELDS = [
  { key: 'ph', label: 'pH level', unit: 'pH', icon: 'ph', tag: 'Soil chemistry' },
  { key: 'temp', label: 'Soil temperature', unit: 'C', icon: 'temperature', tag: 'Thermal' },
  { key: 'moisture', label: 'Soil moisture', unit: '%', icon: 'moisture', tag: 'Moisture' },
  { key: 'sunlight', label: 'Sunlight', unit: 'W/m2', icon: 'sunlight', tag: 'Light' },
  { key: 'humidity', label: 'Humidity', unit: '%', icon: 'humidity', tag: 'Atmosphere' },
  { key: 'fertility', label: 'Soil fertility', unit: 'EC', icon: 'fertility', tag: 'Nutrients' },
] as const;

export const SensorScreen = ({ navigation }: any) => {
  const { activeBlock, refreshActiveBlockSensors } = useFarm();
  const [ph, setPh] = useState('');
  const [temp, setTemp] = useState('');
  const [moisture, setMoisture] = useState('');
  const [sunlight, setSunlight] = useState('');
  const [humidity, setHumidity] = useState('');
  const [fertility, setFertility] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeBlock?.sensors?.sensors) {
      const getValue = (type: string) =>
        activeBlock.sensors.sensors.find(sensor => sensor.sensor_type === type)?.value.toString() || '';

      setPh(getValue('ph_level'));
      setTemp(getValue('soil_temperature'));
      setMoisture(getValue('soil_moisture'));
      setHumidity(getValue('humidity'));
      setSunlight(getValue('sunlight'));
      setFertility(getValue('fertility'));
    }
  }, [activeBlock]);

  const fieldState = {
    ph,
    temp,
    moisture,
    sunlight,
    humidity,
    fertility,
  };

  const fieldSetters = {
    ph: setPh,
    temp: setTemp,
    moisture: setMoisture,
    sunlight: setSunlight,
    humidity: setHumidity,
    fertility: setFertility,
  };

  const handleSave = async () => {
    if (!activeBlock) {
      Alert.alert('No block selected', 'Select a block from the dashboard before saving observations.');
      return;
    }

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

      await authService.postSensorSnapshot(activeBlock.block_id, payload);
      await refreshActiveBlockSensors(activeBlock.block_id);

      Alert.alert('Saved', 'Sensor observations were updated successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('DashboardTab') },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.message || 'Could not save values.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>Sensor entries</Text>
          <Text style={styles.blockSubtitle}>{activeBlock?.lanslu || 'Selected block'}</Text>
          <Text style={styles.screenDescription}>
            Review and update the latest field measurements for the current block.
          </Text>
        </View>

        <View style={styles.grid}>
          {SENSOR_FIELDS.map(item => (
            <View key={item.key} style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <AppIcon
                  name={item.icon}
                  size={18}
                  color={colors.primary}
                  backgroundColor={colors.primaryContainer}
                />
                <Text style={styles.cardTag}>{item.tag}</Text>
              </View>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.cardInput}
                  value={fieldState[item.key]}
                  onChangeText={fieldSetters[item.key]}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.outline}
                />
                <Text style={styles.cardUnit}>{item.unit}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.syncButton} onPress={handleSave} disabled={isLoading} activeOpacity={0.9}>
            {isLoading ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <>
                <AppIcon name="sync" size={16} color={colors.onPrimary} />
                <Text style={styles.syncButtonText}>Save observations</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 120,
  },
  headerBlock: {
    marginBottom: 24,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onSurface,
  },
  blockSubtitle: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  screenDescription: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: colors.onSurfaceVariant,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  cardContainer: {
    width: '47.5%',
    backgroundColor: colors.surfaceContainerLowest,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTag: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 10,
  },
  cardUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  ctaContainer: {
    marginTop: 28,
    marginBottom: 24,
  },
  syncButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  syncButtonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
