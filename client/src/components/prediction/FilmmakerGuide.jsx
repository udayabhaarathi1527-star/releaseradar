function FilmmakerGuide() {
  const cards = [
    {
      icon: "💰",
      title: "BUDGET",
      body: "Don't enter your total investment if it includes unrelated personal expenses. Use only the cost of making and releasing the film.",
    },
    {
      icon: "🎬",
      title: "STAR POWER",
      body: "Independent films can succeed even with low star power. Story, genre, and festival positioning often matter more at this scale.",
    },
    {
      icon: "📅",
      title: "RELEASE TIMING",
      body: "Competition can strongly affect theatrical visibility. A quieter month can be more valuable than a prestige calendar date.",
    },
    {
      icon: "⭐",
      title: "AUDIENCE SCORE",
      body: "Use a realistic expected rating as a planning assumption, not a guaranteed audience response.",
    },
  ];

  return (
    <aside className="guide-panel">
      <div className="guide-kicker">NEW FILMMAKER GUIDE</div>
      <h3>How to fill this brief</h3>
      <p className="guide-lead">
        These notes are for planning. They are not model outputs.
      </p>

      <div className="guide-list">
        {cards.map((card) => (
          <article key={card.title} className="guide-card">
            <span>{card.icon}</span>
            <div>
              <strong>{card.title}</strong>
              <p>{card.body}</p>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}

export default FilmmakerGuide;
