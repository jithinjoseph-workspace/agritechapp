import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from './src/navigation/types';
import { LoginScreen } from './src/screens/LoginScreen';
import { BottomTabs } from './src/navigation/BottomTabs';
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
