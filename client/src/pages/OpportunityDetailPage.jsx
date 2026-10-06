import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import { getOpportunity } from "../utils/platformApi";
import "./OpportunityDetailPage.css";

const safeWebsite = (value) => /^https:\/\//i.test(value || "");
const dateLabel = (value) => new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
const formatLocation = (format, location) => {
  const place = String(location || "").replace(/^online\s*[·-]\s*/i, "");
  return `${format} · ${place}`;
};

function OpportunityDetailPage() {
  const { id } = useParams();
  const [detailResult, setDetailResult] = useState({ id: null, opportunity: null, error: "" });

  useEffect(() => {
    const controller = new AbortController();
    getOpportunity(id, controller.signal)
      .then((opportunity) => setDetailResult({ id, opportunity, error: "" }))
      .catch((requestError) => {
        if (requestError.code === "ERR_CANCELED") return;
        setDetailResult({ id, opportunity: null, error: requestError.response?.data?.message || "Unable to load this opportunity." });
      });
    return () => controller.abort();
  }, [id]);

  const isCurrentOpportunity = detailResult.id === id;
  const opportunity = isCurrentOpportunity ? detailResult.opportunity : null;
  const error = isCurrentOpportunity ? detailResult.error : "";

  if (!isCurrentOpportunity) return <main className="opportunity-detail-state"><span className="platform-loader"></span><p>Loading opportunity details...</p></main>;
  if (error || !opportunity) return (
    <main className="opportunity-detail-state">
      <h1>Opportunity unavailable</h1>
      <p>{error || "This listing could not be found."}</p>
      <Link to="/opportunities">Back to Opportunities</Link>
    </main>
  );

  const statusClass = opportunity.status === "Closed" ? "closed" : opportunity.status === "Closing Soon" ? "closing" : "open";
  const officialLinkAvailable = safeWebsite(opportunity.websiteUrl);

  return (
    <main className="opportunity-detail-page">
      <div className="opportunity-detail-breadcrumb"><Link to="/opportunities">Opportunities</Link><span>/</span><span>{opportunity.category}</span></div>
      {opportunity.verificationStatus !== "verified" && (
        <div className="opportunity-verification-notice">
          <Icon type="alert" />
          <div>
            <strong>{opportunity.isDemo ? "SAMPLE LISTING · NOT VERIFIED" : "UNVERIFIED LISTING"}</strong>
            <p>
              {opportunity.isDemo
                ? "All dates, fees, eligibility, and rewards below are illustrative. Confirm current details with the organizer."
                : "This listing has not been verified by ReleaseRadar. Confirm current dates, fees, and eligibility with the organizer."}
            </p>
          </div>
        </div>
      )}

      <header className="opportunity-detail-header">
        <div className="opportunity-detail-kicker"><span>{opportunity.category}</span><span className={`opportunity-status ${statusClass}`}>{opportunity.status}</span></div>
        <h1>{opportunity.title}</h1>
        <p className="opportunity-detail-organizer">Organized by <strong>{opportunity.organizer}</strong></p>
        <div className="opportunity-detail-facts">
          <div><Icon type="calendar" /><span><small>DEADLINE</small><strong>{dateLabel(opportunity.deadline)}</strong></span></div>
          <div><Icon type="search" /><span><small>LOCATION</small><strong>{formatLocation(opportunity.format, opportunity.location)}</strong></span></div>
          <div><Icon type="chart" /><span><small>ENTRY FEE</small><strong>{Number(opportunity.entryFee) === 0 ? "Free" : `₹${Number(opportunity.entryFee).toLocaleString("en-IN")}`}</strong></span></div>
        </div>
      </header>

      <div className="opportunity-detail-layout">
        <div className="opportunity-detail-main">
          <section className="opportunity-detail-section">
            <p className="opportunity-section-kicker">01 / OVERVIEW</p>
            <h2>About this opportunity</h2>
            <p>{opportunity.description}</p>
          </section>

          <section className="opportunity-detail-section">
            <p className="opportunity-section-kicker">02 / SUBMISSION</p>
            <h2>What to prepare</h2>
            {opportunity.submissionRequirements?.length ? (
              <ul className="opportunity-requirements">{opportunity.submissionRequirements.map((item) => <li key={item}><Icon type="check" />{item}</li>)}</ul>
            ) : <p>Submission requirements have not been listed.</p>}
          </section>

          {opportunity.importantDates?.length > 0 && (
            <section className="opportunity-detail-section">
              <p className="opportunity-section-kicker">03 / IMPORTANT DATES</p>
              <h2>Key dates</h2>
              <div className="opportunity-important-dates">{opportunity.importantDates.map((item, index) => <div key={`${item.label}-${index}`}><span>{item.label}</span><strong>{dateLabel(item.date)}</strong></div>)}</div>
            </section>
          )}
        </div>

        <aside className="opportunity-detail-aside">
          <section className="opportunity-reward-panel">
            <span>REWARD / PRIZE</span>
            <strong>{opportunity.prize || "Not specified"}</strong>
            <div className="opportunity-aside-divider"></div>
            <span>ELIGIBILITY</span>
            <div className="opportunity-detail-tags">{(opportunity.eligibility || []).length ? opportunity.eligibility.map((item) => <span key={item}>{item}</span>) : <small>Not specified</small>}</div>
            <span>FILM TYPES</span>
            <div className="opportunity-detail-tags">{(opportunity.filmTypes || []).length ? opportunity.filmTypes.map((item) => <span key={item}>{item}</span>) : <small>Not specified</small>}</div>
            <span>DURATION REQUIREMENT</span>
            <p>{opportunity.durationRequirement || "Not specified"}</p>
            <span>GENRES</span>
            <div className="opportunity-detail-tags">{(opportunity.genres || []).map((item) => <span key={item}>{item}</span>)}</div>
          </section>
          <section className="opportunity-apply-panel">
            {officialLinkAvailable ? (
              <>
                <p>Confirm listing details with the organizer before submitting.</p>
                <a href={opportunity.websiteUrl} target="_blank" rel="noopener noreferrer">Apply / visit official website <Icon type="arrow" /></a>
              </>
            ) : (
              <>
                <p>No official application link is available for this listing.</p>
                <span className="no-official-link">OFFICIAL LINK NOT PROVIDED</span>
              </>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}

export default OpportunityDetailPage;