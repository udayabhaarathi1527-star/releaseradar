import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import { getProfessional, sendConnectionRequest } from "../utils/platformApi";
import "./ProfessionalDetailPage.css";

const formatPrice = (professional) => {
  if (professional.priceType === "negotiable") return "Negotiable";
  return `₹${Number(professional.price || 0).toLocaleString("en-IN")} / ${professional.priceType || "project"}`;
};

function ProfessionalDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, token } = useAuth();
  const [profileResult, setProfileResult] = useState({ id: null, professional: null, error: "" });
  const [connectionDraft, setConnectionDraft] = useState({ id: null, message: "" });
  const [connectionState, setConnectionState] = useState({ id: null, sending: false, sent: false, error: "" });

  useEffect(() => {
    const controller = new AbortController();
    getProfessional(id, controller.signal)
      .then((professional) => setProfileResult({ id, professional, error: "" }))
      .catch((requestError) => {
        if (requestError.code === "ERR_CANCELED") return;
        setProfileResult({
          id,
          professional: null,
          error: requestError.response?.data?.message || "Unable to load this profile.",
        });
      });
    return () => controller.abort();
  }, [id]);

  const handleConnect = async (event) => {
    event.preventDefault();
    const message = connectionDraft.id === id ? connectionDraft.message : "";

    if (message.trim().length < 10) {
      setConnectionState({ id, sending: false, sent: false, error: "Write at least 10 characters so the professional has context." });
      return;
    }
    setConnectionState({ id, sending: true, sent: false, error: "" });

    try {
      await sendConnectionRequest(id, message.trim(), token);
      setConnectionState({ id, sending: false, sent: true, error: "" });
      setConnectionDraft({ id, message: "" });
    } catch (requestError) {
      setConnectionState({
        id,
        sending: false,
        sent: false,
        error: requestError.response?.data?.message || "Unable to send your request. Please try again.",
      });
    }
  };

  const isCurrentProfile = profileResult.id === id;
  const professional = isCurrentProfile ? profileResult.professional : null;
  const error = isCurrentProfile ? profileResult.error : "";
  const message = connectionDraft.id === id ? connectionDraft.message : "";
  const requestState = connectionState.id === id
    ? connectionState
    : { sending: false, sent: false, error: "" };

  if (!isCurrentProfile) return <main className="professional-detail-state"><span className="platform-loader"></span><p>Loading professional profile...</p></main>;
  if (error || !professional) return (
    <main className="professional-detail-state">
      <h1>Profile unavailable</h1>
      <p>{error || "This professional could not be found."}</p>
      <Link to="/marketplace">Back to Marketplace</Link>
    </main>
  );

  return (
    <main className="professional-detail-page">
      <div className="professional-detail-breadcrumb"><Link to="/marketplace">Marketplace</Link><span>/</span><span>{professional.category}</span></div>
      {professional.isDemo && <p className="detail-demo-notice">SAMPLE PROFILE · Illustrative information, not a verified professional listing.</p>}

      <section className="professional-profile-header">
        <div className="professional-profile-photo">
          <span>{professional.name?.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
          <img src={professional.profilePhoto} alt={`${professional.name} profile`} onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />
        </div>
        <div className="professional-profile-intro">
          <p className="profile-role-kicker">{professional.category}</p>
          <h1>{professional.name}</h1>
          <p className="profile-role">{professional.role}</p>
          <div className="profile-quick-facts">
            <span>★ {Number(professional.rating || 0).toFixed(1)} <small>({professional.reviewCount || 0} reviews)</small></span>
            <span>{professional.location}</span>
            <span>{professional.experience} years experience</span>
            <span className={professional.availability ? "available-text" : "booked-text"}>{professional.availability ? "Available for projects" : "Currently booked"}</span>
          </div>
        </div>
        <a className="profile-jump-link" href="#connect">Connect <Icon type="arrow" /></a>
      </section>

      <div className="professional-detail-grid">
        <div className="professional-detail-main">
          <section className="profile-section-block">
            <p className="profile-section-kicker">01 / ABOUT</p>
            <h2>A little about the work</h2>
            <p className="profile-about-copy">{professional.bio || "No biography has been added yet."}</p>
          </section>

          <section className="profile-section-block">
            <p className="profile-section-kicker">02 / SKILLS & LANGUAGES</p>
            <h2>Practice and craft</h2>
            <div className="profile-detail-label">Skills</div>
            <div className="profile-chip-list">{(professional.skills || []).map((skill) => <span key={skill}>{skill}</span>)}</div>
            <div className="profile-detail-label profile-language-label">Languages</div>
            <div className="profile-chip-list">{(professional.languages || []).map((language) => <span key={language}>{language}</span>)}</div>
          </section>

          <section className="profile-section-block">
            <p className="profile-section-kicker">03 / PORTFOLIO</p>
            <h2>Selected work</h2>
            {professional.portfolio?.length ? (
              <div className="profile-portfolio-grid">
                {professional.portfolio.map((item, index) => (
                  <article className="profile-portfolio-item" key={`${item.title}-${index}`}>
                    <div className="profile-portfolio-image">
                      <img src={item.thumbnail} alt={item.title} loading="lazy" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />
                      {item.mediaType === "video" && <span className="portfolio-play">▶</span>}
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            ) : <p className="profile-muted">No portfolio items are listed yet.</p>}
          </section>

          <section className="profile-section-block">
            <p className="profile-section-kicker">04 / EXPERIENCE</p>
            <h2>Previous projects</h2>
            {professional.previousProjects?.length ? (
              <div className="profile-project-list">
                {professional.previousProjects.map((project, index) => (
                  <article className="profile-project-row" key={`${project.title}-${index}`}>
                    <div><strong>{project.title}</strong><span>{project.role}{project.year ? ` · ${project.year}` : ""}</span></div>
                    <p>{project.description}</p>
                  </article>
                ))}
              </div>
            ) : <p className="profile-muted">No previous projects are listed yet.</p>}
          </section>

          <section className="profile-section-block">
            <p className="profile-section-kicker">05 / REVIEWS</p>
            <h2>Client notes <span className="profile-review-summary">★ {Number(professional.rating || 0).toFixed(1)}</span></h2>
            {professional.reviews?.length ? (
              <div className="profile-review-list">
                {professional.reviews.map((review, index) => (
                  <article className="profile-review" key={`${review.name}-${index}`}>
                    <div><strong>{review.name}</strong><span>★ {Number(review.rating || 0).toFixed(1)}</span></div>
                    <p>{review.text}</p>
                  </article>
                ))}
              </div>
            ) : <p className="profile-muted">No reviews yet.</p>}
          </section>
        </div>

        <aside className="profile-contact-column">
          <div className="profile-rate-panel">
            <span>STARTING RATE</span>
            <strong>{formatPrice(professional)}</strong>
            <small>{professional.location}</small>
            <a href="#connect">Send a connection request <Icon type="arrow" /></a>
          </div>
          <section className="profile-connect-panel" id="connect">
            <p className="profile-section-kicker">LET'S MAKE SOMETHING</p>
            <h2>Start a conversation.</h2>
            {requestState.sent ? (
              <div className="connect-success"><Icon type="check" /><strong>Request sent</strong><p>Your message is with the professional. Contact details stay private until they choose to respond.</p></div>
            ) : isAuthenticated ? (
              <form onSubmit={handleConnect}>
                <label htmlFor="connection-message">Project note</label>
                <textarea id="connection-message" value={message} onChange={(event) => setConnectionDraft({ id, message: event.target.value })} maxLength={1200} placeholder="Share a little about the project and what you'd like to discuss." required />
                {requestState.error && <p className="connect-error" role="alert">{requestState.error}</p>}
                <button type="submit" disabled={requestState.sending}>{requestState.sending ? "Sending…" : "Send request"}<Icon type="arrow" /></button>
                <small>Your email and phone number are not shared in this request.</small>
              </form>
            ) : (
              <div className="connect-signin-note">
                <p>Sign in to send a private connection request.</p>
                <Link to="/login">Sign in <Icon type="arrow" /></Link>
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}

export default ProfessionalDetailPage;