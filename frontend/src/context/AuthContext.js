import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
    AUTH_LOGIN_ENDPOINT,
    AUTH_REGISTER_ENDPOINT,
    FRONTEND_TEST_MODE,
} from '../config/api';
import {
    clearAuthSession,
    loadAuthSession,
    saveAuthSession,
} from '../storage/appStorage';

const AuthContext = createContext(null);

function extractSessionFromResponse(data, fallbackEmail) {
    const token = data?.accessToken ?? data?.token ?? data?.jwt ?? null;
    const user = data?.user ?? {};
    const userId = user?.id ?? data?.userId ?? data?.sub ?? null;

    if (!token || !userId) {
        throw new Error(
            'La reponse du back-end doit contenir un token JWT et un userId.'
        );
    }

    return {
        token,
        userId: String(userId),
        email: user?.email ?? fallbackEmail,
        name: user?.name ?? null,
    };
}

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [isBootstrapping, setIsBootstrapping] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function bootstrapSession() {
            try {
                let savedSession = await loadAuthSession();
                
                if (savedSession?.token) {
                    try {
                        const decoded = jwtDecode(savedSession.token);
                        const currentTime = Date.now() / 1000;
                        if (decoded.exp && decoded.exp < currentTime) {
                            console.log("JWT Expired. Clearing session.");
                            await clearAuthSession();
                            savedSession = null;
                        }
                    } catch (e) {
                         console.warn("Invalid JWT format", e);
                         await clearAuthSession();
                         savedSession = null;
                    }
                }

                if (isMounted) {
                    setSession(savedSession);
                }
            } finally {
                if (isMounted) {
                    setIsBootstrapping(false);
                }
            }
        }

        bootstrapSession();

        return () => {
            isMounted = false;
        };
    }, []);

    async function signIn({ email, password }) {
        if (FRONTEND_TEST_MODE) {
            // Mode front-end uniquement: on simule une session pour tester la navigation
            // et le tracking sans dependre du back-end NestJS.
            const nextSession = {
                token: 'frontend-test-token',
                userId: 'frontend-user',
                email: email || 'runner@demo.local',
                name: 'Demo Runner',
            };

            await saveAuthSession(nextSession);
            setSession(nextSession);
            return nextSession;
        }

        const response = await fetch(AUTH_LOGIN_ENDPOINT, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(
                data?.message ??
                    'Connexion impossible. Verifiez l URL de votre API NestJS.'
            );
        }

        const nextSession = extractSessionFromResponse(data, email);
        await saveAuthSession(nextSession);
        setSession(nextSession);
        return nextSession;
    }

    async function register({ name, email, password }) {
        if (FRONTEND_TEST_MODE) {
            // En mode front-end, on ne cree rien cote serveur.
            // On renvoie juste une reponse de succes pour tester les ecrans.
            return {
                success: true,
                user: {
                    id: 'frontend-user',
                    name: name || 'Demo Runner',
                    email: email || 'runner@demo.local',
                },
            };
        }

        const response = await fetch(AUTH_REGISTER_ENDPOINT, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(
                data?.message ??
                    'Inscription impossible. Verifiez l URL de votre API NestJS.'
            );
        }

        return data;
    }

    async function signOut() {
        await clearAuthSession();
        setSession(null);
    }

    const value = useMemo(
        () => ({
            session,
            isAuthenticated: Boolean(session?.token),
            isBootstrapping,
            signIn,
            register,
            signOut,
        }),
        [isBootstrapping, session]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return context;
}
