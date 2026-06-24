import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const { signUp, signIn } = useAuth();
  const [, navigate] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, username);
      }
      navigate("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden grid lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="bg-dark text-white p-12 flex flex-col justify-center">
          <p className="uppercase tracking-[0.25em] text-sm text-white/50 mb-6">AthletiGolf</p>
          <h1 className="text-5xl font-semibold leading-tight mb-6">
            Build Performance<br />On and Off the Course.
          </h1>
          <p className="text-white/70 leading-relaxed text-lg">
            Track workouts, monitor progression, analyse golf performance and train with purpose.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-10 md:p-14 flex flex-col justify-center">
          <h2 className="text-4xl font-semibold mb-3">
            {isLogin ? "Welcome Back" : `Welcome ${username || ""}`}
          </h2>
          <p className="text-black/60 mb-10">
            {isLogin ? "Sign in to continue your progress." : "Create your account to get started."}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm mb-2 text-black/60">Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-black/10 rounded-2xl px-5 py-4 outline-none focus:border-black transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm mb-2 text-black/60">Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-black/10 rounded-2xl px-5 py-4 outline-none focus:border-black transition"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-black/60">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-black/10 rounded-2xl px-5 py-4 outline-none focus:border-black transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dark text-white py-4 rounded-2xl hover:scale-[1.01] transition disabled:opacity-50"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center text-black/60">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <button onClick={() => setIsLogin(false)} className="text-black font-medium hover:underline">
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setIsLogin(true)} className="text-black font-medium hover:underline">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
