const fallbackBaseUrl = 'http://192.168.1.100:3000';

// Passez cette valeur a false quand vous voudrez reconnecter le front au back-end.
// En mode front-end, l authentification et la synchronisation GPS sont simulees localement.
export const FRONTEND_TEST_MODE = true;

export const API_BASE_URL = (
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    fallbackBaseUrl
).replace(/\/$/, '');

export const AUTH_LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`;
export const AUTH_REGISTER_ENDPOINT = `${API_BASE_URL}/auth/register`;
export const TRACKING_BULK_ENDPOINT = `${API_BASE_URL}/tracking/points/bulk`;
