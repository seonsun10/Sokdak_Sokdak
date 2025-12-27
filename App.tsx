import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen, MainScreen, QuestionListScreen, QuestionDetailScreen, WriteQuestionScreen, LoginScreen, ProfileScreen, SettingsScreen } from './src/screens';
import { supabase } from './src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import { useUserStore } from './src/store/useUserStore';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchProfile = useUserStore((state) => state.fetchProfile);
  const url = Linking.useURL();

  // 1. 초기 세션 및 딥링크 처리
  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
      setIsLoading(false); // Keep this for the initial splash screen logic
    });

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("📡 Auth Event:", _event);
      setSession(session);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      }
    });

    // 딥링크 이벤트 리스너 통합 (가장 안정적인 방식)
    const linkingSubscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // 앱이 완전히 꺼져있다가 딥링크로 켜진 경우 처리
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });

    // 안드로이드 dismiss/유실 대응 fallback (AppState 리스너)
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // 복귀 후 약간의 지연 시간을 두어 서버 처리를 기다림
        setTimeout(async () => {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession) setSession(currentSession);
        }, 2000);
      }
    });

    return () => {
      subscription.unsubscribe();
      linkingSubscription.remove();
      appStateSubscription.remove();
    };
  }, []);

  const handleDeepLink = async (url: string | null) => {
    if (!url) return;
    
    try {
      const normalizedUrl = url.replace('#', '?');
      const parsedUrl = new URL(normalizedUrl);
      const searchParams = parsedUrl.searchParams;

      const access_token = searchParams.get('access_token');
      const refresh_token = searchParams.get('refresh_token');
      const code = searchParams.get('code');
      const error = searchParams.get('error') || searchParams.get('error_description');

      if (error) console.error("❌ Auth Error:", error);

      if (access_token && refresh_token) {
        const { error: setSessionError } = await supabase.auth.setSession({ access_token, refresh_token });
        if (setSessionError) console.error("❌ setSession Error:", setSessionError.message);
      } else if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("❌ exchangeCode Error:", exchangeError.message);
        } else if (data.session) {
          setSession(data.session);
        }
      }
    } catch (err) {
      console.error("❗ Deep link error:", err);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!session ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <>
              <Stack.Screen name="Main" component={MainScreen} />
              <Stack.Screen name="QuestionList" component={QuestionListScreen} />
              <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} />
              <Stack.Screen name="WriteQuestion" component={WriteQuestionScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
