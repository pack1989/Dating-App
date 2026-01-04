export default function HomePage() {
  return (
    <>
      <header>
        <strong>Nigeria Dating</strong>
        <nav>
          <a href="/signup">Sign up</a>
          <a href="/signin">Sign in</a>
          <a href="/people">People</a>
        </nav>
      </header>
      <main>
        <h1>Find real connections across Nigeria</h1>
        <p>
          Filter by religion and ethnicity, match with intention, and start
          conversations with thoughtful opening moves.
        </p>
        <div className="grid">
          <div className="card">
            <h3>Profile</h3>
            <p>Build a profile that reflects your values and community.</p>
          </div>
          <div className="card">
            <h3>People</h3>
            <p>Discover profiles across all states with precise filters.</p>
          </div>
          <div className="card">
            <h3>Chats</h3>
            <p>Break the ice with curated opening moves.</p>
          </div>
        </div>
      </main>
    </>
  );
}
