import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { handleAuthRedirect } from '../utils/auth';
import { styles } from './styles/LoginScreen.styles';

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = () => {
    const [loading, setLoading] = useState(false);

    const handleSocialLogin = async (provider: 'google' | 'kakao') => {
        setLoading(true);
        try {
            const redirectUrl = AuthSession.makeRedirectUri({
                path: 'auth/callback',
            });
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                    scopes: provider === 'kakao' ? '' : undefined,
                    queryParams: provider === 'kakao' ? {
                        scope: 'profile_nickname',
                        prompt: 'login'
                    } : {
                        prompt: 'select_account'
                    },
                },
            });

            if (error) throw error;
            if (!data?.url) throw new Error('인증 URL을 생성할 수 없습니다.');

            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
            
            if (result.type === 'success' && result.url) {
                await handleAuthRedirect(result.url);
            }
        } catch (error: any) {
            Alert.alert('로그인 오류', error.message || '로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoSection}>
                    <Image 
                        source={require('../../assets/sokdak_logo_bg_x.png')} 
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={[styles.loginButton, styles.kakaoButton]}
                        onPress={() => handleSocialLogin('kakao')}
                        disabled={loading}
                    >
                        <Image 
                            source={require('../../assets/icon_kakao.png')} 
                            style={styles.buttonIcon} 
                        />
                        <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.loginButton, styles.googleButton]}
                        onPress={() => handleSocialLogin('google')}
                        disabled={loading}
                    >
                        <Image 
                            source={require('../../assets/icon_google.png')} 
                            style={styles.buttonIcon} 
                        />
                        <Text style={styles.googleButtonText}>Google로 시작하기</Text>
                    </TouchableOpacity>
                </View>

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};
