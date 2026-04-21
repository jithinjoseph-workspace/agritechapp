import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from './src/navigation/types';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { MappingScreen } from './src/screens/MappingScreen';
import { BottomTabs } from './src/navigation/BottomTabs';
import { ReminderProvider } from './src/context/ReminderContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { FarmProvider, useFarm } from './src/context/FarmContext';
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigation(): React.JSX.Element {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { refreshFarmData, isLoading: isFarmLoading, farmData } = useFarm();
  const userId = user?.user_id || user?.id || null;

  useEffect(() => {
    if (isAuthenticated && userId && !isFarmLoading && farmData?.user_id !== userId) {
      refreshFarmData(userId);
    }
  }, [farmData?.user_id, isAuthenticated, isFarmLoading, refreshFarmData, userId]);

  const isWaitingForFarmData = isAuthenticated && !!userId && farmData?.user_id !== userId;

  if (isAuthLoading || isWaitingForFarmData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="Mapping" component={MappingScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <FarmProvider>
        <ReminderProvider>
          <NavigationContainer>
            <Navigation />
          </NavigationContainer>
        </ReminderProvider>
      </FarmProvider>
    </AuthProvider>
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surface,
  },
};

export default App;
