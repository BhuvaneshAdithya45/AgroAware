export default function Field({label, name, value, onChange, type="text", error}){
  return (
    <div className="space-y-1">
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} value={value} onChange={onChange} type={type}
             className={`input ${error ? 'ring-2 ring-red-500' : ''}`} />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
