import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, AppState, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen, MainScreen, QuestionListScreen, QuestionDetailScreen, WriteQuestionScreen, LoginScreen, ProfileScreen, SettingsScreen } from './src/screens';
import { supabase } from './src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import { useUserStore } from './src/store/useUserStore';
import { handleAuthRedirect } from './src/utils/auth';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { session, setSession, fetchProfile } = useUserStore();
  const url = Linking.useURL();
  
  // 0. 딥링크 변화 감지 (로그인 후 복귀 시 필수)
  useEffect(() => {
    if (url) handleAuthRedirect(url);
  }, [url]);

  // 1. 초기 세션 및 딥링크 처리
  useEffect(() => {
    // 세션 체크와 최소 로딩 시간(2초)을 동시에 실행
    const initializeApp = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timerPromise = new Promise(resolve => setTimeout(resolve, 3000));

        const [sessionResult] = await Promise.all([sessionPromise, timerPromise]);
        const initSession = sessionResult.data.session;

        if (initSession) {
          setSession(initSession);
          await fetchProfile(initSession.user.id);
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
        setSession(newSession);
        if (newSession?.user?.id) {
          fetchProfile(newSession.user.id);
        }
      } else if (_event === 'SIGNED_OUT') {
        setSession(null);
      }
    });

    // useURL이 이미 변화를 감지하므로 중복 이벤트 리스너 제거


    // 앱이 꺼져 있다가 킨 경우를 위한 초기 URL 수동 체크
    Linking.getInitialURL().then(initialUrl => {
      if (initialUrl) handleAuthRedirect(initialUrl);
    });

    // 안드로이드 dismiss 대응 fallback (심플화)
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        setTimeout(async () => {
          const { data: { session: s } } = await supabase.auth.getSession();
          if (s) {
            setSession(s);
            fetchProfile(s.user.id);
          }
        }, 1500);
      }
    });

    return () => {
      subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  // handleDeepLink는 handleAuthRedirect로 대체되었습니다.


  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9FA" translucent />
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
