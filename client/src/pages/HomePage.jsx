import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import "./HomePage.css";

const pillars = [
  {
    index: "01",
    title: "AI Film Analyzer",
    description: "Explore a project with ReleaseRadar's existing film analysis system.",
    action: "Analyze a film",
    path: "/ai-analyzer",
    image: "photo-1485846234645-a62644f84728",
    imageAlt: "A cinema audience watching a film",
  },
  {
    index: "02",
    title: "Filmmaker Marketplace",
    description: "Find editors, designers, crew, and creative collaborators for your next production.",
    action: "Explore marketplace",
    path: "/marketplace",
    image: "photo-1521737711867-e3b97375f902",
    imageAlt: "Creative professionals planning a project together",
  },
  {
    index: "03",
    title: "Film Opportunities",
    description: "Browse festivals, competitions, workshops, and programs. Sample entries are clearly marked.",
    action: "Explore opportunities",
    path: "/opportunities",
    image: "photo-1506157786151-b8491531f063",
    imageAlt: "An audience at a live film event",
  },
];

function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <img
          className="home-hero-image"
          src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=2200&q=88"
          alt="A filmmaker's view across a cinema auditorium"
          fetchPriority="high"
        />
        <div className="home-hero-shade" />
        <div className="home-hero-content">
          <p className="home-eyebrow"><span></span> A PLATFORM FOR FILMMAKERS</p>
          <h1>Your filmmaking world,<br /><em>in focus.</em></h1>
          <p className="home-hero-copy">
            Analyze a project. Find your crew. Discover your next opportunity.
          </p>
          <div className="home-hero-actions">
            <Link className="home-primary-action" to="/ai-analyzer">
              Analyze a film <Icon type="arrow" />
            </Link>
            <Link className="home-text-action" to="/marketplace">Meet the community</Link>
          </div>
          <div className="home-hero-caption">
            <span>INDEPENDENT FILM, BETTER CONNECTED</span>
            <span>01 / 03</span>
          </div>
        </div>
      </section>

      <section className="home-pillars" aria-labelledby="pillars-title">
        <div className="home-section-heading">
          <div>
            <p className="home-eyebrow">THE RELEASE RADAR PLATFORM</p>
            <h2 id="pillars-title">One project. A whole ecosystem.</h2>
          </div>
          <p>Three independent tools for moving a film from first idea to wider reach.</p>
        </div>

        <div className="home-pillar-grid">
          {pillars.map((pillar) => (
            <article className="home-pillar" key={pillar.index}>
              <div className="home-pillar-image-wrap">
                <img
                  src={`https://images.unsplash.com/${pillar.image}?auto=format&fit=crop&w=1100&q=82`}
                  alt={pillar.imageAlt}
                  loading="lazy"
                />
                <span className="home-pillar-index">{pillar.index}</span>
              </div>
              <div className="home-pillar-copy">
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
                <Link to={pillar.path}>{pillar.action}<Icon type="arrow" /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-bottom-band">
        <span className="home-bottom-rule"></span>
        <p>Built around the people who make films.</p>
        <Link to="/about">About ReleaseRadar <Icon type="arrow" /></Link>
      </section>
    </div>
  );
}

export default HomePage;