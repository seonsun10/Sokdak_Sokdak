import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar, Image } from 'react-native';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

export const SplashScreen = () => {
    const textFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(textFadeAnim, {
            toValue: 1,
            duration: 800,
            delay: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
            <View style={styles.logoContainer}>
                <Image 
                    source={require('../../assets/splash_bg.png')} 
                    style={styles.logoImage}
                    resizeMode="contain"
                />
                <Image 
                    source={require('../../assets/sokdak_logo_bg_x.png')} 
                    style={styles.brandLogoImage}
                    resizeMode="contain"
                />
            </View>
            
            <Animated.View style={[styles.footer, { opacity: textFadeAnim }]}>
                <Text style={styles.loadingText}>당신만의 따뜻한 공간을 준비하고 있어요</Text>
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar} />
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoImage: {
        width: 360,
        height: 360,
        marginBottom: 20,
    },
    brandLogoImage: {
        width: 180,
        height: 60,
        marginTop: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 100,
        alignItems: 'center',
        width: '100%',
    },
    loadingText: {
        color: theme.colors.textLight,
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 16,
    },
    progressBarContainer: {
        width: width * 0.5,
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        width: '60%', // 정적 표시, 실제 로딩 진행률 연동 가능
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
    },
});
