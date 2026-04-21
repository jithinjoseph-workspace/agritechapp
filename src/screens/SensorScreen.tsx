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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../theme/colors';
import { useFarm } from '../context/FarmContext';
import { authService } from '../api/authService';
import { AppIcon } from '../components/AppIcon';

const SENSOR_FIELDS = [
  { key: 'ph',        label: 'pH Level',         unit: 'pH',   icon: 'ph',          tag: 'Chemistry'  },
  { key: 'temp',      label: 'Soil Temperature',  unit: '°C',   icon: 'temperature', tag: 'Thermal'    },
  { key: 'moisture',  label: 'Soil Moisture',     unit: '%',    icon: 'moisture',    tag: 'Moisture'   },
  { key: 'sunlight',  label: 'Sunlight',          unit: 'W/m²', icon: 'sunlight',    tag: 'Light'      },
  { key: 'humidity',  label: 'Humidity',          unit: '%',    icon: 'humidity',    tag: 'Atmosphere' },
  { key: 'fertility', label: 'Soil Fertility',    unit: 'EC',   icon: 'fertility',   tag: 'Nutrients'  },
] as const;

export const SensorScreen = ({ navigation }: any) => {
  const { activeBlock, refreshActiveBlockSensors } = useFarm();
  const [ph, setPh]             = useState('');
  const [temp, setTemp]         = useState('');
  const [moisture, setMoisture] = useState('');
  const [sunlight, setSunlight] = useState('');
  const [humidity, setHumidity] = useState('');
  const [fertility, setFertility] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    if (activeBlock?.sensors?.sensors) {
      const get = (type: string) =>
        activeBlock.sensors.sensors.find(s => s.sensor_type === type)?.value.toString() || '';
      setPh(get('ph_level'));
      setTemp(get('soil_temperature'));
      setMoisture(get('soil_moisture'));
      setHumidity(get('humidity'));
      setSunlight(get('sunlight'));
      setFertility(get('fertility'));
    }
  }, [activeBlock]);

  const fieldState: Record<string, string> = { ph, temp, moisture, sunlight, humidity, fertility };
  const fieldSetters: Record<string, (v: string) => void> = {
    ph: setPh, temp: setTemp, moisture: setMoisture,
    sunlight: setSunlight, humidity: setHumidity, fertility: setFertility,
  };

  const handleSave = async () => {
    if (!activeBlock) {
      Alert.alert('No block selected', 'Select a block from the dashboard before saving.');
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
      Alert.alert('Saved ✓', 'Sensor readings updated successfully.', [
        { text: 'Done', onPress: () => navigation.navigate('DashboardTab') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.detail || error?.message || 'Could not save values.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges= {['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Page header */}
        <Text style={styles.pageLabel}>Sensor Entries</Text>

        {/* Active block pill */}
        {!!activeBlock && (
          <View style={styles.blockPill}>
            <AppIcon name="location" size={13} color={colors.primary} backgroundColor="transparent" />
            <Text style={styles.blockPillText}>{activeBlock.lanslu} · {activeBlock.crop}</Text>
          </View>
        )}

        {/* Section label */}
        <Text style={styles.sectionLabel}>Field Measurements</Text>

        {/* Sensor input grid */}
        <View style={styles.grid}>
          {SENSOR_FIELDS.map(item => {
            const isFocused = focused === item.key;
            return (
              <View key={item.key} style={[styles.card, isFocused && styles.cardFocused]}>
                <View style={styles.cardTop}>
                  <AppIcon
                    name={item.icon}
                    size={15}
                    color={isFocused ? colors.primary : colors.onSurfaceVariant}
                    backgroundColor={isFocused ? colors.primaryContainer : colors.surfaceContainer}
                  />
                  <Text style={[styles.cardTag, isFocused && styles.cardTagFocused]}>{item.tag}</Text>
                </View>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.cardInput, isFocused && styles.cardInputFocused]}
                    value={fieldState[item.key]}
                    onChangeText={fieldSetters[item.key]}
                    keyboardType="numeric"
                    placeholder="—"
                    placeholderTextColor={colors.outline}
                    onFocus={() => setFocused(item.key)}
                    onBlur={() => setFocused(null)}
                  />
                  <Text style={styles.cardUnit}>{item.unit}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, isLoading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.88}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <AppIcon name="sync" size={15} color="#ffffff" backgroundColor="transparent" />
              <Text style={styles.saveBtnText}>Save Observations</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f2' },
  scroll: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 120 },

  pageLabel: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 12,
    letterSpacing: 0.2,
  },

  blockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryContainer,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 24,
  },
  blockPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 12,
    marginLeft: 2,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 28,
  },
  card: {
    width: '47.5%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#1f3b2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardFocused: {
    borderColor: colors.primary,
    shadowOpacity: 0.1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTagFocused: { color: colors.primary },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    marginBottom: 10,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardInput: {
    flex: 1,
    backgroundColor: '#f0f4f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    fontSize: 22,
    fontWeight: '800',
    color: colors.onSurface,
    paddingHorizontal: 10,
    paddingVertical: 10,
    textAlign: 'center',
  },
  cardInputFocused: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
  },
  cardUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    minWidth: 26,
  },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    paddingVertical: 17,
    borderRadius: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
