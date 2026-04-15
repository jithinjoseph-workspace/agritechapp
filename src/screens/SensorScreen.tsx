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

const SensorCard = ({ iconName, tag, label, defaultValue, unit }: any) => (
  <View style={styles.cardContainer}>
    <View style={styles.cardHeader}>
      <IconPlaceholder name={iconName} color={colors.secondary} size={20} />
      <Text style={styles.cardTag}>{tag}</Text>
    </View>
    <Text style={styles.cardLabel}>{label}</Text>
    <View style={styles.inputRow}>
      <TextInput 
        style={styles.cardInput} 
        defaultValue={defaultValue}
        keyboardType="numeric"
        placeholderTextColor={colors.outlineVariant}
      />
      <Text style={styles.cardUnit}>{unit}</Text>
    </View>
  </View>
);

export const SensorScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      {/* Main Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>Sensor Input</Text>
          <Text style={styles.screenDescription}>
            Record manual observations or sync from connected IoT nodes for precise field analysis.
          </Text>
        </View>

        {/* Bento Grid */}
        <View style={styles.grid}>
          <SensorCard iconName="science" tag="REAL-TIME" label="pH Level" defaultValue="6.5" unit="pH" />
          <SensorCard iconName="thermostat" tag="THERMAL" label="Plant Temperature" defaultValue="24.0" unit="°C" />
          <SensorCard iconName="water_drop" tag="VOLUMETRIC" label="Soil Moisture" defaultValue="42" unit="%" />
          <SensorCard iconName="light_mode" tag="PAR" label="Sunlight Intensity" defaultValue="850" unit="W/m²" />
          <SensorCard iconName="humidity_mid" tag="ATMOSPHERE" label="Air Humidity" defaultValue="60" unit="%" />
          <SensorCard iconName="compost" tag="NUTRIENTS" label="Soil Fertility" defaultValue="78" unit="EC" />
        </View>

        {/* Call to Action */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.syncButton} activeOpacity={0.8}>
            <IconPlaceholder name="sync" color={colors.onPrimary} size={20} />
            <Text style={styles.syncButtonText}>Sync & Update</Text>
          </TouchableOpacity>
          <Text style={styles.lastSyncedText}>LAST SYNCED: 14:22 PM • STATION A-12</Text>
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
  lastSyncedText: {
    marginTop: 16,
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.onSurfaceVariant,
  },
});
