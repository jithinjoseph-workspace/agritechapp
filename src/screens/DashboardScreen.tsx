import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useFarm } from '../context/FarmContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const IconPlaceholder = ({ name, color, size }: { name: string, color: string, size: number }) => (
  <Text style={{ color, fontSize: size, fontWeight: 'bold' }}>
    {name === 'grid_view' ? '☰' : 
     name === 'expand_more' ? '🔽' : 
     name === 'location_on' ? '📍' : 
     name === 'warning' ? '⚠️' : 
     name === 'water_drop' ? '💧' : 
     name === 'water_ph' ? '🧪' : 
     name === 'trending_down' ? '📉' : 
     name === 'device_thermostat' ? '🌡️' : 
     name === 'trending_up' ? '📈' : 
     name === 'humidity_low' ? '💨' : 
     name === 'remove' ? '➖' : 
     name === 'science' ? '⚗️' : 
     name === 'compost' ? '🌱' : 
     name === 'check_circle' ? '✅' : 
     name === 'arrow_forward' ? '➡️' : 
     name === 'cloudy_snowing' ? '🌧️' : 
     name === 'wb_sunny' ? '☀️' : 
     name === 'partly_cloudy_day' ? '⛅' : 
     name === 'cloud' ? '☁️' : 
     name === 'rainy' ? '🌧️' : 
     name === 'dashboard' ? '📊' : 
     name === 'sensors' ? '🎛️' : 
     name === 'psychology' ? '🧠' : 
     name === 'person' ? '👤' : ''}
  </Text>
);

const DisplayStatCard = ({ iconName, iconBg, iconColor, title, value, changeText, changeIcon, isError }: any) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <View style={{ backgroundColor: iconBg, padding: 8, borderRadius: 8 }}>
        <IconPlaceholder name={iconName} color={iconColor} size={18} />
      </View>
      <Text style={styles.statName}>{title}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <View style={styles.changeTextRow}>
       <IconPlaceholder name={changeIcon} color={isError ? colors.error : colors.secondary} size={12} />
       <Text style={isError ? styles.statChangeError : styles.statChangeNeutral}>{changeText}</Text>
    </View>
  </View>
);

// Removed BlockCard component

export const DashboardScreen = ({ navigation }: any) => {
  const { activeBlock, isLoading, refreshActiveBlockSensors } = useFarm();

  // Smart Refresh: Fetch latest sensors every time the user looks at the Dashboard
  useFocusEffect(
    useCallback(() => {
      if (activeBlock) {
        console.log('🔄 [Dashboard] Auto-refreshing sensor data...');
        refreshActiveBlockSensors(activeBlock.block_id);
      }
    }, [activeBlock?.block_id])
  );

  if (!activeBlock) return null;

  const getSensorData = (sensorType: string) => {
    return activeBlock.sensors.sensors.find(s => s.sensor_type === sensorType);
  };

  const formatValue = (sensorType: string, dummyValue: string) => {
    const sensor = getSensorData(sensorType);
    if (!sensor) return dummyValue;
    return `${sensor.value} ${sensor.unit}`.trim();
  };

  const formatStatus = (sensorType: string, fallback: string) => {
    return getSensorData(sensorType)?.status || fallback;
  };

  // DEBUG: Log the data being displayed
  console.warn(`📊 [Dashboard] Rendering Stat Cards for: ${activeBlock.lanslu}`);
  console.log('   💧 Moisture:', formatValue('soil_moisture', 'N/A'));
  console.log('   🌡️ Temp:', formatValue('soil_temperature', 'N/A'));
  console.log('   🧪 pH:', formatValue('ph_level', 'N/A'));
  console.log('   💨 Humid:', formatValue('humidity', 'N/A'));
  console.log('   ☀️ Sunlight:', formatValue('sunlight', 'N/A'));
  console.log('   🌱 Fertility:', formatValue('fertility', 'N/A'));

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Quick Stats Bento Grid - All Sensors Display */}
        <View style={styles.quickStatsGrid}>
          <DisplayStatCard 
            iconName="water_drop" iconBg="rgba(1, 45, 29, 0.1)" iconColor={colors.primary}
            title="MOISTURE" value={formatValue('soil_moisture', '25 %')} changeText={formatStatus('soil_moisture', 'Normal')} changeIcon="check_circle" isError={false} 
          />
          <DisplayStatCard 
            iconName="device_thermostat" iconBg="rgba(0, 108, 72, 0.1)" iconColor={colors.secondary}
            title="TEMP" value={formatValue('soil_temperature', '22 C')} changeText={formatStatus('soil_temperature', 'Normal')} changeIcon="check_circle" isError={false} 
          />
          <DisplayStatCard 
            iconName="humidity_low" iconBg="rgba(0, 69, 45, 0.1)" iconColor={colors.tertiary}
            title="HUMIDITY" value={formatValue('humidity', '45 %')} changeText={formatStatus('humidity', 'Normal')} changeIcon="remove" isError={false} 
          />
          <DisplayStatCard 
            iconName="science" iconBg="rgba(176, 241, 204, 0.4)" iconColor={colors.tertiary}
            title="pH LEVEL" value={formatValue('ph_level', '6.5 pH')} changeText={formatStatus('ph_level', 'Normal')} changeIcon="check_circle" isError={false} 
          />
          <DisplayStatCard 
            iconName="wb_sunny" iconBg="rgba(255, 218, 106, 0.2)" iconColor="#D97706"
            title="SUNLIGHT" value={formatValue('sunlight', '850 W/m2')} changeText={formatStatus('sunlight', 'Normal')} changeIcon="wb_sunny" isError={false} 
          />
          <DisplayStatCard 
            iconName="compost" iconBg="rgba(1, 45, 29, 0.1)" iconColor={colors.primary}
            title="FERTILITY" value={formatValue('fertility', '1.6 EC')} changeText={formatStatus('fertility', 'Normal')} changeIcon="check_circle" isError={false} 
          />
          
          <View style={{height: 48, width: '100%'}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 120, gap: 32 },

  quickStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  statCard: { width: '47%', backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, padding: 24, elevation: 4 },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  statIconContainerPrimary: { backgroundColor: 'rgba(1, 45, 29, 0.1)', padding: 8, borderRadius: 8 },
  statIconContainerSecondary: { backgroundColor: 'rgba(0, 108, 72, 0.1)', padding: 8, borderRadius: 8 },
  statName: { fontSize: 11, fontWeight: 'bold', color: colors.onSurfaceVariant, flexShrink: 1, flexWrap: 'wrap' },
  statValue: { fontSize: 32, fontWeight: '900', color: colors.primary, marginBottom: 8 },
  changeTextRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statChangeError: { fontSize: 9, fontWeight: 'bold', color: colors.error, flexShrink: 1 },
  statChangeNeutral: { fontSize: 9, fontWeight: 'bold', color: colors.secondary, flexShrink: 1 },
});
