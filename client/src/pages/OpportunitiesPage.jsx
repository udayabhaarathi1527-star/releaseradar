import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { getOpportunities } from "../utils/platformApi";
import "./OpportunitiesPage.css";

const categories = [
  "Short Film Competitions",
  "Film Festivals",
  "Student Film Competitions",
  "Screenwriting Competitions",
  "Workshops",
  "Film Awards",
  "Pitching Events",
  "Filmmaking Programs",
];

const dateLabel = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const daysRemaining = (date) => {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  return `${days} day${days === 1 ? "" : "s"} left`;
};

const safeWebsite = (value) => /^https:\/\//i.test(value || "");
const formatLocation = (format, location) => {
  const place = String(location || "").replace(/^online\s*[·-]\s*/i, "");
  return `${format} · ${place}`;
};

function OpportunityCard({ opportunity, featured = false }) {
  const statusClass = opportunity.status === "Closed" ? "closed" : opportunity.status === "Closing Soon" ? "closing" : "open";

  return (
    <article className={`opportunity-card ${featured ? "featured-opportunity" : ""}`}>
      <div className="opportunity-card-head">
        <span className="opportunity-category">{opportunity.category}</span>
        {opportunity.verificationStatus !== "verified" && (
          <span className="demo-badge">{opportunity.isDemo ? "SAMPLE" : "UNVERIFIED"}</span>
        )}
      </div>
      <h3>{opportunity.title}</h3>
      <p className="opportunity-organizer">{opportunity.organizer}</p>
      <p className="opportunity-description">{opportunity.description}</p>
      <div className="opportunity-quick-meta">
        <span><Icon type="calendar" /> {dateLabel(opportunity.deadline)}</span>
        <span className={`opportunity-status ${statusClass}`}>{opportunity.status}</span>
        <span>{formatLocation(opportunity.format, opportunity.location)}</span>
      </div>
      <div className="opportunity-fit-tags">
        {[...(opportunity.filmTypes || []).slice(0, 1), ...(opportunity.genres || []).filter((genre) => genre !== "Any").slice(0, 1)].map((item) => <span key={item}>{item}</span>)}
        <span>{opportunity.durationRequirement}</span>
      </div>
      <div className="opportunity-card-facts">
        <div><span>ENTRY</span><strong>{Number(opportunity.entryFee) === 0 ? "Free" : `₹${Number(opportunity.entryFee).toLocaleString("en-IN")}`}</strong></div>
        <div><span>REWARD</span><strong>{opportunity.prize || "Not specified"}</strong></div>
        <div><span>DEADLINE</span><strong>{daysRemaining(opportunity.deadline)}</strong></div>
        <div><span>ELIGIBILITY</span><strong>{(opportunity.eligibility || []).join(", ") || "Not specified"}</strong></div>
      </div>
      <div className="opportunity-card-actions">
        <Link to={`/opportunities/${opportunity._id}`}>View opportunity <Icon type="arrow" /></Link>
        {safeWebsite(opportunity.websiteUrl) && (
          <a href={opportunity.websiteUrl} target="_blank" rel="noopener noreferrer">Official site ↗</a>
        )}
      </div>
    </article>
  );
}

