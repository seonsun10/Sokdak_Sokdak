import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                {/* 임시 로고 텍스트 */}
                <Text style={styles.logoText}>🌸</Text>
                <Text style={styles.brandName}>속닥속닥</Text>
            </View>
            <Text style={styles.loadingText}>속닥속닥, 우리들만의 이야기를 준비하는 중...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    logoText: {
        fontSize: 80,
        marginBottom: theme.spacing.sm,
    },
    brandName: {
        fontSize: 40,
        fontWeight: 'bold',
        color: theme.colors.surface,
    },
    loadingText: {
        color: theme.colors.surface,
        fontSize: 16,
        opacity: 0.9,
    },
});
