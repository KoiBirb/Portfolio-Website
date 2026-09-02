import { useEffect, useRef, useState, type CSSProperties } from "react";

const projects = [
  {
    number: "01",
    year: "2025",
    eyebrow: "PCB Design / Electrical",
    title: "Class D Amplifier",
    summary:
      "A custom Class D audio amplifier designed from the ground up, using a 555 timer and analog audio input to generate PWM signals. The design includes a MOSFET gate driver to run the MOSFET output stage, driving a speaker with ~80% efficiency. The project included circuit design, component selection, PCB layout in Altium Designer, signal filtering, and oscilloscope-based testing, debugging and enclosure design using fusion 360.",
    tags: ["Altium", "Audio Electronics", "Fusion 360", "Oscilloscope"],
    slides: ["PCB render", "Layer stack", "Bench testing"],
  },
  {
    number: "02",
    year: "2024",
    eyebrow: "Industrial Controls / Communication",
    title: "HVAC–PLC Bridge",
    summary:
      "A compact interface translating HVAC communication into PLC-ready Modbus RTU over RS-485.",
    tags: ["Modbus RTU", "RS-485", "UART", "Oscilloscope"],
    slides: ["Communication interface", "Signal capture", "Prototype hardware"],
  },
  {
    number: "03",
    year: "2023",
    eyebrow: "Industrial Sensing / Analog Hardware",
    title: "Water Leak Module",
    summary:
      "An isolated sensing module with analog signal conditioning, fault detection, and dual controller outputs.",
    tags: ["18–72 VDC", "24 VAC", "Op Amps", "Relay Outputs"],
    slides: ["Schematic", "PCB layout", "Validation setup"],
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
  const [activeYear, setActiveYear] = useState("2026");
  const timelineYears = ["2026", ...projects.map((project) => project.year)];

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const story = storyRef.current;
      const image = imageRef.current;
      if (!story || !image) return;

      const rect = story.getBoundingClientRect();
      const travel = story.offsetHeight - window.innerHeight;
      const progress = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
      const imageTravel = Math.max(0, image.offsetHeight - window.innerHeight);

      image.style.setProperty(
        "--image-offset",
        `${(-progress * imageTravel).toFixed(2)}px`,
      );

      const panels = Array.from(story.querySelectorAll<HTMLElement>("[data-year]"));
      // A higher visual checkpoint delays the year change until the incoming
      // project is substantially on screen.
      const viewportFocus = window.innerHeight * 0.25;
      const focusedPanel = panels.reduce((closest, panel) => {
        const panelRect = panel.getBoundingClientRect();
        const distance = Math.abs(panelRect.top + panelRect.height / 2 - viewportFocus);
        return distance < closest.distance ? { panel, distance } : closest;
      }, { panel: panels[0], distance: Number.POSITIVE_INFINITY });

      if (focusedPanel.panel) setActiveYear(focusedPanel.panel.dataset.year ?? "2026");
      frame = 0;
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    imageRef.current?.addEventListener("load", requestUpdate);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      imageRef.current?.removeEventListener("load", requestUpdate);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <main>
      <nav className="social-links" aria-label="Social profiles">
        <a href="https://www.linkedin.com/in/leo-bogaert/" target="_blank" rel="noreferrer">
          <img src="./linkedin.png" alt="LinkedIn" />
        </a>
        <a href="https://github.com/koibirb" target="_blank" rel="noreferrer">
          <img src="./github.svg" alt="GitHub" />
        </a>
      </nav>
      <section className="scroll-story" ref={storyRef}>
        <div className="visual-pin" aria-hidden="true">
          <div className="scene-haze" />
          <img
            ref={imageRef}
            className="scene-image"
            src="./firewatch-tower.svg"
            alt=""
            width="696"
            height="1505"
          />
          <div className="scene-shade" />
          <p className="image-marker marker-top">00° · Above the treeline</p>
          <div className="year-timeline">
            <span
              className="timeline-current"
              style={{
                "--timeline-position": `${Math.max(0, timelineYears.indexOf(activeYear)) / (timelineYears.length - 1) * 100}%`,
              } as CSSProperties}
            >
              {activeYear}
            </span>
            <span
              className={`timeline-last${activeYear === projects.at(-1)?.year ? " is-hidden" : ""}`}
            >
              {projects.at(-1)?.year}
            </span>
          </div>
          <p className="image-marker marker-bottom">Designed from the ground up</p>
        </div>

        <div className="story-content">
          <section className="story-panel hero-panel" id="home" data-year="2026">
            <div className="hero-copy">
              <p className="section-label">Engineering portfolio · 2026</p>
              <h1>
                Leo
                <br />
                Bogaert
              </h1>
              <p className="hero-intro">Electrical Engineering</p>
            </div>

            <a className="scroll-cue" href="#work">
              <span>Scroll to explore</span>
              <ArrowDown />
            </a>
          </section>

          <section className="story-panel about-panel" id="about" data-year="2026">
            <div className="about-card">
              <p className="section-label">About</p>
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
          </section>

          <section className="story-panel project-panel project-left" id="work" data-year={projects[0].year}>
            <ProjectCard project={projects[0]} />
          </section>

          <section className="story-panel project-panel project-right" data-year={projects[1].year}>
            <ProjectCard project={projects[1]} />
          </section>

          <section className="story-panel project-panel project-left" data-year={projects[2].year}>
            <ProjectCard project={projects[2]} />
            <p className="end-note">More projects coming soon!</p>
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
      <div className="project-copy">
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
      </div>
      <ProjectCarousel title={project.title} slides={project.slides} />
    </article>
  );
}

function ProjectCarousel({ title, slides }: { title: string; slides: string[] }) {
  const [activeSlide, setActiveSlide] = useState(0);

  const previousSlide = () => {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
  };

  return (
    <div className="project-carousel" aria-label={`${title} image carousel`}>
      <div className="carousel-viewport">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <figure className={`carousel-slide carousel-tone-${index + 1}`} key={slide}>
              <div className="carousel-grid" aria-hidden="true" />
              <figcaption>
                <span>
                  {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </span>
                <strong>{slide}</strong>
                <small>Project image slot</small>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="carousel-controls">
        <button type="button" onClick={previousSlide} aria-label={`Previous ${title} image`}>
          ←
        </button>
        <div className="carousel-dots" aria-label="Choose image">
          {slides.map((slide, index) => (
            <button
              type="button"
              className={index === activeSlide ? "is-active" : ""}
              onClick={() => setActiveSlide(index)}
              aria-label={`Show ${slide}`}
              aria-current={index === activeSlide ? "true" : undefined}
              key={slide}
            />
          ))}
        </div>
        <button type="button" onClick={nextSlide} aria-label={`Next ${title} image`}>
          →
        </button>
      </div>
    </div>
  );
}
