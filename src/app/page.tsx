export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <strong>Nigeria Dating</strong>
        </div>
        <nav className="nav">
          <a href="/people">People</a>
          <a href="/signin">Sign in</a>
          <a className="button primary" href="/signup">
            Start matching
          </a>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="tag">Real profiles. Clear intent. Nigeria first.</p>
            <h1 className="hero-title">
              Find bold, values-first connections across Nigeria.
            </h1>
            <p className="hero-subtitle">
              Match by faith, culture, and lifestyle without the noise. Discover
              people who are serious about getting to know you.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="/signup">
                Create your profile
              </a>
              <a className="button ghost" href="/people">
                Browse people
              </a>
            </div>
            <div className="stats">
              <div className="stat-card">
                <span className="stat-number">36</span>
                <span className="stat-label">States covered</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">2 min</span>
                <span className="stat-label">To get started</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Matches in motion</span>
              </div>
            </div>
          </div>
          <div className="hero-panel">
            <div className="panel-card">
              <h3>Filter with purpose</h3>
              <p>
                Religion, ethnicity, state, and lifestyle filters built for how
                Nigerians actually date.
              </p>
              <div className="pill-row">
                <span className="pill">Faith</span>
                <span className="pill">Ethnicity</span>
                <span className="pill">State</span>
                <span className="pill">Intentions</span>
              </div>
            </div>
            <div className="panel-card outline">
              <h3>Stand out fast</h3>
              <p>
                Showcase personality with prompts, audio intros, and curated
                openers that spark real conversation.
              </p>
              <a className="text-link" href="/signup">
                Build your profile
              </a>
            </div>
          </div>
        </section>

        <section className="feature-section">
          <div>
            <h2 className="section-title">Designed for serious connections</h2>
            <p className="section-note">
              Clean, modern, and intentional. No endless swiping, no chaos.
            </p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Profiles that feel human</h3>
              <p>
                Personality-first profiles with values, family goals, and
                lifestyle preferences up front.
              </p>
            </div>
            <div className="feature-card">
              <h3>Matches with context</h3>
              <p>
                See why you matched and what you have in common before the
                first hello.
              </p>
            </div>
            <div className="feature-card">
              <h3>Chats that flow</h3>
              <p>
                Smart openers and shared prompts keep the conversation moving.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
