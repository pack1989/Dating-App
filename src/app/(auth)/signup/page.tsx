"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  profilePhotoUrl: string;
};

const initialState: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
  profilePhotoUrl: ""
};

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (field: keyof FormState) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? "Unable to create account.");
        setSubmitting(false);
        return;
      }

      router.push("/profile");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <h1>Create your account</h1>
      <div className="card">
        <form className="form" onSubmit={onSubmit}>
          <div className="form-row">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={onChange("firstName")}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={onChange("lastName")}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={onChange("phone")}
              placeholder="+234..."
            />
          </div>
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange("email")}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              value={form.password}
              onChange={onChange("password")}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="profilePhotoUrl">Profile photo URL</label>
            <input
              id="profilePhotoUrl"
              name="profilePhotoUrl"
              type="url"
              value={form.profilePhotoUrl}
              onChange={onChange("profilePhotoUrl")}
              placeholder="https://..."
            />
          </div>
          <p className="form-note">
            Upload support will be added after storage is configured.
          </p>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </main>
  );
}
