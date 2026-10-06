function SuccessFactors({ factors }) {
  return (
    <section className="intel-card result-block">
      <header className="intel-card-header">
        <div>
          <span className="intel-index">SUCCESS FACTORS</span>
          <h3>Where the project looks strong or exposed</h3>
          <p>Indicative analysis based on the values you entered — not a direct ML output.</p>
        </div>
        <span className="estimate-tag">AI-assisted estimate</span>
      </header>

      <div className="factor-grid">
        {factors.map((factor) => (
          <article key={factor.key} className="factor-card">
            <div className="factor-label">
              <span>{factor.label}</span>
              <strong>{factor.score}%</strong>
            </div>
            <div className="factor-track">
              <div
                className="factor-progress"
                style={{ width: `${factor.score}%` }}
              ></div>
            </div>
            <p>{factor.explanation}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default SuccessFactors;
