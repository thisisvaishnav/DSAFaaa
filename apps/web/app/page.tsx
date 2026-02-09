"use client";

import { useState } from "react";
import { signIn, signUp, signOut, useSession } from "../lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

const HomePage = () => {
  const { data: session, isPending } = useSession();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "sign-up") {
        const { error: signUpError } = await signUp.email({
          name,
          email,
          password,
        });
        if (signUpError) {
          setError(signUpError.message ?? "Sign-up failed");
          return;
        }
      } else {
        const { error: signInError } = await signIn.email({
          email,
          password,
        });
        if (signInError) {
          setError(signInError.message ?? "Invalid credentials");
          return;
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleToggleMode = () => {
    setMode(mode === "sign-in" ? "sign-up" : "sign-in");
    setError("");
  };

  // Loading state
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-accent" />
      </div>
    );
  }

  // Authenticated — show dashboard
  if (session?.user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-2xl font-bold text-accent">
              {session.user.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <h1 className="text-2xl font-bold">{session.user.name}</h1>
            <p className="mt-1 text-sm text-muted">{session.user.email}</p>
          </div>

          <div className="mb-6 flex items-center justify-between rounded-xl bg-background p-4">
            <span className="text-sm text-muted">Rating</span>
            <span className="text-xl font-bold text-accent">
              {(session.user as Record<string, unknown>).rating as number ?? 1200}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="w-full cursor-pointer rounded-xl bg-danger px-4 py-3 font-medium text-white transition-colors hover:bg-danger-hover"
          >
            Sign Out
          </button>
        </div>

        <p className="text-sm text-muted">
          Matchmaking, leaderboard, and battle UI coming soon.
        </p>
      </div>
    );
  }

  // Not authenticated — show auth form
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      {/* Logo / Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          DSA<span className="text-accent">Dash</span>
        </h1>
        <p className="mt-2 text-sm text-muted">
          1v1 DSA battles. Climb the leaderboard.
        </p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <h2 className="mb-6 text-center text-xl font-semibold">
          {mode === "sign-in" ? "Welcome back" : "Create your account"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "sign-up" && (
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-muted"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                autoComplete="name"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder-muted outline-none transition-colors focus:border-accent"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-muted"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder-muted outline-none transition-colors focus:border-accent"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-muted"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder-muted outline-none transition-colors focus:border-accent"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            aria-label={mode === "sign-in" ? "Sign in" : "Sign up"}
            className="mt-2 w-full cursor-pointer rounded-xl bg-accent px-4 py-3 font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "sign-in"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          {mode === "sign-in" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={handleToggleMode}
                aria-label="Switch to sign up"
                tabIndex={0}
                className="cursor-pointer font-medium text-accent underline-offset-4 hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={handleToggleMode}
                aria-label="Switch to sign in"
                tabIndex={0}
                className="cursor-pointer font-medium text-accent underline-offset-4 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
