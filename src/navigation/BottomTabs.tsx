import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';
import { BottomTabParamList } from './types';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SensorScreen } from '../screens/SensorScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { GlobalHeader } from '../components/GlobalHeader';
import { AppIcon } from '../components/AppIcon';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const routeIconMap: Record<string, 'dashboard' | 'sensors' | 'history' | 'settings'> = {
  DashboardTab: 'dashboard',
  SensorTab: 'sensors',
  InsightsTab: 'history',
  ProfileTab: 'settings',
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.bottomNav}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const iconName = routeIconMap[route.name];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[styles.navItem, isFocused && styles.navItemActive]}
            activeOpacity={0.85}
          >
            <AppIcon
              name={iconName}
              size={18}
              color={isFocused ? colors.onPrimary : colors.onSurfaceVariant}
              backgroundColor={isFocused ? 'rgba(255,255,255,0.14)' : colors.surfaceContainer}
              style={styles.navIcon}
            />
            <Text style={[styles.navText, isFocused && styles.navTextActive]}>
              {options.tabBarLabel || route.name.replace('Tab', '')}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const BottomTabs = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        header: () => <GlobalHeader />,
      }}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="SensorTab" component={SensorScreen} options={{ tabBarLabel: 'Sensors' }} />
      <Tab.Screen name="InsightsTab" component={HistoryScreen} options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="ProfileTab" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 18,
    gap: 6,
  },
  navItemActive: {
    backgroundColor: colors.primary,
  },
  navIcon: {
    borderRadius: 10,
  },
  navText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  navTextActive: {
    color: colors.onPrimary,
  },
});
