import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    Dimensions,
    TouchableWithoutFeedback
} from 'react-native';
import { theme } from '../styles/theme';

interface CustomModalProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

const { width } = Dimensions.get('window');

export const CustomModal = ({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = '확인',
    cancelText = '취소'
}: CustomModalProps) => {
    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
        >
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.message}>{message}</Text>
                            
                            <View style={styles.buttonContainer}>
                                {onCancel && (
                                    <Pressable 
                                        style={({ pressed }) => [
                                            styles.button, 
                                            styles.cancelButton,
                                            pressed && styles.cancelButtonActive
                                        ]} 
                                        onPress={onCancel}
                                    >
                                        {({ pressed }) => (
                                            <Text style={[
                                                styles.cancelButtonText,
                                                pressed && styles.cancelButtonTextActive
                                            ]}>
                                                {cancelText}
                                            </Text>
                                        )}
                                    </Pressable>
                                )}
                                <Pressable 
                                    style={({ pressed }) => [
                                        styles.button, 
                                        styles.confirmButton,
                                        pressed && styles.confirmButtonActive
                                    ]} 
                                    onPress={onConfirm}
                                >
                                    {({ pressed }) => (
                                        <Text style={[
                                            styles.confirmButtonText,
                                            pressed && styles.confirmButtonTextActive
                                        ]}>
                                            {confirmText}
                                        </Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.8,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: theme.colors.textLight,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
    },
    confirmButtonActive: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.primary,
    },
    confirmButtonText: {
        color: theme.colors.surface,
        fontWeight: 'bold',
        fontSize: 15,
    },
    confirmButtonTextActive: {
        color: theme.colors.primary,
    },
    cancelButton: {
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.border,
    },
    cancelButtonActive: {
        backgroundColor: theme.colors.border,
    },
    cancelButtonText: {
        color: theme.colors.textLight,
        fontWeight: '600',
        fontSize: 15,
    },
    cancelButtonTextActive: {
        color: theme.colors.text,
    },
});
