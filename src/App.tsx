import { useEffect, useRef, useState, type CSSProperties } from "react";

const backgroundSong = {
  // Add a file to public/music, then set its path here, for example:
  // src: "./music/background-song.mp3",
  src: "./music/Background.mp3",
  title: "Background music",
  volume: 0.35,
};

type ProjectSlide =
  | string
  | {
      title: string;
      image: string;
      alt?: string;
    };

type Project = {
  number: string;
  year: string;
  showGithub: boolean;
  githubUrl: string;
  eyebrow: string;
  title: string;
  summary: string;
  tags: string[];
  slides: ProjectSlide[];
};

const projects: Project[] = [
  {
    number: "01",
    year: "2026",
    showGithub: false,
    githubUrl: "",
    eyebrow: "Audio Electronics / Electrical",
    title: "Class D Amplifier",
    summary:
      "A custom Class D audio amplifier designed from the ground up, using a 555 timer and analog audio input to generate PWM signals. The design includes a MOSFET gate driver to run a MOSFET output stage, driving a speaker with ~80% efficiency. The project included circuit design, component selection, PCB layout in Altium Designer, signal filtering, and oscilloscope-based testing, debugging and enclosure design using fusion 360.",
    tags: ["Altium", "PCB Design", "Circuit Design", "Fusion 360", "Oscilloscope"],
    slides: [
      // Add an image by setting its path, for example:
      // { title: "PCB render", image: "./projects/amplifier-pcb.jpg", alt: "Amplifier PCB render" },
      "PCB render",
      "Layer stack",
      "Bench testing",
    ],
  },
  {
    number: "02",
    year: "2026",
    showGithub: false,
    githubUrl: "",
    eyebrow: "Embedded Systems / Electrical",
    title: "STM32 Flight Controller",
    summary:
      "Designed and developed a custom STM32-based flight controller for a fixed-wing RC aircraft. The board integrates an STM32F446 microcontroller, IMU and barometric pressure sensors, USB communication, ELRS radio connectivity, and multiple PWM outputs for flight-control hardware. The project involved schematic design, component selection, power regulation, four-layer PCB layout, USB differential-pair routing, and hardware bring-up using STM32CubeMX, C/C++, and SWD debugging.",
    tags: ["Altium", "SPI & I2C", "UART", "USB", "STM32CubeMX"],
    slides: ["Communication interface", "Signal capture", "Prototype hardware"],
  },
  {
    number: "03",
    year: "2025",
    showGithub: true,
    githubUrl: "https://github.com/mynteee/tracking-14-a",
    eyebrow: "IoT Asset Tracking / Software & Hardware",
    title: "Esp32 Asset Tracking",
    summary:
      "Developed an ESP32-based indoor tracking system designed to monitor BLE-enabled assets across hospital rooms and zones. Multiple ESP32 gateways scan for low-power Bluetooth beacons and use received signal strength to estimate each tag’s location, tracking data transmitted over Wi-Fi to a central MQTT server for monitoring and visualization on a web-based dashboard.",
    tags: ["Esp32", "BLE", "MQTT", "Wifi"],
    slides: ["Schematic", "PCB layout", "Validation setup"],
  },
  {
    number: "04",
    year: "2025",
    showGithub: false,
    githubUrl: "",
    eyebrow: "Gearbox Design / Mechanical",
    title: "Harmonic Drive",
    summary: "Designed and developed a custom harmonic drive gearbox using a flex spline printed in nylon and wave generator to achieve compact, high-ratio 20:1 motion transmission. The project was to be used on a nema 17 stepper motor and focused on mechanical design, gear geometry, material selection, and designing components specifically for additive manufacturing while balancing flexibility, stiffness and durability.",
    tags: ["Gear Design", "Fusion 360", "Material Selection", "Additive Manufacturing", "Stepper Motor"],
    slides: ["Project image", "Design detail", "Final result"],
  },
  {
    number: "05",
    year: "2025",
    showGithub: false,
    githubUrl: "",
    eyebrow: "Drone Design / Mechanical & Electrical",
    title: "3D Printed Drone",
    summary: "Designed and built a custom 3D-printed drone, developing the airframe from scratch, printed with carbon-filled petg with a focus on weight, strength, and component integration. I used betaflight to configure a F405 mini flight controller stack to enable smooth flight. This project combined CAD modelling, additive manufacturing, electronics integration, assembly, and iterative testing to refine the frame and overall flight platform.",
    tags: ["Fusion 360", "Bambu Slicer", "Betaflight", "Additive Manufacturing"],
    slides: ["Project image", "Design detail", "Final result"],
  },
  {
    number: "06",
    year: "2025",
    showGithub: true,
    githubUrl: "https://github.com/KoiBirb/Forsaken-Crown",
    eyebrow: "Game Design / Software",
    title: "Arcade Machine Game",
    summary: "Designed and developed a hack and slash platformer game inspired by hollow knight. I used java swing to display the graphics and developed fundamental skills in organization of an over 20k+ line project. Tiled and json simple was used to create and store the map.",
    tags: ["Java", "Intelij", "JSON", "Github", "Tiled"],
    slides: ["Project image", "Design detail", "Final result"],
  },
  {
    number: "07",
    year: "2024",
    showGithub: true,
    githubUrl: "https://github.com/KoiBirb/Robot-Dog",
    eyebrow: "Quadruped Robotics / Mechanical / Electrical",
    title: "Robot Dog",
    summary: "Designed and built a custom quadruped robot dog for a Western University competition, integrating an ESP32, custom KiCad PCB, servo driver, and 12 actuated joints. The project combined mechanical design, electronics, and inverse kinematics to coordinate multi-joint leg motion and produce controlled walking movements.",
    tags: ["C++", "Arduino IDE", "KiCad", "ESP32", "Inverse Kinematics", "Servos"],
    slides: ["Project image", "Design detail", "Final result"],
  },
];
function ArrowDown() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v17M5.5 13.5 12 20l6.5-6.5" />
    </svg>
  );
}

function PageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 2.75h8l4 4V21.25H6z" />
      <path d="M14 2.75v4h4M9 12h6M9 16h6" />
    </svg>
  );
}

function AudioIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10v4h3l4 3V7l-4 3z" />
      {muted ? (
        <path d="m15 10 4 4m0-4-4 4" />
      ) : (
        <path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10" />
      )}
    </svg>
  );
}

export default function App() {
  const storyRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [activeYear, setActiveYear] = useState("2026");
  const activeYearRef = useRef("2026");
  const [yearPulse, setYearPulse] = useState(false);
  const [mobileSocialVisible, setMobileSocialVisible] = useState(true);
  const [musicMuted, setMusicMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(backgroundSong.volume);
  const [mobileVolumeOpen, setMobileVolumeOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastVolumeRef = useRef(backgroundSong.volume);
  const mobileAudioTapRef = useRef<number | null>(null);
  const autoplayBlockedRef = useRef(false);
  const timelineYears = Array.from(
    new Set(["2026", ...projects.map((project) => project.year)]),
  );

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
      const focusedPanel = panels.reduce((mostVisible, panel) => {
        const panelRect = panel.getBoundingClientRect();
        const visibleHeight = Math.max(
          0,
          Math.min(panelRect.bottom, window.innerHeight) - Math.max(panelRect.top, 0),
        );
        const visibleRatio = visibleHeight / Math.min(panelRect.height, window.innerHeight);
        return visibleRatio > mostVisible.ratio ? { panel, ratio: visibleRatio } : mostVisible;
      }, { panel: panels[0], ratio: 0 });

      if (focusedPanel.panel && focusedPanel.ratio >= 0.88) {
        const nextYear = focusedPanel.panel.dataset.year ?? "2026";
        if (nextYear !== activeYearRef.current) {
          activeYearRef.current = nextYear;
          setActiveYear(nextYear);
          setYearPulse((pulse) => !pulse);
        }
      }
      setMobileSocialVisible(window.scrollY < Math.max(120, window.innerHeight * 0.18));
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
      if (mobileAudioTapRef.current !== null) window.clearTimeout(mobileAudioTapRef.current);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !backgroundSong.src) return;

    audio.volume = backgroundSong.volume;
    audio.muted = false;

    const unlockPlayback = (event: Event) => {
      if (!autoplayBlockedRef.current) {
        removeUnlockListeners();
        return;
      }
      if (event.target instanceof Element && event.target.closest(".audio-toggle")) return;
      audio.muted = false;
      setMusicMuted(false);
      autoplayBlockedRef.current = false;
      void audio.play().then(removeUnlockListeners).catch(() => undefined);
    };
    const removeUnlockListeners = () => {
      window.removeEventListener("pointerdown", unlockPlayback);
      window.removeEventListener("keydown", unlockPlayback);
    };

    void audio.play().catch(() => {
      autoplayBlockedRef.current = true;
      audio.muted = true;
      setMusicMuted(true);
      window.addEventListener("pointerdown", unlockPlayback, { passive: true });
      window.addEventListener("keydown", unlockPlayback);
    });

    return removeUnlockListeners;
  }, []);

  const toggleMusicMute = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.muted = false;
      setMusicMuted(false);
      autoplayBlockedRef.current = false;
      try {
        await audio.play();
      } catch {
        autoplayBlockedRef.current = true;
      }
      return;
    }

    if (audio.muted) {
      const restoredVolume = lastVolumeRef.current || backgroundSong.volume;
      audio.volume = restoredVolume;
      audio.muted = false;
      autoplayBlockedRef.current = false;
      setMusicVolume(restoredVolume);
      setMusicMuted(false);
      try {
        await audio.play();
      } catch {
        audio.muted = true;
        setMusicMuted(true);
      }
    } else {
      if (audio.volume > 0) lastVolumeRef.current = audio.volume;
      audio.muted = true;
      setMusicMuted(true);
    }
  };

  const handleAudioButton = async () => {
    const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (!isTouchDevice) {
      await toggleMusicMute();
      return;
    }

    setMobileVolumeOpen(true);
    if (mobileAudioTapRef.current !== null) {
      window.clearTimeout(mobileAudioTapRef.current);
      mobileAudioTapRef.current = null;
      await toggleMusicMute();
      setMobileVolumeOpen(false);
    } else {
      mobileAudioTapRef.current = window.setTimeout(() => {
        mobileAudioTapRef.current = null;
      }, 350);
    }
  };

  const handleVolumeChange = async (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    setMusicVolume(value);
    audio.volume = value;
    audio.muted = value === 0;
    setMusicMuted(value === 0);
    if (value > 0) {
      lastVolumeRef.current = value;
      try {
        await audio.play();
      } catch {
        audio.muted = true;
        setMusicMuted(true);
      }
    }
  };

  return (
    <main>
      <nav
        className={`social-links${mobileSocialVisible ? "" : " is-mobile-hidden"}`}
        aria-label="Social profiles"
      >
        {backgroundSong.src && (
          <div className={`audio-control${mobileVolumeOpen ? " is-open" : ""}`}>
            <audio ref={audioRef} src={backgroundSong.src} preload="auto" autoPlay loop />
            <div className="volume-popover">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={musicMuted ? 0 : musicVolume}
                onChange={(event) => handleVolumeChange(Number(event.target.value))}
                aria-label="Background music volume"
              />
            </div>
            <button
              className="audio-toggle"
              type="button"
              onClick={handleAudioButton}
              aria-label={musicMuted ? `Unmute ${backgroundSong.title}` : `Mute ${backgroundSong.title}`}
              aria-pressed={!musicMuted}
            >
              <AudioIcon muted={musicMuted} />
            </button>
          </div>
        )}
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
              className={`timeline-current ${yearPulse ? "pulse-a" : "pulse-b"}`}
              style={{
                "--timeline-position": `${Math.max(0, timelineYears.indexOf(activeYear)) / Math.max(1, timelineYears.length - 1) * 100}%`,
              } as CSSProperties}
            >
              <span className="timeline-year-label">{activeYear}</span>
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
              <p className="hero-specialties">Robotics <span>|</span> Aerospace</p>
            </div>

            <a
              className="resume-link"
              href="./Leo%20Bogaert%20Resume.pdf"
              target="_blank"
              rel="noreferrer"
            >
              <PageIcon />
              <span>Resume</span>
              <span aria-hidden="true">↗</span>
            </a>

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

          {projects.map((project, index) => {
            const isLastProject = index === projects.length - 1;

            return (
              <section
                className={`story-panel project-panel ${index % 2 === 0 ? "project-left" : "project-right"}`}
                id={index === 0 ? "work" : undefined}
                data-year={project.year}
                key={project.number}
              >
                <ProjectCard project={project} />
                {isLastProject && (
                  <>
                    <p className="end-note">More projects coming soon!</p>
                    <a className="back-to-top" href="#home">
                      <span aria-hidden="true">↑</span>
                      <span>Back to top</span>
                    </a>
                  </>
                )}
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}

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
        <div className="project-links">
          <ul aria-label={`${project.title} technologies`}>
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          {project.showGithub && (
            <a
              className="project-github"
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`View ${project.title} on GitHub`}
            >
              <img src="./github.svg" alt="" />
              <span>GitHub</span>
            </a>
          )}
        </div>
      </div>
      <ProjectCarousel title={project.title} slides={project.slides} />
    </article>
  );
}

function ProjectCarousel({ title, slides }: { title: string; slides: ProjectSlide[] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slideTitle = (slide: ProjectSlide) =>
    typeof slide === "string" ? slide : slide.title;

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
            <figure
              className={`carousel-slide carousel-tone-${index + 1}`}
              key={`${slideTitle(slide)}-${index}`}
            >
              {typeof slide !== "string" && slide.image && (
                <img
                  className="carousel-image"
                  src={slide.image}
                  alt={slide.alt ?? slide.title}
                />
              )}
              <div className="carousel-grid" aria-hidden="true" />
              <figcaption>
                <span>
                  {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </span>
                <strong>{slideTitle(slide)}</strong>
                <small>{typeof slide !== "string" && slide.image ? "Project image" : "Project image slot"}</small>
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
              aria-label={`Show ${slideTitle(slide)}`}
              aria-current={index === activeSlide ? "true" : undefined}
              key={`${slideTitle(slide)}-${index}`}
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
