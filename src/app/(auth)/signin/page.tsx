export default function SignInPage() {
  return (
    <main>
      <h1>Sign in disabled</h1>
      <div className="card">
        <p>Sign in is turned off while we build the app.</p>
        <p>Use the sign up flow or go directly to People.</p>
        <div>
          <a className="button" href="/signup">
            Go to sign up
          </a>
        </div>
      </div>
    </main>
  );
}
