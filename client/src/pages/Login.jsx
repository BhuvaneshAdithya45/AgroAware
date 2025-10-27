import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/api";
import { setToken } from "../lib/auth";
import Navbar from "../components/Navbar";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await API.post("/api/auth/login", form);
      setToken(data.token);
      nav("/dashboard");
    } catch {
      setMsg("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="mx-auto max-w-md p-6">
        <div className="card space-y-3">
          <h1 className="text-center text-2xl font-bold text-green-700">Login</h1>
          <form className="space-y-3" onSubmit={submit}>
            <input className="input" placeholder="Email" onChange={(e)=>setForm({...form, email:e.target.value})}/>
            <input className="input" type="password" placeholder="Password" onChange={(e)=>setForm({...form, password:e.target.value})}/>
            <button className="btn w-full">Login</button>
          </form>
          {msg && <p className="text-center text-sm text-red-600">{msg}</p>}
        </div>
      </div>
    </div>
  );
}