function OpportunitiesPage() {
  const [filters, setFilters] = useState({ search: "", category: "", filmType: "", genre: "", location: "", entryFee: "", deadline: "", eligibility: "", format: "", status: "", sort: "deadline-asc" });
  const [opportunities, setOpportunities] = useState([]);
  const [closingSoon, setClosingSoon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closingLoading, setClosingLoading] = useState(true);
  const [closingError, setClosingError] = useState("");
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    const controller = new AbortController();
    getOpportunities({ status: "Closing Soon", limit: 3, sort: "deadline-asc" }, controller.signal)
      .then((data) => setClosingSoon(data.opportunities || []))
      .catch((requestError) => {
        if (requestError.code !== "ERR_CANCELED") {
          setClosingSoon([]);
          setClosingError("Unable to load closing deadlines.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setClosingLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = {
      search: deferredSearch,
      category: filters.category,
      filmType: filters.filmType,
      genre: filters.genre,
      location: filters.location,
      entryFee: filters.entryFee,
      deadline: filters.deadline,
      eligibility: filters.eligibility,
      format: filters.format,
      status: filters.status,
      sort: filters.sort,
    };
    Object.keys(params).forEach((key) => { if (params[key] === "") delete params[key]; });
    const requestTimer = setTimeout(() => {
      getOpportunities(params, controller.signal)
        .then((data) => setOpportunities(data.opportunities || []))
        .catch((requestError) => {
          if (requestError.code === "ERR_CANCELED") return;
          setError(requestError.response?.data?.message || "Unable to load opportunities. Please try again.");
        })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 180);
    return () => {
      clearTimeout(requestTimer);
      controller.abort();
    };
  }, [deferredSearch, filters.category, filters.filmType, filters.genre, filters.location, filters.entryFee, filters.deadline, filters.eligibility, filters.format, filters.status, filters.sort, retryKey]);

  const updateFilter = (name, value) => {
    setLoading(true);
    setError("");
    setFilters((current) => ({ ...current, [name]: value }));
  };
  const clearFilters = () => {
    setLoading(true);
    setError("");
    setFilters({ search: "", category: "", filmType: "", genre: "", location: "", entryFee: "", deadline: "", eligibility: "", format: "", status: "", sort: "deadline-asc" });
  };
  const retry = () => {
    setLoading(true);
    setError("");
    setRetryKey((current) => current + 1);
  };

  return (
    <main className="opportunities-page">
      <section className="opportunities-intro">
        <div>
          <p className="platform-eyebrow"><span></span> OPEN CALLS & PROGRAMS</p>
          <h1>Find your next<br /><em>filmmaking opportunity.</em></h1>
          <p className="opportunities-lead">Competitions, festivals, workshops, awards, pitching events, and filmmaker programs.</p>
        </div>
        <div className="opportunities-intro-stamp"><Icon type="calendar" /><span>DEADLINES, IN VIEW</span><small>Browse by fit, format, and date</small></div>
      </section>

      <section className="closing-soon-section" aria-labelledby="closing-soon-title">
        <div className="closing-soon-heading">
          <div><p className="platform-eyebrow">NEXT UP</p><h2 id="closing-soon-title">Closing soon</h2></div>
          <span>Deadlines within 7 days</span>
        </div>
        {closingLoading ? (
          <div className="closing-soon-loading">Checking upcoming deadlines…</div>
        ) : closingError ? (
          <div className="closing-soon-empty" role="status">{closingError}</div>
        ) : closingSoon.length ? (
          <div className="closing-soon-grid">{closingSoon.map((opportunity) => <OpportunityCard key={opportunity._id} opportunity={opportunity} featured />)}</div>
        ) : (
          <div className="closing-soon-empty">No closing deadlines in the next 7 days.</div>
        )}
      </section>

      <section className="opportunity-search" aria-label="Search opportunities">
        <Icon type="search" />
        <input type="search" value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} placeholder="Search opportunities, organizers, or locations" aria-label="Search opportunities" />
        <button type="button" className="opportunity-filter-toggle" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><Icon type="settings" /> Filters</button>
      </section>

      <section className="opportunity-category-strip" aria-label="Browse opportunity categories">
        <button className={!filters.category ? "opportunity-chip selected" : "opportunity-chip"} onClick={() => updateFilter("category", "")}>All opportunities</button>
        {categories.map((category) => <button key={category} className={filters.category === category ? "opportunity-chip selected" : "opportunity-chip"} onClick={() => updateFilter("category", filters.category === category ? "" : category)}>{category}</button>)}
      </section>

      <div className="opportunities-layout">
        <aside className={`opportunity-filters ${filtersOpen ? "filters-open" : ""}`} aria-label="Opportunity filters">
          <div className="opportunity-filters-heading"><h2>Refine</h2><button type="button" onClick={clearFilters}>Clear filters</button></div>
          <label>Category<select value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}><option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label>Film type<select value={filters.filmType} onChange={(event) => updateFilter("filmType", event.target.value)}><option value="">Any film type</option>{["Short Film", "Feature Film", "Student Film", "Screenplay", "General"].map((option) => <option key={option}>{option}</option>)}</select></label>
          <label>Genre<select value={filters.genre} onChange={(event) => updateFilter("genre", event.target.value)}><option value="">Any genre</option>{["Any", "Drama", "Comedy", "Horror", "Thriller", "Documentary", "Animation", "Experimental"].map((option) => <option key={option}>{option}</option>)}</select></label>
          <label>Location<input value={filters.location} onChange={(event) => updateFilter("location", event.target.value)} placeholder="City, region, online" /></label>
          <label>Entry fee<select value={filters.entryFee} onChange={(event) => updateFilter("entryFee", event.target.value)}><option value="">Any fee</option><option value="free">Free</option><option value="paid">Paid</option></select></label>
          <label>Deadline<select value={filters.deadline} onChange={(event) => updateFilter("deadline", event.target.value)}><option value="">Any deadline</option><option value="7-days">Next 7 days</option><option value="30-days">Next 30 days</option><option value="upcoming">Upcoming only</option></select></label>
          <label>Eligibility<select value={filters.eligibility} onChange={(event) => updateFilter("eligibility", event.target.value)}><option value="">Any eligibility</option>{["Student", "General", "Professional", "Open to all"].map((option) => <option key={option}>{option}</option>)}</select></label>
          <label>Format<select value={filters.format} onChange={(event) => updateFilter("format", event.target.value)}><option value="">Any format</option>{["Online", "Offline", "Hybrid"].map((option) => <option key={option}>{option}</option>)}</select></label>
          <label>Status<select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}><option value="">Any status</option>{["Open", "Closing Soon", "Closed"].map((option) => <option key={option}>{option}</option>)}</select></label>
          <label>Sort by<select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}><option value="deadline-asc">Soonest deadline</option><option value="deadline-desc">Latest deadline</option><option value="newest">Recently added</option><option value="entry-fee-asc">Lowest entry fee</option></select></label>
        </aside>

        <section className="opportunity-results" aria-live="polite">
          <div className="opportunity-results-heading"><div><p className="platform-eyebrow">DISCOVERY</p><h2>{loading ? "Finding opportunities" : `${opportunities.length} opportunities`}</h2></div><span>DEADLINES ARE ORGANIZER-SUPPLIED</span></div>
          {loading ? (
            <div className="opportunity-list-skeleton" aria-label="Loading opportunities">{Array.from({ length: 4 }, (_, index) => <div key={index}></div>)}</div>
          ) : error ? (
            <div className="platform-message platform-error"><strong>{error}</strong><button type="button" onClick={retry}>Try again</button></div>
          ) : opportunities.length ? (
            <div className="opportunity-grid">{opportunities.map((opportunity) => <OpportunityCard key={opportunity._id} opportunity={opportunity} />)}</div>
          ) : (
            <div className="platform-message platform-empty"><span>NO MATCHING LISTINGS</span><h3>No opportunities found.</h3><p>Try changing your filters.</p><button type="button" onClick={clearFilters}>Clear filters</button></div>
          )}
        </section>
      </div>

      <p className="opportunity-data-note">Sample listings are illustrative and not verified. Confirm current dates, fees, eligibility, and submission details with the official organizer.</p>
    </main>
  );
}

export default OpportunitiesPage;