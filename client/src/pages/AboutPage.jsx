import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import "./AboutPage.css";

const pillars = [
  {
    number: "01",
    title: "AI Film Analyzer",
    text: "ReleaseRadar's existing film analysis system helps filmmakers examine a project's potential using its established prediction workflow.",
    link: "Open Analyzer",
    to: "/ai-analyzer",
  },
  {
    number: "02",
    title: "Filmmaker Marketplace",
    text: "A dedicated directory for discovering film professionals, reviewing their work, and sending a connection request.",
    link: "Browse professionals",
    to: "/marketplace",
  },
  {
    number: "03",
    title: "Film Opportunities",
    text: "A separate place to explore competitions, festivals, workshops, awards, pitching events, and filmmaker programs.",
    link: "Explore opportunities",
    to: "/opportunities",
  },
];

function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-intro">
        <p className="about-eyebrow">ABOUT RELEASE RADAR</p>
        <h1>More room for<br /><span>the work behind the film.</span></h1>
        <p className="about-lead">
          ReleaseRadar brings film analysis, creative talent discovery, and opportunity browsing into one independent filmmaker platform.
        </p>
      </section>

      <section className="about-pillars" aria-label="ReleaseRadar pillars">
        {pillars.map((pillar) => (
          <article className="about-pillar" key={pillar.number}>
            <span>{pillar.number}</span>
            <div>
              <h2>{pillar.title}</h2>
              <p>{pillar.text}</p>
              <Link to={pillar.to}>{pillar.link}<Icon type="arrow" /></Link>
            </div>
          </article>
        ))}
      </section>

      <section className="about-principle">
        <span className="about-principle-mark">RR</span>
        <div>
          <p className="about-eyebrow">THREE DISTINCT TOOLS</p>
          <h2>Connected in one place.<br />Independent by design.</h2>
          <p>Marketplace listings and opportunity records are kept separate from the film prediction system.</p>
        </div>
      </section>
    </main>
  );
}

export default AboutPage;