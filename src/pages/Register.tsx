import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { UserPlus, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight } from "lucide-react";
import { useToast } from "../components/Toast";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      // Initialize user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        skin: 294, // Default skin
        level: 1,
        createdAt: new Date().toISOString(),
        role: "User",
        lastActive: new Date()
      });

      // Update forum statistics
      await updateDoc(doc(db, "settings", "forum_stats"), {
        members: increment(1),
        newestUser: username
      }).catch(() => {});

      toast("success", "Welcome!", "Your account has been created successfully. Welcome to the community!");
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="portal-card">
        <div className="portal-header">Create New Account</div>
        <div className="p-8">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-(--accent)/10 border-2 border-(--accent)/20 rounded-full flex items-center justify-center">
              <UserPlus className="text-(--accent)" size={32} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black uppercase tracking-tighter italic">Join The Action</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-(--text-secondary)">One account for Forum & Server</p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 flex items-start gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-xs text-red-500 font-bold">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-(--text-secondary) flex items-center gap-2">
                <UserIcon size={12} /> Character Name
              </label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black/20 border border-(--border-color) p-3 text-sm outline-none focus:border-(--accent) transition-colors"
                placeholder="Joe_Reckless"
              />
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-(--text-secondary) flex items-center gap-2">
                  <Lock size={12} /> Password
                </label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/20 border border-(--border-color) p-3 text-sm outline-none focus:border-(--accent) transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-(--text-secondary) flex items-center gap-2">
                  <Lock size={12} /> Confirm
                </label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-black/20 border border-(--border-color) p-3 text-sm outline-none focus:border-(--accent) transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 bg-(--accent) text-white py-4 font-black uppercase text-sm tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : <>Complete Enrollment <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-(--border-color) text-center">
            <p className="text-xs text-(--text-secondary) font-bold uppercase tracking-widest">
              Already have an account?{" "}
              <Link to="/login" title="Login Here" className="text-(--accent) hover:underline">
                Login Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
