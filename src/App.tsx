import {
  memo,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent as ReactTransitionEvent,
} from "react";
import { createPortal } from "react-dom";

// Asset paths and shared interaction timing.
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
const autoPlayInterval = 4000;
const interactionCooldown = 6000;

const coarsePointerQuery = "(hover: none), (pointer: coarse)";
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

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

type ProjectSlide = {
  title: string;
  image: string;
  alt?: string;
};

type Collaboration = {
  label: string;
  highlight: string;
  url?: string;
};

type Project = {
  number: string;
  year: string;
  githubUrl?: string;
  eyebrow: string;
  title: string;
  collaboration?: Collaboration;
  summary: string;
  tags: string[];
  slides: ProjectSlide[];
};

// Portfolio content is kept separate from rendering logic for quick updates.
const projects: Project[] = [
  {
    number: "01",
    year: "2026",
    eyebrow: "Audio Electronics / Electrical",
    title: "Class D Amplifier",
    // collaboration: { label: "Built in collaboration with", highlight: "Name", url: "https://example.com" },
    summary:
      "A custom Class D audio amplifier designed using a 555 timer and analog audio input to generate PWM signals. The design includes a MOSFET gate driver to run a MOSFET output stage, driving a speaker with ~80% efficiency. The project included circuit design, component selection, PCB layout in Altium Designer, signal filtering, and oscilloscope-based testing, debugging and enclosure design using fusion 360.",
    tags: ["Altium", "PCB Design", "Circuit Design", "Fusion 360", "Oscilloscope"],
    slides: [
      // Add an image by setting its path, for example:
      // { title: "PCB render", image: "./projects/amplifier-pcb.jpg", alt: "Amplifier PCB render" },
      {title: "Schematic", image: "./projects/Class D Amplifier/Schmatic.png"},
      {title: "PCB Layout", image: "./projects/Class D Amplifier/Routing.png"},
      {title: "3D Model", image: "./projects/Class D Amplifier/3D Model.png"}
    ],
  },
  {
    number: "02",
    year: "2026",
    eyebrow: "Embedded Systems / Electrical",
    title: "STM32 Flight Controller",
    collaboration: { label: "In collaboration with", highlight: "Moiz Ahmad", url: "https://moizahmad.com" },
    summary:
      "Designed and developed a custom STM32-based flight controller for a fixed-wing RC aircraft. The board integrates an STM32F446 microcontroller, IMU and barometric pressure sensors, USB communication, ELRS radio connectivity, and multiple PWM outputs for flight-control hardware. The project involved schematic design, component selection, power regulation, four-layer PCB layout, USB differential-pair routing, and hardware bring-up using STM32CubeMX, C/C++, and SWD debugging.",
    tags: ["Altium", "SPI & I2C", "UART", "USB", "STM32CubeMX"],
    slides: [
      {title: "Schematic", image: "./projects/STM Flight Controller/Schematic Altium.png"},
      {title: "PCB Layout", image: "./projects/STM Flight Controller/Routing.png"},
      {title: "3D Model", image: "./projects/STM Flight Controller/3D model.png"},
      {title: "Manufactured", image: "./projects/STM Flight Controller/Top IRL PCB.jpg"}
    ],
  },
  {
    number: "03",
    year: "2025",
    githubUrl: "https://github.com/mynteee/tracking-14-a",
    eyebrow: "IoT Asset Tracking / Software & Hardware",
    title: "Esp32 Asset Tracking",
    collaboration: { label: "In collaboration with", highlight: "ES1050", url: "https://www.eng.uwo.ca/media/news/2024/Thompson-Centre-ES1050-professors-making-an-impact.html" },
    summary:
      "Developed an ESP32-based indoor tracking system designed to monitor BLE-enabled assets across hospital rooms and zones. Multiple ESP32 gateways scan for low-power Bluetooth beacons and use received signal strength to estimate each tag’s location, tracking data transmitted over Wi-Fi to a central MQTT server for monitoring and visualization on a web-based dashboard.",
    tags: ["Esp32", "BLE", "MQTT", "Wifi", "Onshape"],
    slides: [
      {title: "Esp32 Case", image: "./projects/Tracker System/CaseOpen.jpg"},
      {title: "Tag", image: "./projects/Tracker System/TagHousing.jpg"},
      {title: "Tag Battery", image: "./projects/Tracker System/TagBattery.jpg"},
      {title: "Dashboard", image: "./projects/Tracker System/WebApp.png"}
    ],
  },
  {
    number: "04",
    year: "2025",
    eyebrow: "Gearbox Design / Mechanical",
    title: "Harmonic Drive",
    summary: "Designed and developed a custom harmonic drive gearbox using a flex spline printed in nylon and wave generator to achieve compact, high-ratio 20:1 motion transmission. The project was to be used on a nema 17 stepper motor and focused on mechanical design, gear geometry, material selection, and designing components specifically for additive manufacturing while balancing flexibility, stiffness and durability.",
    tags: ["Gear Design", "Fusion 360", "Material Selection", "Additive Manufacturing", "Stepper Motor"],
    slides: [
      {title: "Exploded", image: "./projects/Harmonic Drive/Exploded.png"},
      {title: "Cross Section", image: "./projects/Harmonic Drive/Cross.png"},
      {title: "Open", image: "./projects/Harmonic Drive/Open.jpg"},
      {title: "Closed", image: "./projects/Harmonic Drive/Closed.jpg"},
      {title: "Bread board", image: "./projects/Harmonic Drive/BreadBoard.jpg"},
    ],
  },
  {
    number: "05",
    year: "2025",
    eyebrow: "Drone Design / Mechanical & Electrical",
    title: "3D Printed Drone",
    summary: "Designed and built a custom 3D-printed drone, developing the airframe from scratch, printed with carbon-filled petg with a focus on weight, strength, and component integration. I used betaflight to configure a F405 mini flight controller stack to enable smooth flight. This project combined CAD modelling, additive manufacturing, electronics integration, assembly, and iterative testing to refine the frame and overall flight platform.",
    tags: ["Fusion 360", "Bambu Slicer", "Betaflight", "Additive Manufacturing"],
    slides: [
      {title: "Front", image: "./projects/3D Printed Drone/Front.jpg"},
      {title: "Back", image: "./projects/3D Printed Drone/Back.jpg"},
      {title: "Top", image: "./projects/3D Printed Drone/Top.jpg"},
      {title: "CAD", image: "./projects/3D Printed Drone/Cad Top.png"},
      {title: "Bumper", image: "./projects/3D Printed Drone/Bumper.png"},
    ],
  },
  {
    number: "06",
    year: "2025",
    githubUrl: "https://github.com/KoiBirb/Forsaken-Crown",
    eyebrow: "Game Design / Software",
    title: "Arcade Machine Game",
    collaboration: { label: "In collaboration with London Central Secondary School", highlight: "", url: "" },
    summary: "Designed and developed a hack and slash platformer game inspired by hollow knight. I used java swing to display the graphics and developed fundamental skills in organization of an over 20k+ line project. Tiled and json simple was used to create and store the map.",
    tags: ["Java", "Intelij", "JSON", "Github", "Tiled"],
    slides: [
      {title: "Main", image: "./projects/Forsaken Crown/Main.jpg"},
      {title: "Dark Cave", image: "./projects/Forsaken Crown/Start.jpg"},
      {title: "Checkpoint", image: "./projects/Forsaken Crown/Checkpoint.jpg"},
      {title: "Bone Castle", image: "./projects/Forsaken Crown/Mid.jpg"},
      {title: "Arena", image: "./projects/Forsaken Crown/Boss.jpg"},
      {title: "Map", image: "./projects/Forsaken Crown/Map.png"},
      {title: "Controls", image: "./projects/Forsaken Crown/Controls.jpg"}
    ],
  },
  {
    number: "07",
    year: "2024",
    githubUrl: "https://github.com/KoiBirb/Robot-Dog",
    eyebrow: "Quadruped Robotics / Mechanical / Electrical",
    title: "Robot Dog",
    collaboration: { label: "In collaboration with", highlight: "Moiz Ahmad", url: "https://moizahmad.com" },
    summary: "Designed and built a custom quadruped robot dog for a Western University competition, integrating an ESP32, custom KiCad PCB, servo driver, and 12 actuated joints. The project combined mechanical design, electronics, and inverse kinematics to coordinate multi-joint leg motion and produce controlled walking movements.",
    tags: ["C++", "Arduino IDE", "KiCad", "Esp32", "Inverse Kinematics", "Servos"],
    slides: [
      {title: "Folded", image: "./projects/Robot dog/Folded.jpg"},
      {title: "Side", image: "./projects/Robot dog/Side.jpg"},
      {title: "Top", image: "./projects/Robot dog/Top.jpg"},
      {title: "Front", image: "./projects/Robot dog/Front.jpg"},
      {title: "Unassembled", image: "./projects/Robot dog/Unassembled.jpg"},
      {title: "Poster", image: "./projects/Robot dog/Poster.png"}

    ],
  },
];

