export default function Field({ label, name, value, onChange, type = "text", error, placeholder, icon }) {
  return (
    <div className="space-y-1.5">
      <label className="label flex items-center gap-1.5 text-sm font-semibold" htmlFor={name}
        style={{ color: "var(--text-secondary)" }}>
        {icon && <span className="text-base">{icon}</span>}
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className={`input text-base py-3 ${error ? 'ring-2 ring-red-500' : ''}`}
        style={{
          backgroundColor: "var(--input-bg)",
          color: "var(--text-primary)",
          borderColor: error ? "#ef4444" : "var(--border-color)",
        }}
      />
      {error && <p className="text-xs text-red-500 font-medium">⚠️ {error}</p>}
    </div>
  );
}
