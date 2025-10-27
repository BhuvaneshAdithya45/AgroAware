import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/api";
import Navbar from "../components/Navbar";

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", language: "en" });
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await API.post("/api/auth/register", form);
      setMsg("Account created. Please login.");
      setTimeout(()=> nav("/login"), 900);
    } catch {
      setMsg("Signup failed. Email may already exist.");
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="mx-auto max-w-md p-6">
        <div className="card space-y-3">
          <h1 className="text-center text-2xl font-bold text-green-700">Create Account</h1>
          <form className="space-y-3" onSubmit={submit}>
            <input className="input" placeholder="Full Name" onChange={(e)=>setForm({...form, name:e.target.value})}/>
            <input className="input" placeholder="Email" onChange={(e)=>setForm({...form, email:e.target.value})}/>
            <input className="input" type="password" placeholder="Password" onChange={(e)=>setForm({...form, password:e.target.value})}/>
            <select className="input" value={form.language} onChange={(e)=>setForm({...form, language:e.target.value})}>
              <option value="en">English</option>
              <option value="kn">Kannada</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
            </select>
            <button className="btn w-full">Sign up</button>
          </form>
          {msg && <p className="text-center text-sm text-green-700">{msg}</p>}
        </div>
      </div>
    </div>
  );
}