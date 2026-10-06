function Recommendations({ cards }) {
  return (
    <section className="intel-card result-block">
      <header className="intel-card-header">
        <div>
          <span className="intel-index">RECOMMENDATIONS FOR YOUR PROJECT</span>
          <h3>What a new filmmaker should consider next</h3>
          <p>
            Generated from the values you entered so you leave with an action,
            not only a score.
          </p>
        </div>
      </header>

      <div className="recommend-grid">
        {cards.map((card) => (
          <article key={card.title} className="recommend-card">
            <h4>{card.title}</h4>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Recommendations;
