"use client";

import { useEffect, useState } from 'react';
import fetchCurrentWeather, { type CurrentWeatherResponse } from '@/app/services/fetchCurrentWeather';
import fetchLocationName from '@/app/services/fetchLocationName';
import styles from '@/app/components/CurrentWeather.module.css';

type WeatherMood = 'clear' | 'hot' | 'cool' | 'cloudy' | 'rain' | 'storm';

const getWeatherMood = (temperature: number, condition: string): WeatherMood => {
    if (condition.includes('thunderstorm')) {
        return 'storm';
    }

    if (condition.includes('rain') || condition.includes('drizzle')) {
        return 'rain';
    }

    if (
        condition.includes('cloud') ||
        condition.includes('mist') ||
        condition.includes('fog') ||
        condition.includes('haze') ||
        condition.includes('smoke') ||
        condition.includes('dust')
    ) {
        return 'cloudy';
    }

    if (temperature >= 33) {
        return 'hot';
    }

    if (temperature <= 16) {
        return 'cool';
    }

    return 'clear';
};

const moodMeta: Record<WeatherMood, { label: string; icon: string; shellClass: string; fxClass: string }> = {
    clear: {
        label: 'Clear Sky',
        icon: '☀️',
        shellClass: styles.shellClear,
        fxClass: styles.fxClear,
    },
    hot: {
        label: 'Hot Day',
        icon: '🔥',
        shellClass: styles.shellHot,
        fxClass: styles.fxHot,
    },
    cool: {
        label: 'Cool Breeze',
        icon: '🍃',
        shellClass: styles.shellCool,
        fxClass: styles.fxCool,
    },
    cloudy: {
        label: 'Cloudy Mood',
        icon: '☁️',
        shellClass: styles.shellCloudy,
        fxClass: styles.fxCloudy,
    },
    rain: {
        label: 'Rainy Vibes',
        icon: '🌧️',
        shellClass: styles.shellRain,
        fxClass: styles.fxRain,
    },
    storm: {
        label: 'Storm Alert',
        icon: '⛈️',
        shellClass: styles.shellStorm,
        fxClass: styles.fxStorm,
    },
};

export default function CurrentWeather() {
    const [weather, setWeather] = useState<CurrentWeatherResponse | null>(null);
    const [locationName, setLocationName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        if (!('geolocation' in navigator)) {
            queueMicrotask(() => {
                if (!isActive) {
                    return;
                }

                setError('Geolocation is not supported by this browser.');
                setLoading(false);
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const coordinates = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };

                const [weatherData, locationLabel] = await Promise.all([
                    fetchCurrentWeather(coordinates),
                    fetchLocationName(coordinates),
                ]);

                if (!isActive) {
                    return;
                }

                if (!weatherData) {
                    setError('Could not load weather for your current location.');
                } else {
                    setWeather(weatherData);
                    setLocationName(locationLabel ?? weatherData.name);
                }

                setLoading(false);
            },
            (locationError) => {
                if (!isActive) {
                    return;
                }

                setError(locationError.message || 'Could not get your location.');
                setLoading(false);
            }
        );

        return () => {
            isActive = false;
        };
    }, []);

    if (loading) {
        return (
            <main className={styles.status}>
                <section className={styles.statusCard}>
                    <h2>Finding your local weather</h2>
                    <p className={styles.statusMuted}>Getting your location and live conditions...</p>
                </section>
            </main>
        );
    }

    if (error) {
        return (
            <main className={styles.status}>
                <section className={styles.statusCard}>
                    <h2>We could not load the forecast</h2>
                    <p className={styles.statusMuted}>{error}</p>
                </section>
            </main>
        );
    }

    if (!weather) {
        return (
            <main className={styles.status}>
                <section className={styles.statusCard}>
                    <h2>Forecast unavailable</h2>
                    <p className={styles.statusMuted}>Please try again in a moment.</p>
                </section>
            </main>
        );
    }

    const displayName = locationName ?? weather.name;
    const condition = weather.weather?.[0]?.main?.toLowerCase() ?? '';
    const mood = getWeatherMood(weather.main.temp, condition);
    const theme = moodMeta[mood];

    return (
        <main className={`${styles.shell} ${theme.shellClass}`}>
            <div className={`${styles.fxLayer} ${theme.fxClass}`} aria-hidden="true" />
            <section className={styles.card}>
                <span className={styles.label}>{theme.icon} {theme.label}</span>
                <h2 className={styles.title}>{displayName}</h2>
                <p className={styles.subtitle}>A quick look at the sky where you are right now.</p>

                <div className={styles.metrics}>
                    <article className={styles.metricCard}>
                        <p className={styles.metricTitle}>Temperature</p>
                        <p className={styles.metricValue}>{Math.round(weather.main.temp)}°C</p>
                    </article>
                    <article className={styles.metricCard}>
                        <p className={styles.metricTitle}>Feels Like</p>
                        <p className={styles.metricValue}>{Math.round(weather.main.feels_like)}°C</p>
                    </article>
                </div>
            </section>
        </main>
    );
}