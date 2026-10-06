import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { getProfessionals } from "../utils/platformApi";
import "./MarketplacePage.css";

const categories = [
  "Video Editors",
  "Poster Designers",
  "Graphic Designers",
  "Colorists",
  "Sound Designers",
  "VFX Artists",
  "Trailer Editors",
  "Social Media / Promotion Services",
  "Actors",
  "Cinematographers",
  "Writers",
  "Other Film Crew",
];

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

function MarketplacePage() {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    availability: "",
    sort: "recommended",
  });
  const [professionals, setProfessionals] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    const controller = new AbortController();
    const params = {
      search: deferredSearch,
      category: filters.category,
      location: filters.location,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minRating: filters.minRating,
      availability: filters.availability,
      sort: filters.sort,
    };

    Object.keys(params).forEach((key) => {
      if (params[key] === "") delete params[key];
    });

    const requestTimer = setTimeout(() => {
      getProfessionals(params, controller.signal)
        .then((data) => {
          setProfessionals(data.professionals || []);
          setTotal(data.total || 0);
        })
        .catch((requestError) => {
          if (requestError.code === "ERR_CANCELED") return;
          setError(requestError.response?.data?.message || "Unable to load professionals. Please try again.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 180);

    return () => {
      clearTimeout(requestTimer);
      controller.abort();
    };
  }, [deferredSearch, filters.category, filters.location, filters.minPrice, filters.maxPrice, filters.minRating, filters.availability, filters.sort, retryKey]);

  const updateFilter = (name, value) => {
    setLoading(true);
    setError("");
    setFilters((current) => ({ ...current, [name]: value }));
  };
  const clearFilters = () => {
    setLoading(true);
    setError("");
    setFilters({ search: "", category: "", location: "", minPrice: "", maxPrice: "", minRating: "", availability: "", sort: "recommended" });
  };
  const retry = () => {
    setLoading(true);
    setError("");
    setRetryKey((current) => current + 1);
  };

  return (
    <main className="marketplace-page">
      <section className="marketplace-intro">
        <div>
          <p className="platform-eyebrow"><span></span> CREATIVE NETWORK</p>
          <h1>Find the people<br /><em>behind your next film.</em></h1>
          <p className="marketplace-lead">Discover editors, designers, actors, cinematographers, writers, VFX artists, and other film crew for your next project.</p>
        </div>
        <div className="marketplace-intro-note">
          <span className="marketplace-live-mark"></span>
          <span>PROFESSIONAL DIRECTORY</span>
          <small>Browse listings · connect directly</small>
        </div>
      </section>

      <section className="marketplace-search" aria-label="Search professionals">
        <Icon type="search" />
        <input
          type="search"
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Search by name, skill, service, or location"
          aria-label="Search by name, skill, service, or location"
        />
        <button type="button" className="marketplace-filter-toggle" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}>
          <Icon type="settings" /> Filters
        </button>
      </section>

      <section className="marketplace-category-strip" aria-label="Browse by category">
        <button className={!filters.category ? "category-chip selected" : "category-chip"} onClick={() => updateFilter("category", "")}>All roles</button>
        {categories.map((category) => (
          <button key={category} className={filters.category === category ? "category-chip selected" : "category-chip"} onClick={() => updateFilter("category", filters.category === category ? "" : category)}>
            {category}
          </button>
        ))}
      </section>

      <div className="marketplace-layout">
        <aside className={`marketplace-filters ${filtersOpen ? "filters-open" : ""}`} aria-label="Marketplace filters">
          <div className="marketplace-filters-heading">
            <h2>Refine</h2>
            <button type="button" onClick={clearFilters}>Clear filters</button>
          </div>
          <label>
            Category
            <select value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}>
              <option value="">All categories</option>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label>
            Location
            <input value={filters.location} onChange={(event) => updateFilter("location", event.target.value)} placeholder="City or region" />
          </label>
          <fieldset className="marketplace-price-fields">
            <legend>Starting rate · INR</legend>
            <input type="number" min="0" value={filters.minPrice} onChange={(event) => updateFilter("minPrice", event.target.value)} placeholder="Min" aria-label="Minimum price" />
            <input type="number" min="0" value={filters.maxPrice} onChange={(event) => updateFilter("maxPrice", event.target.value)} placeholder="Max" aria-label="Maximum price" />
          </fieldset>
          <label>
            Minimum rating
            <select value={filters.minRating} onChange={(event) => updateFilter("minRating", event.target.value)}>
              <option value="">Any rating</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
              <option value="4.8">4.8+</option>
            </select>
          </label>
          <label>
            Availability
            <select value={filters.availability} onChange={(event) => updateFilter("availability", event.target.value)}>
              <option value="">Any availability</option>
              <option value="true">Available now</option>
              <option value="false">Not available</option>
            </select>
          </label>
          <label>
            Sort by
            <select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="highest-rated">Highest rated</option>
              <option value="lowest-price">Lowest price</option>
              <option value="highest-experience">Most experience</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </aside>

        <section className="marketplace-results" aria-live="polite">
          <div className="marketplace-results-heading">
            <div>
              <p className="platform-eyebrow">THE CREW DIRECTORY</p>
              <h2>{loading ? "Finding professionals" : `${total} professionals`}</h2>
            </div>
            <span>{filters.category || "All disciplines"}</span>
          </div>

          {loading ? (
            <div className="professional-grid" aria-label="Loading professionals">
              {Array.from({ length: 6 }, (_, index) => <div className="professional-skeleton" key={index}></div>)}
            </div>
          ) : error ? (
            <div className="platform-message platform-error">
              <strong>{error}</strong>
              <button type="button" onClick={retry}>Try again</button>
            </div>
          ) : professionals.length === 0 ? (
            <div className="platform-message platform-empty">
              <span>NO MATCHING LISTINGS</span>
              <h3>No professionals found.</h3>
              <p>Try changing your search or filters.</p>
              <button type="button" onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            <div className="professional-grid">
              {professionals.map((professional) => (
                <article className="professional-card" key={professional._id}>
                  <div className="professional-card-top">
                    <div className="professional-avatar-wrap">
                      <img src={professional.profilePhoto} alt={`${professional.name} profile`} loading="lazy" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />
                      <span>{professional.name?.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                    </div>
                    <div className="professional-card-heading">
                      <span className="professional-category">{professional.category}</span>
                      <h3>{professional.name}</h3>
                      <p>{professional.role}</p>
                    </div>
                    {professional.isDemo && <span className="demo-badge">SAMPLE</span>}
                  </div>
                  <p className="professional-bio">{professional.bio}</p>
                  <div className="professional-meta">
                    <span><Icon type="chart" /> {professional.experience} yrs</span>
                    <span><Icon type="search" /> {professional.location}</span>
                    <span className="professional-languages">{(professional.languages || []).slice(0, 2).join(" · ")}</span>
                  </div>
                  <div className="professional-skills">
                    {(professional.skills || []).slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}
                  </div>
                  <div className="professional-card-bottom">
                    <div>
                      <strong>{professional.priceType === "negotiable" ? "Negotiable" : `${money(professional.price)} / ${professional.priceType || "project"}`}</strong>
                      <span className="professional-rating">★ {Number(professional.rating || 0).toFixed(1)} <small>({professional.reviewCount || 0})</small></span>
                    </div>
                    <span className={`availability-label ${professional.availability ? "available" : "unavailable"}`}>
                      {professional.availability ? "Available" : "Booked"}
                    </span>
                  </div>
                  {professional.portfolio?.[0] && (
                    <Link className="professional-portfolio-preview" to={`/marketplace/${professional._id}`} aria-label={`View ${professional.name}'s portfolio`}>
                      <img src={professional.portfolio[0].thumbnail} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />
                      <span>PORTFOLIO · {professional.portfolio[0].title}</span>
                    </Link>
                  )}
                  {professional.previousProjects?.[0] && (
                    <p className="professional-project-preview">
                      PREVIOUS PROJECT <strong>{professional.previousProjects[0].title}</strong>
                    </p>
                  )}
                  <div className="professional-actions">
                    <Link to={`/marketplace/${professional._id}`}>View profile <Icon type="arrow" /></Link>
                    <Link to={`/marketplace/${professional._id}#connect`}>Connect</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default MarketplacePage;