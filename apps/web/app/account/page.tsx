"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { api, ApiError, eur } from "@/lib/api";
import type { Order } from "@/lib/types";

// @uxid apps/web/app/account/page::AccountPage
export default function AccountPage() {
  return (
    <Suspense fallback={<p className="py-10 text-center text-zinc-500">Loading…</p>}>
      <AccountContent />
    </Suspense>
  );
}

// @uxid apps/web/app/account/page::AccountContent
function AccountContent() {
  const { user, loading } = useAuth();
  if (loading) return <p className="py-10 text-center text-zinc-500">Loading…</p>;
  return user ? <Profile /> : <AuthForms />;
}

// @uxid apps/web/app/account/page::AuthForms
function AuthForms() {
  const { login, register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(displayName, email, password);
      const next = params.get("next");
      // Only follow same-site relative redirects.
      if (next && next.startsWith("/") && !next.startsWith("//")) router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div /* @uxid apps/web/app/account/page::AuthForms.div */ className="mb-4 flex rounded-md bg-zinc-200 p-1" role="tablist">
        {(["login", "register"] as const).map((m) => (
          <button /* @uxid apps/web/app/account/page::AuthForms.button */
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`flex-1 rounded px-3 py-2 text-sm font-semibold ${mode === m ? "bg-white shadow" : "text-zinc-600"}`}
            data-testid={`tab-${m}`}
          >
            {m === "login" ? "Log in" : "Create account"}
          </button>
        ))}
      </div>

      <form /* @uxid apps/web/app/account/page::AuthForms.form */ onSubmit={submit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6" data-testid={`${mode}-form`}>
        <h1 className="text-xl font-bold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        {mode === "register" && (
          <div>
            <label /* @uxid apps/web/app/account/page::AuthForms.label */ htmlFor="name" className="label">
              Full name
            </label>
            <input /* @uxid apps/web/app/account/page::AuthForms.input */ id="name" className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required autoComplete="name" data-testid="register-name" />
          </div>
        )}
        <div>
          <label /* @uxid apps/web/app/account/page::AuthForms.label-2 */ htmlFor="email" className="label">
            Email
          </label>
          <input /* @uxid apps/web/app/account/page::AuthForms.email */ id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" data-testid="auth-email" />
        </div>
        <div>
          <label /* @uxid apps/web/app/account/page::AuthForms.label-3 */ htmlFor="password" className="label">
            Password
          </label>
          <input /* @uxid apps/web/app/account/page::AuthForms.password */
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            data-testid="auth-password"
          />
          {mode === "register" && <p className="mt-1 text-xs text-zinc-500">At least 8 characters, with an upper-case letter, a lower-case letter and a digit.</p>}
        </div>
        {error && (
          <p /* @uxid apps/web/app/account/page::AuthForms.p */ role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800" data-testid="auth-error">
            {error}
          </p>
        )}
        <button /* @uxid apps/web/app/account/page::AuthForms.button-2 */ type="submit" disabled={busy} className="btn btn-primary w-full py-3" data-testid="auth-submit">
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
        {mode === "login" && <p className="text-center text-xs text-zinc-500">Demo account: demo@gymshop.test / Demo123!</p>}
      </form>
    </div>
  );
}

// @uxid apps/web/app/account/page::Profile
function Profile() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setOrders(await api<Order[]>("/orders"));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load orders.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function cancel(id: string) {
    setError(null);
    try {
      await api(`/orders/${id}/cancel`, { method: "POST", body: {} });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not cancel the order.");
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="account-name">
            {user!.displayName}
          </h1>
          <p className="text-zinc-600" data-testid="account-email">
            {user!.email}
          </p>
        </div>
        <button /* @uxid apps/web/app/account/page::Profile.button */ onClick={() => logout()} className="btn btn-outline" data-testid="logout">
          Log out
        </button>
      </section>

      <section aria-labelledby="orders-heading">
        <h2 id="orders-heading" className="mb-3 text-xl font-bold">
          Order history
        </h2>
        {error && (
          <p /* @uxid apps/web/app/account/page::Profile.p */ role="alert" className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-800" data-testid="orders-error">
            {error}
          </p>
        )}
        {orders === null ? (
          <p className="text-zinc-500">Loading orders…</p>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500" data-testid="no-orders">
            You haven&apos;t placed any orders yet.{" "}
            <Link /* @uxid apps/web/app/account/page::Profile.link */ href="/products" className="font-semibold text-brand underline">
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-4" data-testid="orders-list">
            {orders.map((o) => (
              <li key={o.id} className="rounded-lg border border-zinc-200 bg-white p-4" data-testid="order" data-order-number={o.number}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold" data-testid="order-number">
                    {o.number}
                  </p>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold" data-testid="order-status">
                    {o.status}
                  </span>
                </div>
                <p className="text-sm text-zinc-500">
                  Placed {new Date(o.createdAt).toLocaleDateString("en-GB", { timeZone: "UTC" })} · {eur(o.total)}
                  {o.trackingNumber && (
                    <>
                      {" "}
                      · Tracking: <span data-testid="order-tracking">{o.trackingNumber}</span>
                    </>
                  )}
                </p>
                <ul className="mt-2 text-sm">
                  {o.items.map((i, idx) => (
                    <li key={idx}>
                      {i.quantity} × {i.productName} ({i.color}, {i.size})
                    </li>
                  ))}
                </ul>
                {o.status === "Placed" && (
                  <button /* @uxid apps/web/app/account/page::Profile.button-2 */ onClick={() => cancel(o.id)} className="btn btn-outline mt-3" data-testid="cancel-order">
                    Cancel order
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
