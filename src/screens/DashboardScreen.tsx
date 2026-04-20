import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useFarm } from '../context/FarmContext';
import { AppIcon } from '../components/AppIcon';

const SENSOR_META: Record<
  string,
  {
    icon: 'moisture' | 'temperature' | 'humidity' | 'ph' | 'sunlight' | 'fertility';
    label: string;
  }
> = {
  soil_moisture: { icon: 'moisture', label: 'Soil moisture' },
  soil_temperature: { icon: 'temperature', label: 'Soil temperature' },
  humidity: { icon: 'humidity', label: 'Humidity' },
  ph_level: { icon: 'ph', label: 'pH level' },
  sunlight: { icon: 'sunlight', label: 'Sunlight' },
  fertility: { icon: 'fertility', label: 'Fertility' },
};

const DisplayStatCard = ({ sensorType, value, status }: any) => {
  const meta = SENSOR_META[sensorType];

  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <AppIcon
          name={meta.icon}
          size={18}
          color={colors.primary}
          backgroundColor={colors.primaryContainer}
          style={styles.statIcon}
        />
        <Text style={styles.statName}>{meta.label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statusRow}>
        <AppIcon name="check" size={13} color={colors.secondary} backgroundColor={colors.surfaceContainer} />
        <Text style={styles.statStatus}>{status}</Text>
      </View>
    </View>
  );
};

export const DashboardScreen = () => {
  const { activeBlock, refreshActiveBlockSensors } = useFarm();

  useFocusEffect(
    useCallback(() => {
      if (activeBlock) {
        refreshActiveBlockSensors(activeBlock.block_id);
      }
    }, [activeBlock, refreshActiveBlockSensors]),
  );

  if (!activeBlock) {
    return null;
  }

  const getSensorData = (sensorType: string) => {
    return activeBlock.sensors.sensors.find(sensor => sensor.sensor_type === sensorType);
  };

  const formatValue = (sensorType: string, fallback: string) => {
    const sensor = getSensorData(sensorType);
    if (!sensor) {
      return fallback;
    }

    return `${sensor.value} ${sensor.unit}`.trim();
  };

  const formatStatus = (sensorType: string, fallback: string) => {
    return getSensorData(sensorType)?.status || fallback;
  };

  const statOrder = [
    'soil_moisture',
    'soil_temperature',
    'humidity',
    'ph_level',
    'sunlight',
    'fertility',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.sectionDescription}>
            Latest readings for the selected block, refreshed whenever this dashboard becomes active.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryEyebrow}>Selected block</Text>
          <Text style={styles.summaryTitle}>{activeBlock.lanslu}</Text>
          <Text style={styles.summaryMeta}>
            {activeBlock.crop} | {activeBlock.area_ha} ha
          </Text>
          <Text style={styles.summaryDescription}>{activeBlock.description || 'Operational monitoring block.'}</Text>
        </View>

        <View style={styles.quickStatsGrid}>
          {statOrder.map(sensorType => (
            <DisplayStatCard
              key={sensorType}
              sensorType={sensorType}
              value={formatValue(sensorType, 'N/A')}
              status={formatStatus(sensorType, 'Normal')}
            />
          ))}
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
    paddingTop: 20,
    paddingBottom: 120,
  },
  sectionHeader: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onSurface,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: colors.onSurfaceVariant,
  },
  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
  },
  summaryEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.72)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.onPrimary,
  },
  summaryMeta: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.82)',
  },
  summaryDescription: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.82)',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 18,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  statIcon: {
    marginRight: 10,
  },
  statName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statStatus: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
  },
});
