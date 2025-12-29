import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar, Image } from 'react-native';
import { theme } from '../styles/theme';
import { styles } from './styles/SplashScreen.styles';

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
            <View style={styles.logoContainer}>
                <Image 
                    source={require('../../assets/splash_bg.png')} 
                    style={styles.logoImage}
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

