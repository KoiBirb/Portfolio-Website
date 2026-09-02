import { useEffect, useRef } from "react";

const projects = [
  {
    number: "01",
    eyebrow: "PCB Design / Flight Systems",
    title: "Flight Controller",
    summary:
      "A four-layer STM32 flight controller with USB, sensor interfaces, protected power, and nine PWM channels.",
    tags: ["Altium", "STM32F446", "USB FS", "SPI + I²C"],
  },
  {
    number: "02",
    eyebrow: "Industrial Controls / Communication",
    title: "HVAC–PLC Bridge",
    summary:
      "A compact interface translating HVAC communication into PLC-ready Modbus RTU over RS-485.",
    tags: ["Modbus RTU", "RS-485", "UART", "Oscilloscope"],
  },
  {
    number: "03",
    eyebrow: "Industrial Sensing / Analog Hardware",
    title: "Water Leak Module",
    summary:
      "An isolated sensing module with analog signal conditioning, fault detection, and dual controller outputs.",
    tags: ["18–72 VDC", "24 VAC", "Op Amps", "Relay Outputs"],
  },
];

function ArrowDown() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v17M5.5 13.5 12 20l6.5-6.5" />
    </svg>
  );
}

export default function App() {
  const storyRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const story = storyRef.current;
      const image = imageRef.current;
      if (!story || !image) return;

      const rect = story.getBoundingClientRect();
      const travel = story.offsetHeight - window.innerHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;

      image.style.setProperty("--scroll-progress", progress.toFixed(4));
      progressRef.current?.style.setProperty("--scroll-progress", progress.toFixed(4));
      frame = 0;
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Leo Bogaert, home">
          LB<span>.</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
        </nav>
        <div className="scroll-progress" aria-hidden="true">
          <span ref={progressRef} />
        </div>
      </header>

      <section className="scroll-story" ref={storyRef}>
        <div className="visual-pin" aria-hidden="true">
          <div className="scene-haze" />
          <img
            ref={imageRef}
            className="scene-image"
            src="./firewatch-tower.webp"
            alt=""
          />
          <div className="scene-shade" />
          <p className="image-marker marker-top">00° · Above the treeline</p>
          <p className="image-marker marker-bottom">Designed from the ground up</p>
        </div>

        <div className="story-content">
          <section className="story-panel hero-panel" id="home">
            <div className="hero-copy">
              <p className="section-label">Engineering portfolio · 2026</p>
              <h1>
                Leo
                <br />
                Bogaert
              </h1>
              <p className="hero-intro">
                Hardware, embedded systems,
                <br />
                and controls built to work.
              </p>
            </div>

            <a className="scroll-cue" href="#work">
              <span>Scroll to explore</span>
              <ArrowDown />
            </a>
          </section>

          <section className="story-panel project-panel project-left" id="work">
            <ProjectCard project={projects[0]} />
          </section>

          <section className="story-panel project-panel project-right">
            <ProjectCard project={projects[1]} />
          </section>

          <section className="story-panel project-panel project-left">
            <ProjectCard project={projects[2]} />
          </section>

          <section className="story-panel about-panel" id="about">
            <div className="about-card">
              <p className="section-label">04 · About</p>
              <h2>From first trace to final test.</h2>
              <p>
                I design custom PCBs, embedded interfaces, and control hardware,
                then validate the details with real instruments and real constraints.
              </p>
              <div className="skill-line">
                <span>Altium</span>
                <span>KiCad</span>
                <span>STM32</span>
                <span>ESP32</span>
                <span>LTspice</span>
              </div>
            </div>
            <p className="end-note">More project detail coming next.</p>
          </section>
        </div>
      </section>
    </main>
  );
}

type Project = (typeof projects)[number];

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <div className="project-meta">
        <span>{project.number}</span>
        <span>{project.eyebrow}</span>
      </div>
      <h2>{project.title}</h2>
      <p>{project.summary}</p>
      <ul aria-label={`${project.title} technologies`}>
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </article>
  );
}
