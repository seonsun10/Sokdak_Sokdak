import { StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../styles/theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
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
    footer: {
        position: 'absolute',
        bottom: 250,
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
