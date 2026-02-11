// client/src/pages/Home.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTranslation } from "../i18n";

function Badge({ children }) {
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 shadow-sm">
      {children}
    </span>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthed = !!localStorage.getItem("token");

  // Ensure smooth scroll works even when arriving with /#hash from other pages
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 font-sans text-gray-900">
      <Navbar />

      <main className="flex-1">
        {/* 1) HERO — Modern gradient overlay & glassmorphism */}
        <section
          id="hero"
          className="relative isolate flex min-h-[85vh] items-center justify-center overflow-hidden"
        >
          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1625246333195-58197bd47d26?q=80&w=2600&auto=format&fit=crop"
            alt={t("hero_image_alt", "Lush green agricultural fields")}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-black/60 to-black/30" />

          {/* Content Box */}
          <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
            <div className="animate-fade-in-up rounded-3xl bg-white/10 p-8 backdrop-blur-md border border-white/20 shadow-2xl md:p-12">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-emerald-300 drop-shadow-md">
                {t("hero_tagline", "Smart Farming Intelligence")}
              </p>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-white md:text-6xl drop-shadow-lg">
                {t("hero_title_part1", "World’s most accessible")}{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {t("hero_title_part2", "AI Advisor")}
                </span>
                <br />
                {t("hero_title_part3", "for farmers")}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-emerald-50 md:text-xl font-semibold leading-relaxed drop-shadow">
                {t(
                  "hero_sub",
                  "AgroAware helps farmers pick the right crop, get fertilizer advice, and learn best practices—multilingual and now powered by Gen-AI."
                )}
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                {isAuthed ? (
                  <>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-emerald-600 px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-emerald-500 hover:scale-105 hover:shadow-emerald-500/30"
                    >
                      <span>{t("dashboard", "Go to Dashboard")}</span>
                      <span className="transition-transform group-hover:translate-x-1">➔</span>
                    </button>
                    <button
                      onClick={() => navigate("/crop-advisory")}
                      className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105"
                    >
                      {t("crop_advisory", "Crop Advisory")}
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="#about"
                      className="rounded-full bg-white px-8 py-3 text-base font-bold text-emerald-900 shadow-lg transition-all hover:bg-gray-100 hover:scale-105"
                    >
                      {t("hero_explore", "Learn More")}
                    </a>
                    <button
                      onClick={() => navigate("/login")}
                      className="group rounded-full bg-emerald-600 px-8 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-emerald-500 hover:scale-105 hover:shadow-emerald-500/30"
                    >
                      {t("hero_try_advisory", "Try Free Advisory")}
                    </button>
                  </>
                )}
              </div>

              <div className="mt-8">
                <a
                  href="#videos"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 transition-colors hover:text-white"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                  {t("hero_watch", "Watch: AI in Farming")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 2) ABOUT — Clean layout with overlapping images */}
        <section id="about" className="relative overflow-hidden bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="inline-block rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600">
                  {t("about_label", "Our Mission")}
                </div>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  {t("about_title", "About AgroAware")}
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-gray-600 font-medium">
                  {t(
                    "about_desc",
                    "AgroAware is a next-gen farming advisor powered by AI. We help farmers select profitable crops, optimize fertilizers, and bridge the knowledge gap with multilingual guides and automated awareness campaigns."
                  )}
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    t("about_feature_1", "Crop & fertilizer recommendations (Expert mode)"),
                    t("about_feature_2", "District & season guidance (Beginner mode)"),
                    <>
                      {t("about_feature_3", "AI awareness content")}
                      <Badge>✓ {t("live", "Live")}</Badge>
                    </>,
                    <>
                      {t("about_feature_4", "Scheme simplifier")}
                      <Badge>✓ {t("live", "Live")}</Badge>
                    </>,
                    <>
                      {t("about_feature_5", "Voice assistant (KN/HI/TE/TA)")}
                      <Badge>✓ {t("live", "Live")}</Badge>
                    </>
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-bold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stylish Image Grid */}
              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1200"
                    alt="Farming technology"
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-10 -left-10 z-10 w-2/3 overflow-hidden rounded-2xl border-4 border-white shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?q=80&w=800"
                    alt="Soil Analysis"
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Decorative blob */}
                <div className="absolute -top-10 -right-10 -z-10 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* 3) FEATURES — Hover cards with icons */}
        <section id="features" className="bg-gradient-to-b from-white via-emerald-50 to-teal-50 py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-200/20 rounded-full blur-[120px] -z-10" />
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl drop-shadow-sm">
                {t("features_title", "Powerful Features")}
              </h2>
              <p className="mt-4 text-lg text-emerald-800 font-medium">
                All the tools you need for modern, sustainable agriculture in one place.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: "🌾",
                  bg: "bg-emerald-100",
                  titleKey: "feature_smart_advisory_title",
                  title: "Smart Crop Advisory",
                  descKey: "feature_smart_advisory_desc",
                  desc: "Use N-P-K, pH, temperature & rainfall to get a crop + confidence.",
                  link: "/crop-advisory",
                },
                {
                  icon: "🧭",
                  bg: "bg-blue-100",
                  titleKey: "feature_beginner_title",
                  title: "Beginner Mode",
                  descKey: "feature_beginner_desc",
                  desc: "No soil test? Select district & season to see suitable crops.",
                  link: "/crop-advisory",
                },
                {
                  icon: "🎨",
                  bg: "bg-purple-100",
                  titleKey: "feature_genai_title",
                  title: "Gen-AI Posters",
                  badge: { text: t("live", "Live"), type: "green" },
                  descKey: "feature_genai_desc",
                  desc: "Instant awareness posters, slogans & tips.",
                  link: "/awareness",
                },
                {
                  icon: "🏛",
                  bg: "bg-orange-100",
                  titleKey: "feature_scheme_title",
                  title: "Scheme Simplifier",
                  badge: { text: t("live", "Live"), type: "green" },
                  descKey: "feature_scheme_desc",
                  desc: "Plain-language summaries of government schemes.",
                  link: "/schemes",
                },
                {
                  icon: "🗣",
                  bg: "bg-indigo-100",
                  titleKey: "feature_voice_title",
                  title: "Voice Assistant",
                  badge: { text: t("live", "Live"), type: "green" },
                  descKey: "feature_voice_desc",
                  desc: "Ask in Kannada/Hindi/Telugu/Tamil and hear answers.",
                  link: "/voice",
                },
                {
                  icon: "💬",
                  bg: "bg-cyan-100",
                  titleKey: "chat_with_ai",
                  title: "AI Farming Chat",
                  badge: { text: t("new", "New"), type: "cyan" },
                  descKey: "chat_desc",
                  desc: "Ask questions about farming, pests, and more.",
                  link: "/advisory-chat",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  onClick={() => {
                    if (f.link) {
                      isAuthed ? navigate(f.link) : navigate("/login");
                    }
                  }}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-emerald-100/50"
                >
                  <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${f.bg} text-3xl shadow-inner ring-4 ring-white`}>
                    {f.icon}
                  </div>
                  <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    {t(f.titleKey, f.title)}
                    {f.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide
                        ${f.badge.type === 'cyan' ? 'bg-cyan-100 text-cyan-700' : 'bg-green-100 text-green-700'}`}>
                        {f.badge.text}
                      </span>
                    )}
                  </h3>
                  <p className="mt-3 text-slate-600 leading-relaxed font-medium">
                    {t(f.descKey, f.desc)}
                  </p>

                  {/* Hover visual arrow */}
                  <div className="mt-6 flex items-center text-sm font-bold text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
                    Try Feature <span className="ml-1">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4) HOW IT WORKS — Steps with connecting line feeling */}
        <section id="how" className="py-20 bg-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <h2 className="text-center text-3xl font-extrabold text-emerald-950">
              {t("how_title", "How It Works")}
            </h2>
            <div className="mt-16 grid gap-8 md:grid-cols-4 relative">
              {[
                { step: "1", title: "Create Account", text: "Sign up & choose your preferred language." },
                { step: "2", title: "Choose Mode", text: "Expert (soil values) or Beginner (district/season)." },
                { step: "3", title: "Get Advice", text: "See crop, fertilizer guidance & model confidence." },
                { step: "4", title: "Act & Learn", text: "Use awareness content & best practices." },
              ].map((s, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center group">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white shadow-xl ring-4 ring-emerald-100 transition-transform group-hover:scale-110">
                    {s.step}
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900">{t(`how_step${s.step}_title`, s.title)}</h3>
                  <p className="mt-2 text-sm text-slate-600 px-4 font-medium">{t(`how_step${s.step}_text`, s.text)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5) GALLERY */}
        <section id="gallery" className="py-20 bg-emerald-50/50">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center text-3xl font-extrabold text-emerald-950 mb-12">
              {t("gallery_title", "Field Gallery")}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=800",
                "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=800",
                "https://images.unsplash.com/photo-1599586737225-3b9576c9444d?q=80&w=800"
              ].map((src, i) => (
                <div key={i} className="group overflow-hidden rounded-2xl shadow-xl ring-4 ring-white">
                  <img
                    src={src}
                    alt="Gallery"
                    className="h-64 w-full object-cover transition duration-700 group-hover:scale-110 group-hover:brightness-110"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6) VIDEOS */}
        <section id="videos" className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center text-3xl font-extrabold text-emerald-950 mb-12">
              {t("videos_title", "Farmer Stories & AI in Agri")}
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {[
                { src: "https://www.youtube.com/embed/2Vv-BfVoq04g", title: "video1_title" },
                { src: "https://www.youtube.com/embed/f77SKdyn-1Y", title: "video2_title" }
              ].map((v, i) => (
                <div key={i} className="aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl ring-4 ring-emerald-50">
                  <iframe
                    className="h-full w-full opacity-90 hover:opacity-100 transition-opacity"
                    src={v.src}
                    title={t(v.title, "Video")}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7) FAQs */}
        <section id="faqs" className="py-20 bg-emerald-950 text-emerald-50">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-center text-3xl font-extrabold text-white mb-12">
              {t("faqs_title", "Frequently Asked Questions")}
            </h2>
            <div className="space-y-4">
              {[
                { qKey: "faq_need_soiltest_q", q: "Do I need a soil test?", aKey: "faq_need_soiltest_a", a: "No. Use Beginner Mode..." },
                { qKey: "faq_local_languages_q", q: "Is local language available?", aKey: "faq_local_languages_a", a: "Yes. Multilingual UI..." },
                { qKey: "faq_ngos_q", q: "NGO Posters?", aKey: "faq_ngos_a", a: "Yes. Gen-AI poster module..." },
                { qKey: "faq_data_q", q: "Data privacy?", aKey: "faq_data_a", a: "We only store history..." },
              ].map(({ qKey, q, aKey, a }) => (
                <details key={qKey} className="group rounded-xl bg-white/5 p-6 backdrop-blur-sm open:bg-white/10 transition-all border border-white/10 hover:border-white/20">
                  <summary className="cursor-pointer text-lg font-semibold text-emerald-100 group-hover:text-white flex justify-between items-center">
                    {t(qKey, q)}
                    <span className="opacity-70 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-emerald-200 leading-relaxed pl-2 border-l-2 border-emerald-500/50">
                    {t(aKey, a)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 8) CONTACT */}
        <section id="contact" className="py-20 bg-gradient-to-t from-teal-50 to-white">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-3xl bg-white p-8 shadow-2xl md:p-16 border border-emerald-100">
              <div className="grid gap-12 lg:grid-cols-2">
                <div>
                  <h2 className="text-3xl font-extrabold text-emerald-950">
                    {t("contact_title", "Contact & Support")}
                  </h2>
                  <p className="mt-4 text-lg text-emerald-800 font-medium">
                    {t("contact_desc", "Have questions? Send us a message.")}
                  </p>

                  <div className="mt-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">📧</div>
                      <div>
                        <div className="text-xs font-bold uppercase text-emerald-600">Email</div>
                        <a href="mailto:support@agroaware.example" className="font-semibold text-gray-900 hover:text-emerald-600 hover:underline">support@agroaware.example</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">📞</div>
                      <div>
                        <div className="text-xs font-bold uppercase text-emerald-600">Phone</div>
                        <div className="font-semibold text-gray-900">{t("contact_phone", "+91 9945469518")}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert(t("support_thanks", "Thanks!")); e.currentTarget.reset(); }}>
                  <input name="name" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium" placeholder={t("placeholder_name", "Your Name")} required />
                  <input name="email" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium" placeholder={t("placeholder_email", "Email")} required />
                  <textarea name="message" className="h-32 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium" placeholder={t("placeholder_message", "Message")} required />
                  <button className="w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-emerald-500/30 hover:scale-[1.02]">
                    {t("send_message", "Send Message")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
