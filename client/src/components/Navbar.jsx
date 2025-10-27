import { useLocation, useNavigate } from "react-router-dom";

const SECTIONS = [
  { id: "about",   label: "About" },
  { id: "features",label: "Features" },
  { id: "how",     label: "How" },
  { id: "gallery", label: "Gallery" },
  { id: "videos",  label: "Videos" },
  { id: "faqs",    label: "FAQs" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isAuthed = !!localStorage.getItem("token");

  const to = (p) => () => nav(p);

  const anchorHref = (id) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <nav className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4">
        {/* Brand */}
        <button
          onClick={to(isAuthed ? "/dashboard" : "/")}
          className="flex items-center gap-2"
          title="AgroAware"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/2913/2913465.png"
            className="w-7"
            alt="logo"
          />
          <span className="text-lg font-bold text-green-700">AgroAware</span>
        </button>

        {/* Mid: section anchors (show on md+ screens) */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={anchorHref(s.id)}
              className="text-gray-700 hover:text-green-700"
            >
              {s.label}
            </a>
          ))}
        </div>

        {/* Right: language + auth */}
        <div className="flex items-center gap-3 text-sm">
          {/* Language selector */}
          <select
            defaultValue={localStorage.getItem("language") || "en"}
            onChange={(e) => localStorage.setItem("language", e.target.value)}
            className="rounded border px-2 py-1"
            title="Language"
            aria-label="Language selector"
          >
            <option value="en">EN</option>
            <option value="kn">KN</option>
            <option value="hi">HI</option>
            <option value="te">TE</option>
          </select>

          {!isAuthed ? (
            <>
              <button
                onClick={to("/login")}
                className="rounded-lg bg-green-700 px-4 py-2 text-white hover:bg-green-800"
              >
                Login
              </button>
              <button
                onClick={to("/signup")}
                className="rounded-lg border px-4 py-2 hover:border-green-700 hover:text-green-700"
              >
                Sign up
              </button>
            </>
          ) : (
            <button
              className="text-red-600 hover:underline"
              onClick={() => { localStorage.removeItem("token"); nav("/"); }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