const timelineYears = Array.from(
  new Set(["2026", ...projects.map((project) => project.year)]),
);

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
  const mobileSocialVisibleRef = useRef(true);
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(null);
  const activeProjectIndexRef = useRef<number | null>(null);
  const [projectImagesEnabledThrough, setProjectImagesEnabledThrough] = useState(-1);
  const assetSequenceStartedRef = useRef(false);
  const projectImageQueueStartedRef = useRef(false);
  const assetTimersRef = useRef<number[]>([]);
  const [musicMuted, setMusicMuted] = useState(() => readAudioSettings().muted);
  const [musicVolume, setMusicVolume] = useState(() => readAudioSettings().volume);
  const [playbackBlocked, setPlaybackBlocked] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastVolumeRef = useRef(musicVolume);
  const resumeAfterFocusRef = useRef(false);
  const interfaceVolumeRef = useRef({ muted: musicMuted, volume: musicVolume });
  interfaceVolumeRef.current = {
    // A blocked background track should not suppress sounds from an explicit tap.
    muted: musicMuted,
    volume: musicVolume,
  };

  const startProjectImageQueue = () => {
    if (projectImageQueueStartedRef.current) return;
    projectImageQueueStartedRef.current = true;

    // Start galleries in document order instead of opening every connection at once.
    projects.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setProjectImagesEnabledThrough(index);
      }, index * 450);
      assetTimersRef.current.push(timer);
    });
  };

  const startAssetSequence = () => {
    if (assetSequenceStartedRef.current) return;
    assetSequenceStartedRef.current = true;

    const audio = audioRef.current;
    if (!audio) {
      startProjectImageQueue();
      return;
    }

    // Give music the first post-background request, then allow image batches.
    audio.preload = "auto";
    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      startProjectImageQueue();
      return;
    }

    audio.addEventListener("canplay", startProjectImageQueue, { once: true });
    if (audio.networkState === HTMLMediaElement.NETWORK_EMPTY) audio.load();
    assetTimersRef.current.push(window.setTimeout(startProjectImageQueue, 2000));
  };

  useEffect(() => {
    const story = storyRef.current;
    const image = imageRef.current;
    if (!story || !image) return;

    // Cache the panels once; only their viewport geometry changes while scrolling.
    const panels = Array.from(story.querySelectorAll<HTMLElement>("[data-year]"));
    let frame = 0;
    let storyTravel = 0;
    let imageTravel = 0;

    const measureScrollableArea = () => {
      storyTravel = Math.max(0, story.offsetHeight - window.innerHeight);
      imageTravel = Math.max(0, image.offsetHeight - window.innerHeight);
    };

    const update = () => {
      const rect = story.getBoundingClientRect();
      const progress = storyTravel > 0
        ? Math.min(1, Math.max(0, -rect.top / storyTravel))
        : 0;

      image.style.setProperty(
        "--image-offset",
        `${(-progress * imageTravel).toFixed(2)}px`,
      );

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
      const focusedProjectIndex = focusedPanel.panel?.dataset.projectIndex;
      const nextProjectIndex = focusedProjectIndex !== undefined && focusedPanel.ratio > 0
        ? Number(focusedProjectIndex)
        : null;
      if (nextProjectIndex !== activeProjectIndexRef.current) {
        activeProjectIndexRef.current = nextProjectIndex;
        setActiveProjectIndex(nextProjectIndex);
      }

      const nextSocialVisible = window.scrollY < Math.max(120, window.innerHeight * 0.18);
      if (nextSocialVisible !== mobileSocialVisibleRef.current) {
        mobileSocialVisibleRef.current = nextSocialVisible;
        setMobileSocialVisible(nextSocialVisible);
      }
      frame = 0;
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    const handleResize = () => {
      measureScrollableArea();
      requestUpdate();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(story);
    resizeObserver.observe(image);

    measureScrollableArea();
    update();
    image.addEventListener("load", handleResize);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      image.removeEventListener("load", handleResize);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", handleResize);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => () => {
    assetTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    assetTimersRef.current = [];
  }, []);

  useEffect(() => {
    // Debounce synchronous storage writes while the desktop slider is moving.
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(
        audioSettingsKey,
        JSON.stringify({ muted: musicMuted, volume: musicVolume }),
      );
    }, 200);
    return () => window.clearTimeout(timer);
  }, [musicMuted, musicVolume]);

  useEffect(() => {
    // Event delegation provides UI sounds without attaching listeners to every control.
    const hoverSound = new Audio(interfaceSounds.hover);
    const clickSounds = Array.from({ length: 3 }, () => new Audio(interfaceSounds.click));
    let nextClickSound = 0;
    let lastDirectPointerSound = 0;
    hoverSound.preload = "auto";
    hoverSound.load();
    clickSounds.forEach((sound) => {
      sound.preload = "auto";
      sound.load();
    });

    const playSound = (sound: HTMLAudioElement, volumeMultiplier = 1) => {
      const settings = interfaceVolumeRef.current;
      if (settings.muted || settings.volume === 0) return;
      sound.volume = Math.min(1, settings.volume * volumeMultiplier);
      sound.currentTime = 0;
      void sound.play().catch(() => undefined);
    };
    const findControl = (target: EventTarget | null) =>
      target instanceof Element
        ? target.closest("button, a, .project-collaboration-highlight, .carousel-slide figcaption, .carousel-viewport, .lightbox-viewport")
        : null;
    const playClickForTarget = (target: EventTarget | null) => {
      const control = findControl(target);
      if (!control || control.matches(".project-collaboration-highlight:not(a)")) return false;
      const clickSound = clickSounds[nextClickSound];
      nextClickSound = (nextClickSound + 1) % clickSounds.length;
      playSound(clickSound, 1.5);
      return true;
    };
    const handlePointerOver = (event: PointerEvent) => {
      if (
        event.pointerType !== "mouse" ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches
      ) return;
      const control = findControl(event.target);
      if (!control || (event.relatedTarget instanceof Node && control.contains(event.relatedTarget))) return;
      playSound(hoverSound);
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || !playClickForTarget(event.target)) return;
      lastDirectPointerSound = performance.now();
    };
    const handleClick = (event: MouseEvent) => {
      // Touch browsers synthesize a click after pointer-down; avoid playing twice.
      if (performance.now() - lastDirectPointerSound < 750) return;
      playClickForTarget(event.target);
    };

    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("click", handleClick);
      hoverSound.pause();
      clickSounds.forEach((sound) => sound.pause());
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = musicVolume;
    audio.muted = musicMuted;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Do not keep media decoding in a hidden or unfocused tab.
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
      try {
        await audio.play();
        setPlaybackBlocked(false);
      } catch {
        setPlaybackBlocked(true);
      }
      return;
    }

    if (audio.muted) {
      const restoredVolume = lastVolumeRef.current || backgroundSong.volume;
      audio.volume = restoredVolume;
      audio.muted = false;
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

  const prepareMusic = () => {
    const audio = audioRef.current;
    if (!audio || !audio.paused || audio.preload === "auto") return;
    audio.preload = "auto";
    audio.load();
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
        <div className="audio-control" onPointerDown={prepareMusic}>
          {/* Starts after the hero artwork, or immediately when explicitly requested. */}
          <audio ref={audioRef} src={backgroundSong.src} preload="none" loop />
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
            onClick={toggleMusicMute}
            aria-label={audioAppearsMuted ? `Play or unmute ${backgroundSong.title}` : `Mute ${backgroundSong.title}`}
            aria-pressed={!audioAppearsMuted}
          >
            <AudioIcon muted={audioAppearsMuted} />
          </button>
        </div>
        <a href="https://www.linkedin.com/in/leo-bogaert/" target="_blank" rel="noreferrer">
          <img src="./linkedin.png" alt="Leo Bogaert on LinkedIn" decoding="async" />
        </a>
        <a href="https://github.com/koibirb" target="_blank" rel="noreferrer">
          <img src="./github.svg" alt="Leo Bogaert on GitHub" decoding="async" />
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
            decoding="async"
            fetchPriority="high"
            onLoad={startAssetSequence}
            onError={startAssetSequence}
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
                className="story-panel project-panel"
                id={index === 0 ? "work" : undefined}
                data-year={project.year}
                data-project-index={index}
                key={project.number}
              >
                <ProjectCard
                  project={project}
                  autoPlay={activeProjectIndex === index}
                  imagesEnabled={index <= projectImagesEnabledThrough}
                />
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

const ProjectCard = memo(function ProjectCard({
  project,
  autoPlay,
  imagesEnabled,
}: {
  project: Project;
  autoPlay: boolean;
  imagesEnabled: boolean;
}) {
  return (
    <article className="project-card">
      <div className="project-copy">
        <div className="project-meta">
          <span>{project.number}</span>
          <span>{project.eyebrow}</span>
        </div>
        <h2>{project.title}</h2>
        {project.collaboration && (
          <p className="project-collaboration">
            {project.collaboration.label}{" "}
            {project.collaboration.url ? (
              <a
                className="project-collaboration-highlight"
                href={project.collaboration.url}
                target="_blank"
                rel="noreferrer"
              >
                {project.collaboration.highlight}
              </a>
            ) : (
              <strong className="project-collaboration-highlight">
                {project.collaboration.highlight}
              </strong>
            )}
          </p>
        )}
        <p>{project.summary}</p>
        <div className="project-links">
          <ul aria-label={`${project.title} technologies`}>
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          {project.githubUrl && (
            <a
              className="project-github"
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`View ${project.title} on GitHub`}
            >
              <img src="./github.svg" alt="" loading="lazy" decoding="async" />
              <span>GitHub</span>
            </a>
          )}
        </div>
      </div>
      <ProjectCarousel
        title={project.title}
        slides={project.slides}
        autoPlay={autoPlay}
        imagesEnabled={imagesEnabled}
      />
    </article>
  );
});

function ProjectCarousel({
  title,
  slides,
  autoPlay,
  imagesEnabled,
}: {
  title: string;
  slides: ProjectSlide[];
  autoPlay: boolean;
  imagesEnabled: boolean;
}) {
  // activeSlide is the real content index; trackIndex also includes edge clones.
  const [activeSlide, setActiveSlide] = useState(0);
  const [trackIndex, setTrackIndex] = useState(slides.length > 1 ? 1 : 0);
  const [isResettingTrack, setIsResettingTrack] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mobileCaptionHidden, setMobileCaptionHidden] = useState(false);
  const [slideRatios, setSlideRatios] = useState<Record<number, number>>({});
  const [loadedSlides, setLoadedSlides] = useState<Record<number, boolean>>({});
  const carouselViewportRef = useRef<HTMLDivElement>(null);
  const lightboxViewportRef = useRef<HTMLDivElement>(null);
  const trackIndexRef = useRef(slides.length > 1 ? 1 : 0);
  const autoPlayResumeAtRef = useRef(0);
  const dragFrameRef = useRef<number | null>(null);
  const pendingDragOffsetRef = useRef(0);
  const trackResetFrameRef = useRef<number | null>(null);
  const dragRef = useRef<{ startX: number; pointerId: number; moved: boolean } | null>(null);
  const wheelLockRef = useRef<number | null>(null);
  // These values distinguish a new trackpad impulse from momentum tail events.
  const wheelGestureRef = useRef({
    distance: 0,
    lastEvent: 0,
    lastMagnitude: 0,
    lastDirection: 0,
  });
  const activeRatio = slideRatios[activeSlide] ?? 16 / 10;

  const postponeAutoPlay = () => {
    // A ref avoids re-rendering for every event in a trackpad momentum stream.
    autoPlayResumeAtRef.current = Date.now() + interactionCooldown;
  };

  const moveSlide = (direction: -1 | 1) => {
    if (slides.length < 2) return;
    const nextTrackIndex = trackIndexRef.current + direction;
    if (nextTrackIndex < 0 || nextTrackIndex > slides.length + 1) return;

    trackIndexRef.current = nextTrackIndex;
    setMobileCaptionHidden(false);
    setActiveSlide((current) => (current + direction + slides.length) % slides.length);
    setTrackIndex(nextTrackIndex);
  };

  const previousSlide = () => moveSlide(-1);
  const nextSlide = () => moveSlide(1);
  const moveSlideManually = (direction: -1 | 1) => {
    postponeAutoPlay();
    moveSlide(direction);
  };

  const closeLightbox = () => {
    postponeAutoPlay();
    setLightboxOpen(false);
  };

  const finishTrackTransition = () => {
    // Edge clones create the visible wrap; this resets to the matching real
    // slide without a transition once that one-slide animation completes.
    let normalizedIndex: number | null = null;
    if (trackIndexRef.current === 0) normalizedIndex = slides.length;
    else if (trackIndexRef.current === slides.length + 1) normalizedIndex = 1;
    if (normalizedIndex === null) return;

    trackIndexRef.current = normalizedIndex;
    setIsResettingTrack(true);
    setTrackIndex(normalizedIndex);
    if (trackResetFrameRef.current !== null) {
      window.cancelAnimationFrame(trackResetFrameRef.current);
    }
    trackResetFrameRef.current = window.requestAnimationFrame(() => {
      trackResetFrameRef.current = window.requestAnimationFrame(() => {
        trackResetFrameRef.current = null;
        setIsResettingTrack(false);
      });
    });
  };

  const handleTrackTransition = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && event.propertyName === "transform") {
      finishTrackTransition();
    }
  };

  useEffect(() => () => {
    if (dragFrameRef.current !== null) window.cancelAnimationFrame(dragFrameRef.current);
    if (trackResetFrameRef.current !== null) window.cancelAnimationFrame(trackResetFrameRef.current);
  }, []);

  useEffect(() => {
    if (
      !autoPlay ||
      lightboxOpen ||
      isDragging ||
      isHovered ||
      slides.length < 2 ||
      window.matchMedia(reducedMotionQuery).matches
    ) return;

    let timer = 0;
    const advanceAndReschedule = () => {
      const cooldownRemaining = autoPlayResumeAtRef.current - Date.now();
      if (cooldownRemaining > 0) {
        timer = window.setTimeout(advanceAndReschedule, cooldownRemaining);
        return;
      }

      if (document.visibilityState === "visible" && document.hasFocus()) {
        nextSlide();
      }
      timer = window.setTimeout(advanceAndReschedule, autoPlayInterval);
    };

    const cooldownRemaining = Math.max(0, autoPlayResumeAtRef.current - Date.now());
    timer = window.setTimeout(
      advanceAndReschedule,
      Math.max(autoPlayInterval, cooldownRemaining),
    );

    return () => window.clearTimeout(timer);
  }, [autoPlay, isDragging, isHovered, lightboxOpen, slides.length]);

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    postponeAutoPlay();
    dragRef.current = { startX: event.clientX, pointerId: event.pointerId, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const updateDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 6) drag.moved = true;
    pendingDragOffsetRef.current = distance;
    if (dragFrameRef.current === null) {
      // Pointer events can outpace the display refresh rate; render at most once per frame.
      dragFrameRef.current = window.requestAnimationFrame(() => {
        dragFrameRef.current = null;
        setDragOffset(pendingDragOffsetRef.current);
      });
    }
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
    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
    setDragOffset(0);
    setIsDragging(false);
  };

  const cancelDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
    setDragOffset(0);
    setIsDragging(false);
  };

  useEffect(() => {
    const handleTrackpadSwipe = (event: WheelEvent) => {
      const horizontalDistance = event.deltaX;

      // Let ordinary two-finger vertical scrolling continue moving the page.
      if (Math.abs(horizontalDistance) <= Math.abs(event.deltaY) * 1.1) return;
      event.preventDefault();
      postponeAutoPlay();

      const now = performance.now();
      const magnitude = Math.abs(horizontalDistance);
      const direction = Math.sign(horizontalDistance);
      if (wheelLockRef.current !== null) {
        // Ignore momentum from the previous swipe, but immediately accept a
        // new impulse so quick consecutive swipes do not feel locked out.
        const gesture = wheelGestureRef.current;
        const isFreshImpulse =
          direction !== gesture.lastDirection ||
          now - gesture.lastEvent > 70 ||
          (magnitude >= 8 && magnitude > gesture.lastMagnitude * 1.75);

        if (!isFreshImpulse) {
          gesture.lastEvent = now;
          gesture.lastMagnitude = magnitude;
          window.clearTimeout(wheelLockRef.current);
          wheelLockRef.current = window.setTimeout(() => {
            wheelLockRef.current = null;
          }, 140);
          return;
        }

        window.clearTimeout(wheelLockRef.current);
        wheelLockRef.current = null;
        gesture.distance = 0;
      }

      if (now - wheelGestureRef.current.lastEvent > 180) {
        wheelGestureRef.current.distance = 0;
      }
      wheelGestureRef.current.lastEvent = now;
      wheelGestureRef.current.lastMagnitude = magnitude;
      wheelGestureRef.current.lastDirection = direction;
      wheelGestureRef.current.distance += horizontalDistance;

      // Trackpads emit several small wheel events per swipe. Accumulate them so
      // one deliberate gesture always produces exactly one slide change.
      if (Math.abs(wheelGestureRef.current.distance) < 36) return;
      if (wheelGestureRef.current.distance > 0) nextSlide();
      else previousSlide();

      wheelGestureRef.current.distance = 0;
      wheelLockRef.current = window.setTimeout(() => {
        wheelLockRef.current = null;
      }, 140);
    };

    const viewports = [carouselViewportRef.current, lightboxViewportRef.current].filter(
      (viewport): viewport is HTMLDivElement => viewport !== null,
    );
    viewports.forEach((viewport) => {
      viewport.addEventListener("wheel", handleTrackpadSwipe, { passive: false });
    });

    return () => {
      viewports.forEach((viewport) => viewport.removeEventListener("wheel", handleTrackpadSwipe));
      wheelGestureRef.current.distance = 0;
      wheelGestureRef.current.lastMagnitude = 0;
      wheelGestureRef.current.lastDirection = 0;
      if (wheelLockRef.current !== null) {
        window.clearTimeout(wheelLockRef.current);
        wheelLockRef.current = null;
      }
    };
  }, [lightboxOpen, slides.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        moveSlideManually(-1);
      } else if (event.key === "ArrowRight") {
        moveSlideManually(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (wheelLockRef.current !== null) window.clearTimeout(wheelLockRef.current);
    };
  }, [lightboxOpen]);

  const renderSlide = (
    slide: ProjectSlide,
    index: number,
    clonePosition?: "leading" | "trailing",
  ) => {
    const imageRatio = slideRatios[index] ?? 16 / 10;
    const caption = (
      <figcaption
        className={mobileCaptionHidden && index === activeSlide ? "is-mobile-hidden" : undefined}
        onPointerDown={(event) => {
          if (window.matchMedia(coarsePointerQuery).matches) {
            event.stopPropagation();
          }
        }}
        onClick={(event) => {
          if (!window.matchMedia(coarsePointerQuery).matches) return;
          event.stopPropagation();
          postponeAutoPlay();
          setMobileCaptionHidden((hidden) => !hidden);
        }}
      >
        <span>
          {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
        <strong>{slide.title}</strong>
      </figcaption>
    );

    return (
      <figure
        className="carousel-slide"
        key={`${clonePosition ?? "slide"}-${slide.title}-${index}`}
        aria-hidden={clonePosition ? true : undefined}
      >
        <div
          className="carousel-image-frame"
          style={{
            "--image-ratio": imageRatio,
            "--image-width-at-full-height": `${imageRatio * 100}cqh`,
          } as CSSProperties}
        >
          <div
            className={`carousel-image-skeleton${loadedSlides[index] ? " is-hidden" : ""}`}
            aria-hidden="true"
          />
          <img
            className={`carousel-image${loadedSlides[index] ? " is-loaded" : ""}`}
            src={imagesEnabled ? slide.image : undefined}
            alt={clonePosition ? "" : (slide.alt ?? `${title} project — ${slide.title}`)}
            draggable="false"
            loading={imagesEnabled ? "eager" : "lazy"}
            decoding="async"
            onLoad={(event) => {
              const ratio = event.currentTarget.naturalWidth / event.currentTarget.naturalHeight;
              if (!Number.isFinite(ratio) || ratio <= 0) return;
              setSlideRatios((current) => current[index] === ratio
                ? current
                : { ...current, [index]: ratio });
              setLoadedSlides((current) => current[index]
                ? current
                : { ...current, [index]: true });
            }}
          />
          {caption}
        </div>
      </figure>
    );
  };

  const renderSlides = () => {
    if (slides.length < 2) {
      return slides.map((slide, index) => renderSlide(slide, index));
    }

    // One clone on each edge lets the carousel wrap in the requested direction.
    return [
      renderSlide(slides[slides.length - 1], slides.length - 1, "leading"),
      ...slides.map((slide, index) => renderSlide(slide, index)),
      renderSlide(slides[0], 0, "trailing"),
    ];
  };

  return (
    <>
      <div
        className={`project-carousel${autoPlay ? " is-active" : ""}`}
        aria-label={`${title} image carousel`}
        onPointerEnter={(event) => {
          if (event.pointerType !== "mouse") return;
          setIsHovered(true);
          postponeAutoPlay();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return;
          setIsHovered(false);
          postponeAutoPlay();
        }}
        onFocusCapture={() => {
          postponeAutoPlay();
        }}
      >
        <div
          ref={carouselViewportRef}
          className="carousel-viewport"
          role="button"
          tabIndex={0}
          aria-label={`Enlarge ${title} images`}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              postponeAutoPlay();
              setLightboxOpen(true);
            }
          }}
          onPointerDown={beginDrag}
          onPointerMove={updateDrag}
          onPointerUp={(event) => finishDrag(event, () => setLightboxOpen(true))}
          onPointerCancel={cancelDrag}
        >
          <div
            className={`carousel-track${isDragging ? " is-dragging" : ""}${isResettingTrack ? " is-resetting" : ""}`}
            style={{ transform: `translateX(calc(-${trackIndex * 100}% + ${dragOffset}px))` }}
            onTransitionEnd={handleTrackTransition}
            onTransitionCancel={handleTrackTransition}
          >
            {renderSlides()}
          </div>
        </div>

        <div className="carousel-controls">
          <button
            type="button"
            onClick={() => moveSlideManually(-1)}
            aria-label={`Previous ${title} image`}
          >
            ←
          </button>
          <div className="carousel-dots" aria-label="Choose image">
            {slides.map((slide, index) => (
              <button
                type="button"
                className={index === activeSlide ? "is-active" : ""}
                onClick={() => {
                  postponeAutoPlay();
                  setMobileCaptionHidden(false);
                  setActiveSlide(index);
                  trackIndexRef.current = slides.length > 1 ? index + 1 : index;
                  setTrackIndex(trackIndexRef.current);
                }}
                aria-label={`Show ${slide.title}`}
                aria-current={index === activeSlide ? "true" : undefined}
                key={`${slide.title}-${index}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => moveSlideManually(1)}
            aria-label={`Next ${title} image`}
          >
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
            if (event.target === event.currentTarget) {
              closeLightbox();
            }
          }}
        >
          <button
            className="lightbox-close"
            type="button"
            onClick={closeLightbox}
            aria-label="Close enlarged images"
          >
            ×
          </button>
          <button
            className="lightbox-arrow lightbox-previous"
            type="button"
            onClick={() => moveSlideManually(-1)}
            aria-label="Previous image"
          >
            ←
          </button>
          <div
            ref={lightboxViewportRef}
            className="lightbox-viewport"
            style={{
              aspectRatio: activeRatio,
              "--lightbox-width-by-height": `${82 * activeRatio}dvh`,
            } as CSSProperties}
            onPointerDown={beginDrag}
            onPointerMove={updateDrag}
            onPointerUp={finishDrag}
            onPointerCancel={cancelDrag}
          >
            <div
              className={`carousel-track${isDragging ? " is-dragging" : ""}${isResettingTrack ? " is-resetting" : ""}`}
              style={{ transform: `translateX(calc(-${trackIndex * 100}% + ${dragOffset}px))` }}
              onTransitionEnd={handleTrackTransition}
              onTransitionCancel={handleTrackTransition}
            >
              {renderSlides()}
            </div>
          </div>
          <button
            className="lightbox-arrow lightbox-next"
            type="button"
            onClick={() => moveSlideManually(1)}
            aria-label="Next image"
          >
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
