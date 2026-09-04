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

type ProjectDetailSection = {
  heading: string;
  text?: string;
  items?: string[];
  // Zero-based gallery image index. Use -1 to keep the currently displayed image.
  imageIndex?: number;
};

type ProjectDetails = {
  sections: ProjectDetailSection[];
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
  details?: ProjectDetails;
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
      "A custom Class D audio amplifier designed using a 555 timer and analog audio input to generate PWM signals. The design includes a gate driver controlling the MOSFET output stage, driving a speaker at ~80% efficiency. The project included circuit design, component selection, PCB layout in Altium Designer, signal filtering, oscilloscope-based testing, debugging, and enclosure design using Fusion 360.",
    tags: ["Altium", "PCB Design", "Circuit Design", "Fusion 360", "Oscilloscope"],
    details: {
      // Adding this optional object gives a project its More info button.
      sections: [
        {
          heading: "Project Goal",
          text: "Create a compact amplifier that converts an analog audio signal into a high-frequency PWM waveform while keeping switching losses and audible distortion low.",
          imageIndex: -1,
        },
        {
          heading: "Reasearch",
          items: [
            "555-timer PWM generation stage",
            "MOSFET gate driver and output stage",
            "Custom PCB and low-pass filtering",
          ],
          imageIndex: -1,
        },
        {
          heading: "Circuit Design",
          items: [
            "Measured approximately 80% efficiency",
            "Validated signals with an oscilloscope",
            "Designed the enclosure in Fusion 360",
          ],
          imageIndex: 0,
        },
        {
          heading: "PCB Design",
          items: [
            "Measured approximately 80% efficiency",
            "Validated signals with an oscilloscope",
            "Designed the enclosure in Fusion 360",
          ],
          imageIndex: 1,
        },
        {
          heading: "Enclosure",

          imageIndex: -1,
        },
        {
          heading: "Testing & Outcome",

          imageIndex: -1,
        },
      ],
    },
    slides: [
      // Add an image by setting its path, for example:
      // { title: "PCB render", image: "./projects/amplifier-pcb.jpg", alt: "Amplifier PCB render" },
      {title: "Schematic", image: "./projects/Class D Amplifier/Schematic.png"},
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
    title: "ESP32 Asset Tracking",
    collaboration: { label: "In collaboration with", highlight: "ES1050", url: "https://www.eng.uwo.ca/media/news/2024/Thompson-Centre-ES1050-professors-making-an-impact.html" },
    summary:
      "Developed an ESP32-based indoor tracking system designed to monitor BLE-enabled assets across hospital rooms and zones. Multiple ESP32 gateways scan for low-power Bluetooth beacons and use received signal strength to estimate each tag’s location, then transmit tracking data over Wi-Fi to a central MQTT server for monitoring and visualization on a web-based dashboard.",
    tags: ["ESP32", "BLE", "MQTT", "Wi-Fi", "Onshape"],
    slides: [
      {title: "ESP32 Case", image: "./projects/Tracker System/CaseOpen.jpg"},
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
    summary: "Designed and developed a custom harmonic drive gearbox using a flex spline printed in nylon and a wave generator to achieve a compact form factor and 20:1 reduction ratio. The project was designed to fit flush with a NEMA 17 stepper motor and focused on mechanical design, gear geometry, material selection, and design for additive manufacturing while balancing flexibility, stiffness, and durability.",
    tags: ["Gear Design", "Fusion 360", "Material Selection", "Additive Manufacturing", "Stepper Motor"],
    slides: [
      {title: "Exploded", image: "./projects/Harmonic Drive/Exploded.png"},
      {title: "Exploded", image: "./projects/Harmonic Drive/ExplodedBack.png"},
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
    title: "3D-Printed Drone",
    summary: "Designed and built a custom 3D-printed drone, developing the airframe from scratch and printing it in carbon-fiber-filled PETG with a focus on weight, strength, and component integration. I used Betaflight to configure an F405 Mini flight controller stack to enable smooth flight. This project combined CAD modeling, additive manufacturing, electronics integration, assembly, and iterative testing to refine the frame and overall flight platform.",
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
    summary: "Designed and developed a hack-and-slash platformer game inspired by Hollow Knight. I used Java Swing to display the graphics and developed experience structuring and maintaining a codebase of over 20,000 lines. Used Tiled to create the game maps and JSON files to store map data.",
    tags: ["Java", "IntelliJ", "JSON", "GitHub", "Tiled"],
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
    tags: ["C++", "Arduino IDE", "KiCad", "ESP32", "Inverse Kinematics", "Servos"],
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
        ? target.closest("button, a, .project-card.has-details, .project-collaboration-highlight, .carousel-slide figcaption, .carousel-viewport, .lightbox-viewport")
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
                I am a student from Ontario, Canada, currently studying at Western University. I love PCB design, CAD, robotics, and aeronautics.
                I enjoy combining electrical, mechanical, and software skills to design and build practical engineering systems.
              </p>
              <div className="skill-line">
                <span>PCB Design</span>
                <span>Microcontrollers</span>
                <span>Circuits</span>
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsClosing, setDetailsClosing] = useState(false);
  const [visibleDetailSection, setVisibleDetailSection] = useState(0);
  const [hoveredDetailSection, setHoveredDetailSection] = useState<number | null>(null);
  const [mobileDetailCloseVisible, setMobileDetailCloseVisible] = useState(true);
  const moreInfoButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const detailCopyRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const returnTimerRef = useRef<number | null>(null);

  const startMainUiReturn = () => {
    if (window.matchMedia(reducedMotionQuery).matches) return;
    if (returnTimerRef.current !== null) window.clearTimeout(returnTimerRef.current);
    document.body.classList.remove("project-detail-is-open");
    document.body.classList.add("project-detail-is-returning");
    returnTimerRef.current = window.setTimeout(() => {
      returnTimerRef.current = null;
      document.body.classList.remove("project-detail-is-returning");
    }, 420);
  };

  const openDetails = () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    if (returnTimerRef.current !== null) window.clearTimeout(returnTimerRef.current);
    document.body.classList.remove("project-detail-is-returning");
    document.body.classList.add("project-detail-is-open");
    setVisibleDetailSection(0);
    setHoveredDetailSection(null);
    setMobileDetailCloseVisible(true);
    setDetailsClosing(false);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    if (detailsClosing) return;
    if (window.matchMedia(reducedMotionQuery).matches) {
      setDetailsOpen(false);
      return;
    }
    startMainUiReturn();
    setDetailsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setDetailsOpen(false);
      setDetailsClosing(false);
    }, 260);
  };

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    if (returnTimerRef.current !== null) window.clearTimeout(returnTimerRef.current);
    document.body.classList.remove("project-detail-is-returning");
  }, []);

  useEffect(() => {
    if (!detailsOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("project-detail-is-open");
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || document.querySelector(".image-lightbox")) return;
      closeDetails();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("project-detail-is-open");
      if (!document.body.classList.contains("project-detail-is-returning")) startMainUiReturn();
      window.removeEventListener("keydown", handleKeyDown);
      window.requestAnimationFrame(() => moreInfoButtonRef.current?.focus());
    };
  }, [detailsOpen]);

  useEffect(() => {
    if (!detailsOpen) return;
    const scroller = detailCopyRef.current;
    if (!scroller) return;
    const overlay = scroller.closest<HTMLElement>(".project-detail-overlay");

    const sections = Array.from(
      scroller.querySelectorAll<HTMLElement>("[data-detail-section]"),
    );
    if (!sections.length) return;

    let frame = 0;
    const updateActiveSection = () => {
      frame = 0;
      // Mobile selection is tap-driven; scrolling does not change the active section.
      if (window.matchMedia("(max-width: 900px)").matches) return;
      const scrollRoot = scroller.scrollHeight > scroller.clientHeight + 1
        ? scroller
        : (overlay ?? scroller);
      const rootBounds = scrollRoot.getBoundingClientRect();
      const rootTop = Math.max(0, rootBounds.top);
      const rootBottom = Math.min(window.innerHeight, rootBounds.bottom);
      const rootHeight = Math.max(1, rootBottom - rootTop);
      let nextIndex = 0;
      let bestScore = -Infinity;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const visibleHeight = Math.max(
          0,
          Math.min(rect.bottom, rootBottom) - Math.max(rect.top, rootTop),
        );
        // Compare the visible fraction so long and short sections compete fairly.
        // A tiny top-position tiebreaker favors the higher section when equal.
        const visibleRatio = visibleHeight / Math.max(1, rect.height);
        const topTiebreaker = Math.max(0, rootBottom - rect.top) / rootHeight * 0.0001;
        const score = visibleRatio + topTiebreaker;
        if (score > bestScore) {
          bestScore = score;
          nextIndex = index;
        }
      });

      setVisibleDetailSection((current) => current === nextIndex ? current : nextIndex);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    };

    scroller.addEventListener("scroll", scheduleUpdate, { passive: true });
    overlay?.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    updateActiveSection();
    return () => {
      scroller.removeEventListener("scroll", scheduleUpdate);
      overlay?.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [detailsOpen, project.details]);

  useEffect(() => {
    if (!detailsOpen) return;
    const overlay = detailCopyRef.current?.closest<HTMLElement>(".project-detail-overlay");
    if (!overlay) return;

    let lastScrollTop = overlay.scrollTop;
    const updateMobileClose = () => {
      if (!window.matchMedia("(max-width: 900px)").matches) {
        setMobileDetailCloseVisible(true);
        return;
      }

      const nextScrollTop = overlay.scrollTop;
      if (nextScrollTop <= 8) setMobileDetailCloseVisible(true);
      else if (nextScrollTop > lastScrollTop + 3) setMobileDetailCloseVisible(false);
      else if (nextScrollTop < lastScrollTop - 3) setMobileDetailCloseVisible(true);
      lastScrollTop = nextScrollTop;
    };

    overlay.addEventListener("scroll", updateMobileClose, { passive: true });
    window.addEventListener("resize", updateMobileClose);
    return () => {
      overlay.removeEventListener("scroll", updateMobileClose);
      window.removeEventListener("resize", updateMobileClose);
    };
  }, [detailsOpen]);

  const detailSections = project.details?.sections ?? [];
  const activeDetailSection = hoveredDetailSection ?? visibleDetailSection;
  const configuredImageIndex = detailSections[activeDetailSection]?.imageIndex;
  const linkedImageIndex = configuredImageIndex === -1
    ? undefined
    : (configuredImageIndex ?? activeDetailSection);
  const cardClickCameFromControl = (target: EventTarget | null) =>
    target instanceof Element
    && target.closest("button, a, .carousel-viewport, .carousel-slide figcaption") !== null;

  return (
    <article
      className={`project-card${project.details ? " has-details" : ""}${detailsOpen ? " has-open-detail" : ""}`}
      role={project.details ? "button" : undefined}
      tabIndex={project.details ? 0 : undefined}
      aria-label={project.details ? `Open more information about ${project.title}` : undefined}
      onClick={(event) => {
        if (detailsOpen || !project.details || cardClickCameFromControl(event.target)) return;
        openDetails();
      }}
      onKeyDown={(event) => {
        if (
          !project.details
          || event.target !== event.currentTarget
          || (event.key !== "Enter" && event.key !== " ")
        ) return;
        event.preventDefault();
        openDetails();
      }}
    >
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
          <div className="project-actions">
            {project.details && (
              <button
                ref={moreInfoButtonRef}
                className="project-action project-more-info"
                type="button"
                onClick={openDetails}
                aria-haspopup="dialog"
              >
                <span>More info</span>
                <span aria-hidden="true">↗</span>
              </button>
            )}
            {project.githubUrl && (
              <a
                className="project-action project-github"
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
      </div>
      <ProjectCarousel
        title={project.title}
        slides={project.slides}
        autoPlay={autoPlay}
        imagesEnabled={imagesEnabled}
      />
      {detailsOpen && project.details && createPortal(
        <div
          className={`project-detail-overlay${detailsClosing ? " is-closing" : ""}`}
          role="presentation"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) closeDetails();
          }}
        >
          <section
            className="project-detail"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`project-detail-title-${project.number}`}
          >
            <div className="project-detail-copy" ref={detailCopyRef}>
              <header className="project-detail-heading">
                <div className="project-meta">
                  <span>{project.number}</span>
                  <span>{project.eyebrow}</span>
                </div>
                <h2 id={`project-detail-title-${project.number}`}>{project.title}</h2>
                {project.collaboration && <CollaborationCredit collaboration={project.collaboration} />}
              </header>
              <div className="project-detail-sections">
                {project.details.sections.map((section, sectionIndex) => (
                  <section
                    className={`project-detail-section${sectionIndex === activeDetailSection ? " is-active" : ""}`}
                    data-detail-section
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") setHoveredDetailSection(sectionIndex);
                    }}
                    onPointerLeave={(event) => {
                      if (event.pointerType === "mouse") setHoveredDetailSection(null);
                    }}
                    onClick={(event) => {
                      if (!window.matchMedia("(max-width: 900px)").matches) return;
                      event.stopPropagation();
                      setHoveredDetailSection(sectionIndex);
                    }}
                    key={`${section.heading}-${sectionIndex}`}
                  >
                    <div className="project-detail-section-heading">
                      <span className="project-detail-section-number" aria-hidden="true">
                        {String(sectionIndex + 1).padStart(2, "0")}
                      </span>
                      <h3>{section.heading}</h3>
                      <span className="project-detail-section-dot" aria-hidden="true" />
                    </div>
                    {section.text && <p>{section.text}</p>}
                    {section.items && (
                      <ul>
                        {section.items.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            </div>
            <div className="project-detail-gallery">
              <button
                ref={closeButtonRef}
                className={`project-detail-close${mobileDetailCloseVisible ? "" : " is-mobile-hidden"}`}
                type="button"
                onClick={closeDetails}
                aria-label={`Close ${project.title} details`}
              >
                <span>Close</span>
                <span aria-hidden="true">×</span>
              </button>
              <ProjectCarousel
                title={project.title}
                slides={project.slides}
                autoPlay={false}
                imagesEnabled
                selectedSlide={linkedImageIndex}
                selectedSlideKey={activeDetailSection}
              />
            </div>
            <div
              className="project-detail-divider-progress"
              aria-label={`Reading section ${activeDetailSection + 1} of ${detailSections.length}`}
            >
              <span
                className="project-detail-divider-current"
                style={{
                  "--detail-progress": `${activeDetailSection / Math.max(1, detailSections.length - 1) * 100}%`,
                } as CSSProperties}
                aria-hidden="true"
              />
            </div>
          </section>
        </div>,
        document.body,
      )}
    </article>
  );
});

