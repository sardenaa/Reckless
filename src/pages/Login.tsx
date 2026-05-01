import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { LogIn, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { useToast } from "../components/Toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast("success", "Welcome Back!", "Successfully logged into your account.");
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="portal-card">
        <div className="portal-header">Account Login</div>
        <div className="p-8">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-(--accent)/10 border-2 border-(--accent)/20 rounded-full flex items-center justify-center">
              <LogIn className="text-(--accent)" size={32} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black uppercase tracking-tighter italic">Welcome Back</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-(--text-secondary)">Enter your credentials to continue</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-xs text-red-500 font-bold">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-(--text-secondary) flex items-center gap-2">
                <Mail size={12} /> Email Address
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/20 border border-(--border-color) p-3 text-sm outline-none focus:border-(--accent) transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-(--text-secondary) flex items-center gap-2">
                  <Lock size={12} /> Password
                </label>
                <Link to="/forgot-password" title="Forgot Password" className="text-[9px] font-black uppercase text-(--accent) hover:underline">
                  Forgot?
                </Link>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/20 border border-(--border-color) p-3 text-sm outline-none focus:border-(--accent) transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 bg-(--accent) text-white py-4 font-black uppercase text-sm tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : <>Access Account <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-(--border-color) text-center">
            <p className="text-xs text-(--text-secondary) font-bold uppercase tracking-widest">
              Don't have an account?{" "}
              <Link to="/register" title="Join Community" className="text-(--accent) hover:underline">
                Join Community
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
