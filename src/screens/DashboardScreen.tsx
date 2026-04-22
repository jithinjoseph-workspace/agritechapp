import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useFarm } from '../context/FarmContext';
import { AppIcon } from '../components/AppIcon';
import { getBlockDisplayName } from '../utils/blockDisplay';

const SENSOR_META: Record<
  string,
  { icon: 'moisture' | 'temperature' | 'humidity' | 'ph' | 'sunlight' | 'fertility'; label: string }
> = {
  soil_moisture:   { icon: 'moisture',    label: 'Soil Moisture'   },
  soil_temperature:{ icon: 'temperature', label: 'Soil Temp.'      },
  humidity:        { icon: 'humidity',    label: 'Humidity'        },
  ph_level:        { icon: 'ph',          label: 'pH Level'        },
  sunlight:        { icon: 'sunlight',    label: 'Sunlight'        },
  fertility:       { icon: 'fertility',   label: 'Fertility'       },
};

const isNormal = (status: string) =>
  status?.toLowerCase() === 'normal';

const DisplayStatCard = ({ sensorType, value, status }: any) => {
  const meta = SENSOR_META[sensorType];
  const good = isNormal(status);

  return (
    <View style={styles.statCard}>
      {/* Top row: icon + status badge */}
      <View style={styles.statTop}>
        <AppIcon
          name={meta.icon}
          size={16}
          color={colors.primary}
          backgroundColor={colors.primaryContainer}
        />
        <View style={[styles.statusBadge, good ? styles.statusGood : styles.statusWarn]}>
          <Text style={[styles.statusText, good ? styles.statusTextGood : styles.statusTextWarn]}>
            {status}
          </Text>
        </View>
      </View>
      {/* Value */}
      <Text style={styles.statValue}>{value}</Text>
      {/* Label */}
      <Text style={styles.statLabel}>{meta.label}</Text>
    </View>
  );
};

export const DashboardScreen = () => {
  const { farmData, activeBlock, refreshActiveBlockSensors } = useFarm();

  useFocusEffect(
    useCallback(() => {
      if (activeBlock) refreshActiveBlockSensors(activeBlock.block_id);
    }, [activeBlock, refreshActiveBlockSensors]),
  );

  if (!activeBlock) return null;

  const activeBlockName = getBlockDisplayName(farmData?.blocks, activeBlock);

  const getSensor = (type: string) =>
    activeBlock.sensors.sensors.find(s => s.sensor_type === type);

  const fmtValue = (type: string) => {
    const s = getSensor(type);
    return s ? `${s.value} ${s.unit}`.trim() : 'N/A';
  };

  const fmtStatus = (type: string) => getSensor(type)?.status || 'Normal';

  const statOrder = [
    'soil_moisture', 'soil_temperature',
    'humidity',      'ph_level',
    'sunlight',      'fertility',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Page label */}
        <Text style={styles.pageLabel}>Overview</Text>

        {/* Selected block hero card */}
        <View style={styles.heroCard}>
          {/* Decorative orb */}
          <View style={styles.heroOrb} />
          <Text style={styles.heroEyebrow}>Selected Block</Text>
          <Text style={styles.heroTitle}>{activeBlockName}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>{activeBlock.crop}</Text>
            </View>
            {!!activeBlock.area_ha && (
              <View style={[styles.heroPill, styles.heroPillOutline]}>
                <Text style={[styles.heroPillText, styles.heroPillTextOutline]}>
                  {activeBlock.area_ha} ha
                </Text>
              </View>
            )}
          </View>
          {!!activeBlock.description && (
            <Text style={styles.heroDesc}>{activeBlock.description}</Text>
          )}
        </View>

        {/* Section label */}
        <Text style={styles.sectionLabel}>Live Readings</Text>

        {/* Sensor grid */}
        <View style={styles.grid}>
          {statOrder.map(type => (
            <DisplayStatCard
              key={type}
              sensorType={type}
              value={fmtValue(type)}
              status={fmtStatus(type)}
            />
          ))}
        </View>
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
    marginBottom: 18,
    letterSpacing: 0.2,
  },

  /* Hero block card */
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -50,
    right: -40,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
    marginBottom: 14,
  },
  heroMeta: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  heroPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroPillOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  heroPillTextOutline: {
    color: 'rgba(255,255,255,0.85)',
  },
  heroDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 19,
  },

  /* Section label */
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 12,
    marginLeft: 2,
  },

  /* Stat grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#1f3b2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusGood: { backgroundColor: '#e6f4ec' },
  statusWarn: { backgroundColor: '#fef3f2' },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusTextGood: { color: '#1f7a3e' },
  statusTextWarn: { color: '#b42318' },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
});
