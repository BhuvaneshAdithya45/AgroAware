import { useEffect, useState } from "react";
import { getWeatherFromCoords, reverseGeocode } from "../lib/weather";
import { useTranslation } from "../i18n";

const WEATHER_KEY = import.meta.env.VITE_WEATHER_KEY;

const ICONS = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️",
    Haze: "🌫️",
    Fog: "🌫️",
    Default: "🌤️",
};

export default function WeatherWidget() {
    const { t } = useTranslation();
    const [weather, setWeather] = useState(null);
    const [location, setLocation] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError(t("weather_gps_error", "GPS not supported"));
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude: lat, longitude: lon } = pos.coords;

                    // Fetch weather
                    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric`;
                    const res = await fetch(url);
                    const data = await res.json();

                    setWeather({
                        temp: Math.round(data.main.temp),
                        humidity: data.main.humidity,
                        rainfall: data.rain ? Math.round(data.rain["1h"] || 0) : 0,
                        description: data.weather?.[0]?.description || "",
                        main: data.weather?.[0]?.main || "Default",
                        feelsLike: Math.round(data.main.feels_like),
                        wind: Math.round(data.wind?.speed || 0),
                    });

                    // Reverse geocode
                    const addr = await reverseGeocode(lat, lon);
                    setLocation(
                        addr?.city || addr?.town || addr?.village || addr?.county || t("weather_your_location", "Your Location")
                    );
                } catch (e) {
                    setError(t("weather_unavailable", "Weather unavailable"));
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setError(t("weather_location_denied", "Location access denied"));
                setLoading(false);
            },
            { timeout: 10000 }
        );
    }, [t]);

    if (error) {
        return (
            <div className="card flex items-center gap-2 text-sm opacity-70">
                <span>🌤️</span>
                <span>{error}</span>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="card animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200" style={{ backgroundColor: "var(--border-color)" }}></div>
                    <div className="space-y-2">
                        <div className="h-4 w-24 rounded bg-gray-200" style={{ backgroundColor: "var(--border-color)" }}></div>
                        <div className="h-3 w-16 rounded bg-gray-200" style={{ backgroundColor: "var(--border-color)" }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!weather) return null;

    const icon = ICONS[weather.main] || ICONS.Default;

    return (
        <div
            className="card overflow-hidden relative"
            style={{
                background: weather.main === "Clear"
                    ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                    : weather.main === "Rain" || weather.main === "Drizzle"
                        ? "linear-gradient(135deg, #60a5fa, #3b82f6)"
                        : weather.main === "Clouds"
                            ? "linear-gradient(135deg, #94a3b8, #64748b)"
                            : "linear-gradient(135deg, #34d399, #10b981)",
                color: "#fff",
                border: "none",
            }}
        >
            <div className="flex items-center justify-between">
                {/* Left: icon + temp */}
                <div className="flex items-center gap-3">
                    <span className="text-4xl">{icon}</span>
                    <div>
                        <div className="text-3xl font-bold">{weather.temp}°C</div>
                        <div className="text-sm capitalize opacity-90">{weather.description}</div>
                    </div>
                </div>

                {/* Right: details */}
                <div className="text-right text-sm space-y-1 opacity-90">
                    <div>💧 {t("weather_humidity", "Humidity")}: <strong>{weather.humidity}%</strong></div>
                    <div>🌧️ {t("weather_rain", "Rain")}: <strong>{weather.rainfall} mm</strong></div>
                    <div>💨 {t("weather_wind", "Wind")}: <strong>{weather.wind} m/s</strong></div>
                    <div>🌡️ {t("weather_feels", "Feels")}: <strong>{weather.feelsLike}°C</strong></div>
                </div>
            </div>

            {/* Location */}
            <div className="mt-3 text-xs opacity-80 flex items-center gap-1">
                📍 {location}
            </div>
        </div>
    );
}
