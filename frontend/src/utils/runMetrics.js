const EARTH_RADIUS_METERS = 6371000;

function toRadians(value) {
    return (value * Math.PI) / 180;
}

export function getDistanceBetweenCoords(start, end) {
    if (!start || !end) {
        return 0;
    }

    const latitudeDelta = toRadians(end.latitude - start.latitude);
    const longitudeDelta = toRadians(end.longitude - start.longitude);
    const startLatitude = toRadians(start.latitude);
    const endLatitude = toRadians(end.latitude);

    const a =
        Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
        Math.cos(startLatitude) *
            Math.cos(endLatitude) *
            Math.sin(longitudeDelta / 2) *
            Math.sin(longitudeDelta / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_METERS * c;
}

export function metersToKilometers(value) {
    return value / 1000;
}

export function formatDistance(meters) {
    return `${metersToKilometers(meters).toFixed(2)} km`;
}

export function formatDuration(totalSeconds) {
    const safeValue = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(safeValue / 3600);
    const minutes = Math.floor((safeValue % 3600) / 60);
    const seconds = safeValue % 60;

    if (hours > 0) {
        return [hours, minutes, seconds]
            .map((value) => String(value).padStart(2, '0'))
            .join(':');
    }

    return [minutes, seconds]
        .map((value) => String(value).padStart(2, '0'))
        .join(':');
}

export function metersPerSecondToKmh(speedInMetersPerSecond) {
    if (!Number.isFinite(speedInMetersPerSecond) || speedInMetersPerSecond <= 0) {
        return 0;
    }

    return speedInMetersPerSecond * 3.6;
}

export function getAverageSpeedKmh(distanceMeters, durationSeconds) {
    if (!durationSeconds) {
        return 0;
    }

    return metersToKilometers(distanceMeters) / (durationSeconds / 3600);
}

export function getMapRegionForCoordinate(coordinate) {
    if (!coordinate) {
        return null;
    }

    return {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
    };
}

export function buildPointId(runId, timestamp, latitude, longitude) {
    return `${runId}-${timestamp}-${latitude.toFixed(6)}-${longitude.toFixed(6)}`;
}
