import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = () => {
    const [loading, setLoading] = useState(false);

    const handleSocialLogin = async (provider: 'google' | 'kakao') => {
        setLoading(true);
        try {
            // 안드로이드/카카오톡 호환성을 위해 경로를 다시 추가
            const redirectUrl = AuthSession.makeRedirectUri({
                path: 'auth/callback',
            });
            console.log("Supabase에 등록할 정확한 URL:", redirectUrl);
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                    // [핵심] 카카오 KOE205 에러 방지: 빈 문자열로 설정하여 기본 범위를 무효화하고 queryParams로 강제 지정
                    scopes: provider === 'kakao' ? '' : undefined,
                    queryParams: provider === 'kakao' ? {
                        scope: 'profile_nickname',
                        prompt: 'login' // 다른 계정으로 로그인 가능하도록 강제
                    } : {
                        prompt: 'select_account' // 구글도 계정 선택 화면이 뜨도록
                    },
                },
            });

            if (error) throw error;
            if (!data?.url) throw new Error('인증 URL을 생성할 수 없습니다.');

            // 브라우저 세션 열기
            await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
            // 결과 처리는 App.tsx의 전역 딥링크 리스너에서 통합 처리됩니다.
            
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: -30,
    },
    logoImage: {
        width: 320,
        height: 320,
        marginBottom: 0,
    },
    buttonIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    buttonSection: {
        gap: 12,
    },
    loginButton: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    kakaoButton: {
        backgroundColor: '#FEE500',
    },
    kakaoButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    googleButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    googleButtonText: {
        color: '#757575',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