function CollaborationCredit({ collaboration }: { collaboration: Collaboration }) {
  return (
    <p className="project-collaboration">
      {collaboration.label}{" "}
      {collaboration.url ? (
        <a
          className="project-collaboration-highlight"
          href={collaboration.url}
          target="_blank"
          rel="noreferrer"
        >
          {collaboration.highlight}
        </a>
      ) : (
        <strong className="project-collaboration-highlight">{collaboration.highlight}</strong>
      )}
    </p>
  );
}

function ProjectCaption({
  hidden,
  index,
  total,
  title,
  onToggle,
}: {
  hidden: boolean;
  index: number;
  total: number;
  title: string;
  onToggle: () => void;
}) {
  const captionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const caption = captionRef.current;
    const frame = caption?.parentElement;
    if (!caption || !frame) return;

    let active = true;
    const updateAlignment = () => {
      if (!active) return;
      // Keep the original lower-left placement whenever the whole caption fits.
      caption.classList.toggle(
        "is-frame-overflowing",
        caption.offsetWidth + 32 > frame.clientWidth,
      );
    };
    const resizeObserver = new ResizeObserver(updateAlignment);
    resizeObserver.observe(frame);
    resizeObserver.observe(caption);
    const frameId = window.requestAnimationFrame(updateAlignment);
    void document.fonts?.ready.then(updateAlignment);

    return () => {
      active = false;
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frameId);
    };
  }, [hidden, title]);

  return (
    <figcaption
      ref={captionRef}
      className={hidden ? "is-mobile-hidden" : undefined}
      onPointerDown={(event) => {
        if (window.matchMedia(coarsePointerQuery).matches) event.stopPropagation();
      }}
      onClick={(event) => {
        if (!window.matchMedia(coarsePointerQuery).matches) return;
        event.stopPropagation();
        onToggle();
      }}
    >
      <span>
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      <strong>{title}</strong>
    </figcaption>
  );
}

