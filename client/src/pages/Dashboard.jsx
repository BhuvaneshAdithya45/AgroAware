import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import WeatherWidget from "../components/WeatherWidget";
import { useTranslation } from "../i18n";
import { translateCrop } from "../lib/cropTranslations";

export default function Dashboard() {
    const { t, lang } = useTranslation();
    const [history, setHistory] = useState([]);
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        // Load history
        const saved = localStorage.getItem("advisory_history");
        if (saved) {
            try {
                setHistory(JSON.parse(saved).slice(0, 5));
            } catch (e) {
                console.error("Failed to load history", e);
            }
        }

        // Set greeting based on time
        const hour = new Date().getHours();
        if (hour < 12) setGreeting(t("good_morning", "Good Morning"));
        else if (hour < 18) setGreeting(t("good_afternoon", "Good Afternoon"));
        else setGreeting(t("good_evening", "Good Evening"));
    }, [t]);

    const features = [
        {
            to: "/crop-advisory",
            title: t("crop_advisory", "Crop Advisory"),
            desc: t("crop_advisory_desc", "Get personalized crop & fertilizer recommendations"),
            icon: "🌾",
            color: "from-green-500 to-emerald-600",
            bg: "bg-green-50/50",
            border: "border-green-100"
        },
        {
            to: "/advisory-chat",
            title: t("chat_with_ai", "AI Farming Assistant"),
            desc: t("chat_desc", "Ask questions about farming, pests, and more"),
            icon: "💬",
            color: "from-purple-500 to-indigo-600",
            bg: "bg-purple-50/50",
            border: "border-purple-100"
        },
        {
            to: "/schemes",
            title: t("govt_schemes", "Government Schemes"),
            desc: t("schemes_desc", "Find financial support and subsidies"),
            icon: "🏛️",
            color: "from-blue-500 to-cyan-600",
            bg: "bg-blue-50/50",
            border: "border-blue-100"
        },
        {
            to: "/awareness",
            title: t("farming_awareness", "Knowledge Hub"),
            desc: t("awareness_desc", "Farming tips, GenAI articles & posters"),
            icon: "📚",
            color: "from-orange-500 to-amber-600",
            bg: "bg-orange-50/50",
            border: "border-orange-100"
        },
        {
            to: "/voice",
            title: t("voice_assistant", "Voice Assistant"),
            desc: t("voice_desc", "Speak to get advisory in your language"),
            icon: "🎤",
            color: "from-pink-500 to-rose-600",
            bg: "bg-pink-50/50",
            border: "border-pink-100"
        },
        {
            to: "/rag",
            title: t("rag_upload", "Document Analysis"),
            desc: t("rag_desc", "Upload research papers for AI analysis"),
            icon: "📄",
            color: "from-teal-500 to-emerald-600",
            bg: "bg-teal-50/50",
            border: "border-teal-100"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-100 relative overflow-hidden font-sans text-emerald-950">
            {/* Background elements - Vibrant & Light */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[100px] -z-10" />

            <Navbar dark={false} />

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-block px-3 py-1 rounded-full bg-emerald-200/50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
                            {new Date().toLocaleDateString(lang === 'en' ? 'en-IN' : lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-emerald-950 drop-shadow-sm">
                            {greeting}, <span className="text-emerald-600">Farmer</span> 👨‍🌾
                        </h1>
                        <p className="text-emerald-800 mt-3 max-w-2xl text-lg font-medium">
                            {t("dashboard_welcome", "Welcome to your smart farming dashboard. Access all tools and insights from here.")}
                        </p>
                    </div>
                </header>

                {/* Weather Widget Wrapper */}
                <div className="rounded-3xl bg-white border border-emerald-100 shadow-xl p-6 relative overflow-hidden hover:shadow-2xl transition-shadow duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl -z-10" />
                    <WeatherWidget />
                </div>

                {/* Main Grid Layout */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Quick Access (2/3 width on LG) */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-emerald-950 mb-6 flex items-center gap-2 drop-shadow-sm">
                                <span className="bg-emerald-100 text-emerald-700 p-2 rounded-lg text-xl shadow-sm border border-emerald-200">🚀</span> {t("quick_access", "Quick Access")}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {features.map((f, idx) => (
                                    <Link
                                        key={idx}
                                        to={f.to}
                                        className={`group relative overflow-hidden rounded-2xl border ${f.border} bg-white p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-emerald-300`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className={`p-3 rounded-xl bg-gradient-to-br ${f.color} text-white shadow-lg text-2xl ring-4 ring-emerald-50`}>
                                                {f.icon}
                                            </div>
                                            <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
                                                    ➔
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                                                {f.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-600 font-medium leading-relaxed">
                                                {f.desc}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Activity & Promo (1/3 width on LG) */}
                    <div className="space-y-8">
                        {/* Promo Card */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-8 text-white shadow-2xl transition-transform hover:scale-[1.02] duration-300 ring-4 ring-indigo-50/50">
                            {/* Decorative elements */}
                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/30 blur-3xl animate-pulse" />
                            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

                            <div className="relative z-10">
                                <div className="inline-block rounded-lg bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                                    {t("dashboard_new_tools", "New AI Tools")}
                                </div>
                                <h3 className="text-2xl font-bold mb-3 drop-shadow-md">{t("dashboard_upgrade", "Upgrade Your Farming 🤖")}</h3>
                                <p className="text-indigo-100/90 text-sm mb-6 leading-relaxed font-medium">
                                    {t("dashboard_upgrade_desc", "Generate custom posters, chat with AI, and get expert advice in seconds.")}
                                </p>

                                <div className="space-y-3">
                                    <Link to="/awareness" className="flex items-center justify-between w-full bg-white text-indigo-900 font-bold py-3 px-4 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg group">
                                        <span>{t("dashboard_create_poster", "🎨 Create Poster")}</span>
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </Link>
                                    <Link to="/advisory-chat" className="flex items-center justify-between w-full bg-indigo-800/50 text-white font-medium py-3 px-4 rounded-xl hover:bg-indigo-800/70 transition-colors border border-indigo-700/50 group backdrop-blur-md">
                                        <span>{t("dashboard_ai_chat", "💬 AI Chat")}</span>
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="rounded-3xl bg-white border border-emerald-100 shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
                                    <span className="bg-orange-100 text-orange-600 p-1.5 rounded-lg border border-orange-200">📜</span> {t("recent_activity", "Recent Activity")}
                                </h3>
                                <Link to="/crop-advisory" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline uppercase tracking-wide">
                                    {t("dashboard_view_all", "View All")}
                                </Link>
                            </div>

                            {history.length > 0 ? (
                                <div className="space-y-4">
                                    {history.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                            <div className="h-10 w-10 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-full text-lg shadow-sm">
                                                🌱
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 truncate">
                                                    {translateCrop(item.result?.recommended_crop || item.result?.predicted_crop, lang) || "Unknown"}
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {new Date(item.time).toLocaleDateString(lang === 'en' ? 'en-IN' : lang)}
                                                </p>
                                            </div>
                                            {item.result?.confidence && (
                                                <div className="text-right">
                                                    <span className="inline-block text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100">
                                                        {item.result.confidence}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100 text-2xl mb-3">📉</div>
                                    <p className="text-gray-500 text-sm">{t("no_history", "No recent activity.")}</p>
                                    <Link to="/crop-advisory" className="mt-4 block w-full py-2 rounded-xl border border-dashed border-gray-300 text-sm font-medium text-gray-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                                        {t("dashboard_start_prediction", "+ Start Prediction")}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
