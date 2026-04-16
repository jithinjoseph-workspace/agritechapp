import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, LayoutAnimation, UIManager } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors';

import { DashboardScreen } from '../screens/DashboardScreen';
import { SensorScreen } from '../screens/SensorScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { GlobalHeader } from '../components/GlobalHeader';

const Tab = createBottomTabNavigator();

const IconPlaceholder = ({ name, color, isActive }: { name: string, color: string, isActive: boolean }) => (
  <Text style={{ color, fontSize: 24, fontWeight: 'bold' }}>
    {name === 'dashboard' ? '📊' : 
     name === 'sensors' ? '🎛️' : 
     name === 'psychology' ? '🧠' : 
     name === 'person' ? '👤' : ''}
  </Text>
);

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.bottomNav}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        
        let iconName = '';
        if (route.name === 'DashboardTab') iconName = 'dashboard';
        else if (route.name === 'SensorTab') iconName = 'sensors';
        else if (route.name === 'InsightsTab') iconName = 'psychology';
        else if (route.name === 'ProfileTab') iconName = 'person';

        const onPress = () => {
          
          // Trigger smooth fluid animation for the active pill
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isFocused) {
          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.navItemActive}>
              <IconPlaceholder name={iconName} color={colors.onPrimary} isActive={true} />
              <Text style={styles.navTextActive}>{options.tabBarLabel || route.name.replace('Tab', '')}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={route.key} onPress={onPress} style={styles.navItem}>
            <IconPlaceholder name={iconName} color="rgba(1, 45, 29, 0.6)" isActive={false} />
            <Text style={styles.navText}>{options.tabBarLabel || route.name.replace('Tab', '')}</Text>
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
        header: () => <GlobalHeader />
      }}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="SensorTab" component={SensorScreen} options={{ tabBarLabel: 'Sensors' }} />
      <Tab.Screen name="InsightsTab" component={HistoryScreen} options={{ tabBarLabel: 'Insights' }} />
      <Tab.Screen name="ProfileTab" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(1, 45, 29, 0.6)',
    marginTop: 4,
  },
  navItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#064e3b', // emerald-900
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  navTextActive: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.onPrimary,
    marginTop: 4,
  }
});
