// client/src/pages/Home.jsx
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTranslation } from "../i18n";

function Badge({ children }) {
  return (
    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
      {children}
    </span>
  );
}

export default function Home() {
  const { t } = useTranslation();

  // Ensure smooth scroll works even when arriving with /#hash from other pages
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-green-50">
      <Navbar />

      <main className="flex-1">
        {/* 1) HERO — full-bleed background, centered content */}
        <section
          id="hero"
          className="relative isolate"
          style={{ minHeight: "78vh" }}
        >
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop"
            alt={t("hero_image_alt", "Agricultural fields")}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center justify-center px-6 text-center">
            <div className="max-w-2xl">
              <p className="mb-2 text-sm uppercase tracking-widest text-emerald-200/90">
                {t("hero_tagline", "Smart Farming Assistance")}
              </p>
              <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
                {t("hero_title_part1", "World’s most accessible")}{" "}
                <span className="text-emerald-300">
                  {t("hero_title_part2", "AI advisor")}
                </span>{" "}
                {t("hero_title_part3", "for farmers")}
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-emerald-100">
                {t(
                  "hero_sub",
                  "AgroAware helps farmers pick the right crop, get fertilizer advice, and learn best practices—multilingual and field-ready."
                )}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {/* Small blue button like reference site */}
                <a
                  href="#about"
                  className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  {t("hero_explore", "Explore About Us")}
                </a>
                <a
                  href="/login"
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {t("hero_try_advisory", "Try Advisory")}
                </a>
                <a
                  href="#videos"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-emerald-200 hover:text-white underline"
                  title={t("hero_watch_title", "Watch AI in Farming")}
                >
                  {t("hero_watch", "Watch: AI in Farming")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 2) ABOUT */}
        <section id="about" className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="text-2xl font-bold text-green-800">
                  {t("about_title", "About AgroAware")}
                </h2>
                <p className="mt-3 text-gray-700">
                  {t(
                    "about_desc",
                    "AgroAware is a Generative-AI farming advisor that helps farmers select crops, get fertilizer guidance, and access easy learning materials. It also powers NGO awareness drives with auto-generated multilingual posters and guides."
                  )}
                </p>
                <ul className="mt-4 list-disc pl-5 text-gray-700">
                  <li>
                    {t(
                      "about_feature_1",
                      "Crop & fertilizer recommendations (Expert mode)"
                    )}
                  </li>
                  <li>
                    {t(
                      "about_feature_2",
                      "District & season guidance (Beginner mode)"
                    )}
                  </li>
                  <li>
                    {t("about_feature_3", "AI awareness content")}{" "}
                    <Badge>{t("coming_soon", "Coming Soon")}</Badge>
                  </li>
                  <li>
                    {t("about_feature_4", "Scheme simplifier")}{" "}
                    <Badge>{t("coming_soon", "Coming Soon")}</Badge>
                  </li>
                  <li>
                    {t("about_feature_5", "Voice assistant (KN/HI/TE)")}{" "}
                    <Badge>{t("coming_soon", "Coming Soon")}</Badge>
                  </li>
                </ul>
              </div>

              {/* Updated About images (2 only) */}
              <div className="grid grid-cols-2 gap-3">
                <img
                  src="https://images.pexels.com/photos/175389/pexels-photo-175389.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt={t("about_img1_alt", "Farmer in field")}
                  className="h-40 w-full rounded-xl object-cover"
                />
                <img
                  src="https://images.pexels.com/photos/236047/pexels-photo-236047.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt={t("about_img2_alt", "Soil testing")}
                  className="h-40 w-full rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3) FEATURES */}
        <section id="features" className="bg-green-50">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-center text-2xl font-bold text-green-800">
              {t("features_title", "Key Features")}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: "🌾",
                  titleKey: "feature_smart_advisory_title",
                  title: "Smart Crop Advisory",
                  descKey: "feature_smart_advisory_desc",
                  desc: "Use N-P-K, pH, temperature & rainfall to get a crop + confidence.",
                },
                {
                  icon: "🧭",
                  titleKey: "feature_beginner_title",
                  title: "Beginner Mode",
                  descKey: "feature_beginner_desc",
                  desc: "No soil test? Select district & season to see suitable crops.",
                },
                {
                  icon: "🎨",
                  titleKey: "feature_genai_title",
                  title: "Gen-AI Posters",
                  titleChildren: (
                    <Badge>{t("coming_soon", "Coming Soon")}</Badge>
                  ),
                  descKey: "feature_genai_desc",
                  desc: "Instant awareness posters, slogans & tips.",
                },
                {
                  icon: "🏛",
                  titleKey: "feature_scheme_title",
                  title: "Scheme Simplifier",
                  titleChildren: (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                      {t("updated", "Updated")}
                    </span>
                  ),
                  descKey: "feature_scheme_desc",
                  desc: "Plain-language summaries of government schemes.",
                },
                {
                  icon: "🗣",
                  titleKey: "feature_voice_title",
                  title: "Voice Assistant",
                  titleChildren: (
                    <Badge>{t("coming_soon", "Coming Soon")}</Badge>
                  ),
                  descKey: "feature_voice_desc",
                  desc: "Ask in Kannada/Hindi/Telugu and hear answers.",
                },
                {
                  icon: "🌐",
                  titleKey: "feature_multilingual_title",
                  title: "Multilingual UI",
                  titleChildren: (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                      {t("updated", "Updated")}
                    </span>
                  ),
                  descKey: "feature_multilingual_desc",
                  desc: "Localized UI & content for rural outreach.",
                },
              ].map((f, i) => (
                <div key={f.titleKey + i} className="card">
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="mt-2 text-lg font-semibold text-green-800">
                    {t(f.titleKey, f.title)} {f.titleChildren || null}
                  </h3>
                  <p className="mt-1 text-gray-700">{t(f.descKey, f.desc)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4) HOW IT WORKS */}
        <section id="how" className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-2xl font-bold text-green-800">
              {t("how_title", "How It Works")}
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-4">
              {[
                {
                  step: "1",
                  titleKey: "how_step1_title",
                  title: "Create Account",
                  textKey: "how_step1_text",
                  text: "Sign up & choose your preferred language.",
                },
                {
                  step: "2",
                  titleKey: "how_step2_title",
                  title: "Choose Mode",
                  textKey: "how_step2_text",
                  text: "Expert (soil values) or Beginner (district/season).",
                },
                {
                  step: "3",
                  titleKey: "how_step3_title",
                  title: "Get Advice",
                  textKey: "how_step3_text",
                  text: "See crop, fertilizer guidance & model confidence.",
                },
                {
                  step: "4",
                  titleKey: "how_step4_title",
                  title: "Act & Learn",
                  textKey: "how_step4_text",
                  text: "Use awareness content & best practices.",
                },
              ].map((s) => (
                <div key={s.step} className="rounded-2xl border bg-white p-5">
                  <div className="text-2xl font-bold text-green-700">
                    {t("step_prefix", "Step")} {s.step}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-800">
                    {t(s.titleKey, s.title)}
                  </div>
                  <p className="mt-1 text-gray-700">{t(s.textKey, s.text)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5) GALLERY (your 1, 4, 6 picks) */}
        <section id="gallery" className="bg-green-50">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-center text-2xl font-bold text-green-800">
              {t("gallery_title", "Field Gallery")}
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              <img
                src="https://images.pexels.com/photos/219794/pexels-photo-219794.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt={t("gallery_img1_alt", "Field Cultivation")}
                className="h-56 w-full rounded-xl object-cover shadow"
              />
              <img
                src="https://images.pexels.com/photos/2886937/pexels-photo-2886937.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt={t("gallery_img2_alt", "Farmers at Work")}
                className="h-56 w-full rounded-xl object-cover shadow"
              />
              <img
                src="https://images.pexels.com/photos/129574/pexels-photo-129574.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt={t("gallery_img3_alt", "Crop Fields")}
                className="h-56 w-full rounded-xl object-cover shadow"
              />
            </div>
          </div>
        </section>

        {/* 6) VIDEOS */}
        <section id="videos" className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-center text-2xl font-bold text-green-800">
              {t("videos_title", "Farmer Stories & AI in Agri")}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="aspect-video overflow-hidden rounded-xl shadow">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/2Vv-BfVoq04g"
                  title={t("video1_title", "AI in Agriculture - Explainer")}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="aspect-video overflow-hidden rounded-xl shadow">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/f77SKdyn-1Y"
                  title={t("video2_title", "Farmer Story")}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        {/* 7) FAQs */}
        <section id="faqs" className="bg-green-50">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-center text-2xl font-bold text-green-800">
              {t("faqs_title", "Frequently Asked Questions")}
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                {
                  qKey: "faq_need_soiltest_q",
                  q: "Do I need a soil test to use AgroAware?",
                  aKey: "faq_need_soiltest_a",
                  a: "No. Use Beginner Mode with district & season. Expert Mode gives more precise results if you have soil values.",
                },
                {
                  qKey: "faq_local_languages_q",
                  q: "Is AgroAware available in local languages?",
                  aKey: "faq_local_languages_a",
                  a: "Yes. Multilingual UI and voice assistant for Kannada, Hindi, and Telugu are planned in upcoming phases.",
                },
                {
                  qKey: "faq_ngos_q",
                  q: "Can NGOs create awareness posters?",
                  aKey: "faq_ngos_a",
                  a: "Yes. The Generative-AI poster module will generate slogans, tips, and print-ready posters. Coming soon.",
                },
                {
                  qKey: "faq_data_q",
                  q: "What data do you store?",
                  aKey: "faq_data_a",
                  a: "We store basic login info and advisory logs to show history/analytics. Data stays private to your account.",
                },
              ].map(({ qKey, q, aKey, a }) => (
                <details key={qKey} className="rounded-2xl border bg-white p-4">
                  <summary className="cursor-pointer font-semibold text-green-800">
                    {t(qKey, q)}
                  </summary>
                  <p className="mt-2 text-gray-700">{t(aKey, a)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 8) CONTACT & SUPPORT */}
        <section id="contact" className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-2xl font-bold text-green-800">
              {t("contact_title", "Contact & Support")}
            </h2>
            <p className="mt-2 max-w-xl text-gray-700">
              {t(
                "contact_desc",
                "Have questions, want a demo for your college review, or need deployment help? Send us a message."
              )}
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <form
                className="card space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const payload = Object.fromEntries(fd.entries());
                  console.log("Support form payload:", payload);
                  alert(t("support_thanks", "Thanks! We’ll reach out soon."));
                  e.currentTarget.reset();
                }}
              >
                <input
                  name="name"
                  className="input"
                  placeholder={t("placeholder_name", "Your Name")}
                  required
                />
                <input
                  name="email"
                  className="input"
                  placeholder={t("placeholder_email", "Email / Phone")}
                  required
                />
                <textarea
                  name="message"
                  className="input h-32"
                  placeholder={t("placeholder_message", "Your message...")}
                  required
                />
                <button className="btn w-full">
                  {t("send_message", "Send Message")}
                </button>
              </form>

              <div className="card space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📧</span>
                  <a
                    className="text-green-700 underline"
                    href="mailto:support@agroaware.example"
                  >
                    support@agroaware.example
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📞</span>
                  <span>{t("contact_phone", "+91 9945469518")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📍</span>
                  <span>
                    {t("contact_address", "Department Lab,NMIT, Karnataka")}
                  </span>
                </div>
                <div className="rounded-xl border bg-green-50 p-4 text-sm text-gray-700">
                  {t("contact_note", "")}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