function ProjectCarousel({
  title,
  slides,
  autoPlay,
  imagesEnabled,
  selectedSlide,
  selectedSlideKey,
}: {
  title: string;
  slides: ProjectSlide[];
  autoPlay: boolean;
  imagesEnabled: boolean;
  selectedSlide?: number;
  selectedSlideKey?: number;
}) {
  // activeSlide is the real content index; trackIndex also includes edge clones.
  const [activeSlide, setActiveSlide] = useState(0);
  const [trackIndex, setTrackIndex] = useState(slides.length > 1 ? 1 : 0);
  const [isResettingTrack, setIsResettingTrack] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxClosing, setLightboxClosing] = useState(false);
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
  const lightboxCloseTimerRef = useRef<number | null>(null);
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

  const openLightbox = () => {
    if (lightboxCloseTimerRef.current !== null) {
      window.clearTimeout(lightboxCloseTimerRef.current);
      lightboxCloseTimerRef.current = null;
    }
    setLightboxClosing(false);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    if (lightboxClosing) return;
    postponeAutoPlay();
    if (window.matchMedia(reducedMotionQuery).matches) {
      setLightboxOpen(false);
      return;
    }
    setLightboxClosing(true);
    lightboxCloseTimerRef.current = window.setTimeout(() => {
      lightboxCloseTimerRef.current = null;
      setLightboxOpen(false);
      setLightboxClosing(false);
    }, 260);
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
    if (lightboxCloseTimerRef.current !== null) window.clearTimeout(lightboxCloseTimerRef.current);
  }, []);

  useEffect(() => {
    if (selectedSlide === undefined || slides.length === 0) return;
    const nextSlide = Math.min(slides.length - 1, Math.max(0, selectedSlide));
    setMobileCaptionHidden(false);
    setActiveSlide((current) => current === nextSlide ? current : nextSlide);
    const nextTrackIndex = slides.length > 1 ? nextSlide + 1 : nextSlide;
    trackIndexRef.current = nextTrackIndex;
    setTrackIndex((current) => current === nextTrackIndex ? current : nextTrackIndex);
  }, [selectedSlide, selectedSlideKey, slides.length]);

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
      <ProjectCaption
        hidden={mobileCaptionHidden && index === activeSlide}
        index={index}
        total={slides.length}
        title={slide.title}
        onToggle={() => {
          postponeAutoPlay();
          setMobileCaptionHidden((hidden) => !hidden);
        }}
      />
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
              openLightbox();
            }
          }}
          onPointerDown={beginDrag}
          onPointerMove={updateDrag}
          onPointerUp={(event) => finishDrag(event, openLightbox)}
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
          className={`image-lightbox${lightboxClosing ? " is-closing" : ""}`}
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
