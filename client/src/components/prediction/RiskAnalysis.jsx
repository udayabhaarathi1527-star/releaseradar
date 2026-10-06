function RiskAnalysis({ risks }) {
  return (
    <section className="intel-card result-block">
      <header className="intel-card-header">
        <div>
          <span className="intel-index">PROJECT RISK PROFILE</span>
          <h3>Indicative risk assessment</h3>
          <p>
            These levels are derived from your inputs to help new filmmakers
            plan. They are not returned by the prediction model.
          </p>
        </div>
      </header>

      <div className="risk-grid">
        {risks.map((risk) => (
          <article key={risk.label} className="risk-card">
            <div className="risk-card-top">
              <strong>{risk.label}</strong>
              <span className={`risk-pill risk-${risk.level.toLowerCase()}`}>
                {risk.level}
              </span>
            </div>
            <p>{risk.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RiskAnalysis;
