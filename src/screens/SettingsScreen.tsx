import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { CustomModal } from '../components/CustomModal';
import { useUserStore } from '../store/useUserStore';
import { styles } from './styles/SettingsScreen.styles';

export const SettingsScreen = () => {
    const navigation = useNavigation<any>();
    const clearProfile = useUserStore((state) => state.clearProfile);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [modalConfig, setModalConfig] = React.useState({
        title: '',
        message: '',
        confirmText: '확인',
        cancelText: '',
        onConfirm: () => setModalVisible(false),
        onCancel: undefined as (() => void) | undefined
    });

    const showInfoModal = (title: string, message: string) => {
        setModalConfig({
            title,
            message,
            confirmText: '확인',
            cancelText: '',
            onConfirm: () => setModalVisible(false),
            onCancel: undefined
        });
        setModalVisible(true);
    };

    const handleLogoutPress = () => {
        setModalConfig({
            title: '로그아웃',
            message: '정말 로그아웃 하시겠습니까?',
            confirmText: '로그아웃',
            cancelText: '취소',
            onConfirm: async () => {
                setModalVisible(false);
                const { error } = await supabase.auth.signOut();
                if (!error) {
                    clearProfile();
                } else {
                    showInfoModal('오류', '로그아웃 중 오류가 발생했습니다.');
                }
            },
            onCancel: () => setModalVisible(false)
        });
        setModalVisible(true);
    };

    const renderSettingItem = (icon: any, title: string, onPress: () => void, color: string = theme.colors.text) => (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <View style={styles.itemLeft}>
                <Ionicons name={icon} size={22} color={color} />
                <Text style={[styles.itemText, { color }]}>{title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CCC" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeftButton}>
                    <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>설정</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>계정 설정</Text>
                    {renderSettingItem('log-out-outline', '로그아웃', handleLogoutPress, '#FF4D4D')}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>앱 정보 및 안내</Text>
                    {renderSettingItem('document-text-outline', '이용약관', () => showInfoModal('안내', '준비 중입니다.'))}
                    {renderSettingItem('shield-checkmark-outline', '개인정보 처리방침', () => showInfoModal('안내', '준비 중입니다.'))}
                    {renderSettingItem('information-circle-outline', '개인정보 제공 동의 내역', () => showInfoModal('안내', '준비 중입니다.'))}
                </View>

                <View style={styles.versionInfo}>
                    <Text style={styles.versionText}>앱 버전 1.0.0</Text>
                </View>
            </ScrollView>

            <CustomModal
                visible={modalVisible}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
                onConfirm={modalConfig.onConfirm}
                onCancel={modalConfig.onCancel}
            />
        </SafeAreaView>
    );
};

