import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from './src/navigation/types';
import { LoginScreen } from './src/screens/LoginScreen';
import { BottomTabs } from './src/navigation/BottomTabs';
import { ReminderProvider } from './src/context/ReminderContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Navigation(): React.JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
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
      <ReminderProvider>
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </ReminderProvider>
    </AuthProvider>
  );
}

export default App;
