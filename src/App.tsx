import type { CSSProperties } from "react";
import { backgroundSong } from "./config";
import { projects, timelineYears } from "./data/projects";
import { ArrowDown, AudioIcon, PageIcon } from "./components/Icons";
import { ProjectCard } from "./components/ProjectCard";
import { useAudio } from "./hooks/useAudio";
import { useStoryProgress } from "./hooks/useStoryProgress";
import { useAssetLoading } from "./hooks/useAssetLoading";

export default function App() {
  const { storyRef, imageRef, activeYear, yearPulse, mobileSocialVisible, activeProjectIndex } =
    useStoryProgress();
  const {
    audioRef,
    musicMuted,
    musicVolume,
    playbackBlocked,
    toggleMusicMute,
    prepareMusic,
    handleVolumeChange,
  } = useAudio();
  const imagesReady = useAssetLoading(imageRef, audioRef);
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
            aria-label={
              audioAppearsMuted
                ? `Play or unmute ${backgroundSong.title}`
                : `Mute ${backgroundSong.title}`
            }
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
          />
          <div className="scene-shade" />
          <p className="image-marker marker-top">00° · Above the treeline</p>
          <div className="year-timeline">
            <span
              className={`timeline-current ${yearPulse ? "pulse-a" : "pulse-b"}`}
              style={
                {
                  "--timeline-position": `${(Math.max(0, timelineYears.indexOf(activeYear)) / Math.max(1, timelineYears.length - 1)) * 100}%`,
                } as CSSProperties
              }
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
              <p className="hero-specialties">
                Robotics <span>|</span> Aerospace
              </p>
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
                I am a student from Ontario, Canada, currently studying at Western University. I
                love PCB design, CAD, robotics, and aeronautics. I enjoy combining electrical,
                mechanical, and software skills to design and build practical engineering systems.
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
                  imagesEnabled={imagesReady}
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
