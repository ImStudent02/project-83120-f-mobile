import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { AuthScreen, HomeScreen, ChatScreen } from './src/screens';
import { useAuthStore } from './src/stores/authStore';
import { useAppStore } from './src/stores/appStore';

const Stack = createNativeStackNavigator();

export default function App() {
  const { isAuthenticated, initialize: initAuth } = useAuthStore();
  const { loadFromStorage: initApp } = useAppStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initAuth();
      await initApp();
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4a9eff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0a0a' },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
});
