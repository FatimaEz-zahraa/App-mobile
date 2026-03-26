import React, { useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();

    const handleRegister = async () => {
        setError('');
        setIsSubmitting(true);

        try {
            await register({ name, email, password });
            navigation.navigate('Login');
        } catch (registerError) {
            setError(registerError.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <Text style={styles.title}>Register</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        placeholderTextColor={colors.muted}
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={colors.muted}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
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
                        onPress={handleRegister}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={colors.text} />
                        ) : (
                            <Text style={styles.buttonText}>Register</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Already have an account? Login</Text>
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: spacing.large },
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
    linkText: { color: colors.secondary, textAlign: 'center', marginTop: spacing.medium },
});
