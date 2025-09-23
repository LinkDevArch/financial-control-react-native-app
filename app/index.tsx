import { useEffect } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { View, ActivityIndicator, Text } from 'react-native';

export default function IndexPage() {
  const { authState, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (authState.authenticated) {
        setTimeout(() => {
          router.replace('/(protected)/(tabs)/');
        }, 100);
      } else {
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 100);
      }
    }
  }, [loading, authState.authenticated, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Verificando sesión...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 10, fontSize: 16 }}>
        {authState.authenticated ? 'Accediendo...' : 'Redirigiendo...'}
      </Text>
    </View>
  );
}
