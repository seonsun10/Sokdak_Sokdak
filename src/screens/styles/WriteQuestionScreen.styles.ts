import { StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        padding: theme.spacing.xs,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    completeButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.full,
    },
    completeButtonText: {
        color: theme.colors.surface,
        fontWeight: 'bold',
        fontSize: 14,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: theme.spacing.lg,
    },
    inputSection: {
        marginBottom: theme.spacing.xl,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    errorLabel: {
        color: theme.colors.primary,
    },
    titleInput: {
        fontSize: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    contentInputContainer: {
        position: 'relative',
    },
    contentInput: {
        fontSize: 16,
        minHeight: 200,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        paddingBottom: 40,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    charCount: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        fontSize: 12,
        color: theme.colors.textLight,
    },
    charCountMax: {
        color: theme.colors.hot,
        fontWeight: 'bold',
    },
    inputError: {
        borderColor: theme.colors.hot,
        borderWidth: 1.5,
    },
    inputFocused: {
        borderColor: theme.colors.primary,
        borderWidth: 1.5,
    },
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagInput: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: 14,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    disabledInput: {
        backgroundColor: theme.colors.primaryLight,
        borderColor: theme.colors.border,
    },
    tagList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    tagBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
        gap: 4,
    },
    tagText: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '600',
    },
});
