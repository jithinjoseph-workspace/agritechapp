import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from './src/navigation/types';
import { LoginScreen } from './src/screens/LoginScreen';
import { BottomTabs } from './src/navigation/BottomTabs';
import { ReminderProvider } from './src/context/ReminderContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { FarmProvider, useFarm } from './src/context/FarmContext';
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigation(): React.JSX.Element {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { refreshFarmData, isLoading: isFarmLoading, farmData } = useFarm();

  useEffect(() => {
    // Determine the user_id from the authenticated user object
    const userId = user?.user_id || user?.id || '11111111-1111-1111-1111-111111111111';

    if (isAuthenticated && userId && !farmData && !isFarmLoading) {
      refreshFarmData(userId);
    }
  }, [isAuthenticated, user, farmData, isFarmLoading]);

  if (isAuthLoading || (isAuthenticated && !farmData)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface }
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="MainTabs" component={BottomTabs} />
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

export default App;
