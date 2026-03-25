import React, { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { API_BASE_URL, FRONTEND_TEST_MODE } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signIn } = useAuth();

    const handleLogin = async () => {
        setError('');
        setIsSubmitting(true);

        try {
            await signIn({ email, password });
        } catch (loginError) {
            setError(loginError.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color={colors.text} />
                ) : (
                    <Text style={styles.buttonText}>Login</Text>
                )}
            </TouchableOpacity>

            <Text style={styles.helperText}>
                {FRONTEND_TEST_MODE
                    ? 'Mode test front-end actif: connexion simulee localement.'
                    : `API NestJS: ${API_BASE_URL}`}
            </Text>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Create an account</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: spacing.large, backgroundColor: colors.background },
    title: { ...typography.heading, color: colors.text, marginBottom: spacing.large, textAlign: 'center' },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.medium,
        marginBottom: spacing.medium,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.text,
        fontSize: 16,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: spacing.medium,
        alignItems: 'center',
    },
    buttonText: { color: colors.text, fontWeight: '700', fontSize: 16 },
    errorText: { color: colors.danger, marginBottom: spacing.medium, textAlign: 'center' },
    helperText: { color: colors.muted, marginTop: spacing.medium, textAlign: 'center' },
    linkText: { color: colors.secondary, textAlign: 'center', marginTop: spacing.medium },
});
