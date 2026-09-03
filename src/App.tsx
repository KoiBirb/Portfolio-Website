import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { createPortal } from "react-dom";

const backgroundSong = {
  // Add a file to public/music, then set its path here, for example:
  // src: "./music/background-song.mp3",
  src: "./music/Background.mp3",
  title: "Background music",
  volume: 0.30,
};

const interfaceSounds = {
  hover: "./music/Hover.mp3",
  click: "./music/Click.mp3",
};

const audioSettingsKey = "portfolio-audio-settings";

function readAudioSettings() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(audioSettingsKey) ?? "null");
    const volume = Number(saved?.volume);
    return {
      muted: saved?.muted === true,
      volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : backgroundSong.volume,
    };
  } catch {
    return { muted: false, volume: backgroundSong.volume };
  }
}

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
      "A custom Class D audio amplifier designed using a 555 timer and analog audio input to generate PWM signals. The design includes a MOSFET gate driver to run a MOSFET output stage, driving a speaker with ~80% efficiency. The project included circuit design, component selection, PCB layout in Altium Designer, signal filtering, and oscilloscope-based testing, debugging and enclosure design using fusion 360.",
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
    tags: ["Esp32", "BLE", "MQTT", "Wifi", "Onshape"],
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
  const [musicMuted, setMusicMuted] = useState(() => readAudioSettings().muted);
  const [musicVolume, setMusicVolume] = useState(() => readAudioSettings().volume);
  const [playbackBlocked, setPlaybackBlocked] = useState(true);
  const [mobileVolumeOpen, setMobileVolumeOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastVolumeRef = useRef(musicVolume);
  const autoplayBlockedRef = useRef(false);
  const resumeAfterFocusRef = useRef(false);
  const interfaceVolumeRef = useRef({ muted: musicMuted, volume: musicVolume });
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
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      audioSettingsKey,
      JSON.stringify({ muted: musicMuted, volume: musicVolume }),
    );
    interfaceVolumeRef.current = {
      muted: musicMuted || playbackBlocked,
      volume: musicVolume,
    };
  }, [musicMuted, musicVolume, playbackBlocked]);

  useEffect(() => {
    const hoverSound = new Audio(interfaceSounds.hover);
    const clickSound = new Audio(interfaceSounds.click);
    hoverSound.preload = "auto";
    clickSound.preload = "auto";

    const playSound = (sound: HTMLAudioElement, volumeMultiplier = 1) => {
      const settings = interfaceVolumeRef.current;
      if (settings.muted || settings.volume === 0) return;
      sound.volume = Math.min(1, settings.volume * volumeMultiplier);
      sound.currentTime = 0;
      void sound.play().catch(() => undefined);
    };
    const findControl = (target: EventTarget | null) =>
      target instanceof Element
        ? target.closest("button, a, .carousel-viewport, .lightbox-viewport")
        : null;
    const handlePointerOver = (event: PointerEvent) => {
      const control = findControl(event.target);
      if (!control || (event.relatedTarget instanceof Node && control.contains(event.relatedTarget))) return;
      playSound(hoverSound);
    };
    const handleClick = (event: MouseEvent) => {
      if (findControl(event.target)) playSound(clickSound, 1.5);
    };

    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("click", handleClick);
      hoverSound.pause();
      clickSound.pause();
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !backgroundSong.src) return;

    audio.volume = musicVolume;
    audio.muted = musicMuted;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !backgroundSong.src) return;

    const pauseWhenInactive = () => {
      if (!audio.paused) resumeAfterFocusRef.current = true;
      audio.pause();
    };

    const resumeWhenActive = () => {
      if (
        !resumeAfterFocusRef.current ||
        document.visibilityState !== "visible" ||
        !document.hasFocus()
      ) return;

      void audio.play().then(() => {
        resumeAfterFocusRef.current = false;
      }).catch(() => undefined);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") pauseWhenInactive();
      else resumeWhenActive();
    };

    window.addEventListener("blur", pauseWhenInactive);
    window.addEventListener("focus", resumeWhenActive);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", pauseWhenInactive);
      window.removeEventListener("focus", resumeWhenActive);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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
        setPlaybackBlocked(false);
      } catch {
        autoplayBlockedRef.current = true;
        setPlaybackBlocked(true);
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
        setPlaybackBlocked(false);
      } catch {
        audio.muted = true;
        setMusicMuted(true);
        setPlaybackBlocked(true);
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

    if (!mobileVolumeOpen) {
      setMobileVolumeOpen(true);
      return;
    }

    await toggleMusicMute();
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
        setPlaybackBlocked(false);
      } catch {
        audio.muted = true;
        setMusicMuted(true);
        setPlaybackBlocked(true);
      }
    }
  };

  const audioAppearsMuted = musicMuted || playbackBlocked;

  return (
    <main>
      <nav
        className={`social-links${mobileSocialVisible ? "" : " is-mobile-hidden"}`}
        aria-label="Social profiles"
      >
        {backgroundSong.src && (
          <div className={`audio-control${mobileVolumeOpen ? " is-open" : ""}`}>
            <audio ref={audioRef} src={backgroundSong.src} preload="auto" loop />
            <div className="volume-popover">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={musicVolume}
                onChange={(event) => handleVolumeChange(Number(event.target.value))}
                aria-label="Background music volume"
              />
            </div>
            <button
              className="audio-toggle"
              type="button"
              onClick={handleAudioButton}
              aria-label={audioAppearsMuted ? `Play or unmute ${backgroundSong.title}` : `Mute ${backgroundSong.title}`}
              aria-pressed={!audioAppearsMuted}
            >
              <AudioIcon muted={audioAppearsMuted} />
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
              <h2>Designed from the ground up.</h2>
              <p>
                A student from Western University who loves PCB design, embedded systems, robotics and CAD. 
                I enjoy combining electrical, mechanical, and software skills to design and build practical engineering systems.
              </p>
              <div className="skill-line">
                <span>PCB Design</span>
                <span>Circuit Design</span>
                <span>Microcontrollers</span>
                <span>CAD</span>
                <span>Additive Manufacturing</span>
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; pointerId: number; moved: boolean } | null>(null);
  const wheelLockRef = useRef<number | null>(null);
  const slideTitle = (slide: ProjectSlide) =>
    typeof slide === "string" ? slide : slide.title;

  const previousSlide = () => {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
  };

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = { startX: event.clientX, pointerId: event.pointerId, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const updateDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 6) drag.moved = true;
    setDragOffset(distance);
  };

  const finishDrag = (
    event: ReactPointerEvent<HTMLDivElement>,
    onTap?: () => void,
  ) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (distance <= -50) nextSlide();
    else if (distance >= 50) previousSlide();
    else if (!drag.moved) onTap?.();

    dragRef.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  const cancelDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  const handleLightboxWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (wheelLockRef.current !== null) return;
    const direction = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (direction > 0) nextSlide();
    else if (direction < 0) previousSlide();
    wheelLockRef.current = window.setTimeout(() => {
      wheelLockRef.current = null;
    }, 420);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      else if (event.key === "ArrowLeft") previousSlide();
      else if (event.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (wheelLockRef.current !== null) window.clearTimeout(wheelLockRef.current);
    };
  }, [lightboxOpen]);

  const renderSlides = (expanded = false) => slides.map((slide, index) => (
    <figure
      className={`carousel-slide carousel-tone-${index + 1}${expanded ? " is-expanded" : ""}`}
      key={`${slideTitle(slide)}-${index}`}
    >
      {typeof slide !== "string" && slide.image && (
        <img
          className="carousel-image"
          src={slide.image}
          alt={slide.alt ?? slide.title}
          draggable="false"
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
  ));

  return (
    <>
      <div className="project-carousel" aria-label={`${title} image carousel`}>
      <div
        className="carousel-viewport"
        role="button"
        tabIndex={0}
        aria-label={`Enlarge ${title} images`}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") setLightboxOpen(true);
        }}
        onPointerDown={beginDrag}
        onPointerMove={updateDrag}
        onPointerUp={(event) => finishDrag(event, () => setLightboxOpen(true))}
        onPointerCancel={cancelDrag}
      >
        <div
          className={`carousel-track${isDragging ? " is-dragging" : ""}`}
          style={{ transform: `translateX(calc(-${activeSlide * 100}% + ${dragOffset}px))` }}
        >
          {renderSlides()}
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
      {lightboxOpen && createPortal(
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} enlarged images`}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setLightboxOpen(false);
          }}
        >
          <button
            className="lightbox-close"
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close enlarged images"
          >
            ×
          </button>
          <button className="lightbox-arrow lightbox-previous" type="button" onClick={previousSlide} aria-label="Previous image">
            ←
          </button>
          <div
            className="lightbox-viewport"
            onPointerDown={beginDrag}
            onPointerMove={updateDrag}
            onPointerUp={finishDrag}
            onPointerCancel={cancelDrag}
            onWheel={handleLightboxWheel}
          >
            <div
              className={`carousel-track${isDragging ? " is-dragging" : ""}`}
              style={{ transform: `translateX(calc(-${activeSlide * 100}% + ${dragOffset}px))` }}
            >
              {renderSlides(true)}
            </div>
          </div>
          <button className="lightbox-arrow lightbox-next" type="button" onClick={nextSlide} aria-label="Next image">
            →
          </button>
          <p className="lightbox-count">
            {String(activeSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </p>
        </div>,
        document.body,
      )}
    </>
  );
}
