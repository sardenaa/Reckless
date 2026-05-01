import React, { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import { KeyRound, Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Check your inbox for further instructions");
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="portal-card">
        <div className="portal-header">Password Recovery</div>
        <div className="p-8">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-(--accent)/10 border-2 border-(--accent)/20 rounded-full flex items-center justify-center">
              <KeyRound className="text-(--accent)" size={32} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black uppercase tracking-tighter italic">Forgot Password?</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-(--text-secondary)">We'll send you a recovery link</p>
            </div>
          </div>

          <form onSubmit={handleReset} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-xs text-red-500 font-bold">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-emerald-500/10 border border-emerald-500/50 p-4 flex items-start gap-3">
                <CheckCircle className="text-emerald-500 shrink-0" size={18} />
                <p className="text-xs text-emerald-500 font-bold">{message}</p>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-(--text-secondary) flex items-center gap-2">
                <Mail size={12} /> Registered Email
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

            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 bg-(--accent) text-white py-4 font-black uppercase text-sm tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-(--border-color) text-center">
            <Link to="/login" title="Return to Login" className="text-xs text-(--text-secondary) font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:text-(--accent) transition-colors">
              <ArrowLeft size={14} /> Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
