const fallbackBaseUrl = 'http://192.168.112.174:3000'; // 10.0.2.2 for Android emulator, 127.0.0.1 for iOS simulator, or your local IP for physical devices.

// Passez cette valeur a false quand vous voudrez reconnecter le front au back-end.
// En mode front-end, l authentification et la synchronisation GPS sont simulees localement.
export const FRONTEND_TEST_MODE = false;

export const API_BASE_URL = (
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    fallbackBaseUrl
).replace(/\/$/, '');

export const AUTH_LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`;
export const AUTH_REGISTER_ENDPOINT = `${API_BASE_URL}/auth/register`;
export const TRACKING_BULK_ENDPOINT = `${API_BASE_URL}/tracking/points/bulk`;

// Alias used across feature screens
export const API_URL = API_BASE_URL;
