export type ProjectSlide = {
  title: string;
  image: string;
  alt?: string;
};

export type Collaboration = {
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

export type Project = {
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
export const projects: Project[] = [
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
      { title: "Schematic", image: "./projects/Class D Amplifier/Schematic.png" },
      { title: "PCB Layout", image: "./projects/Class D Amplifier/Routing.png" },
      { title: "3D Model", image: "./projects/Class D Amplifier/3D Model.png" },
    ],
  },
  {
    number: "02",
    year: "2026",
    eyebrow: "Embedded Systems / Electrical",
    title: "STM32 Flight Controller",
    collaboration: {
      label: "In collaboration with",
      highlight: "Moiz Ahmad",
      url: "https://moizahmad.com",
    },
    summary:
      "Designed and developed a custom STM32-based flight controller for a fixed-wing RC aircraft. The board integrates an STM32F446 microcontroller, IMU and barometric pressure sensors, USB communication, ELRS radio connectivity, and multiple PWM outputs for flight-control hardware. The project involved schematic design, component selection, power regulation, four-layer PCB layout, USB differential-pair routing, and hardware bring-up using STM32CubeMX, C/C++, and SWD debugging.",
    tags: ["Altium", "SPI & I2C", "UART", "USB", "STM32CubeMX"],
    slides: [
      { title: "Schematic", image: "./projects/STM Flight Controller/Schematic Altium.png" },
      { title: "PCB Layout", image: "./projects/STM Flight Controller/Routing.png" },
      { title: "3D Model", image: "./projects/STM Flight Controller/3D model.png" },
      { title: "Manufactured", image: "./projects/STM Flight Controller/Top IRL PCB.jpg" },
    ],
  },
  {
    number: "03",
    year: "2025",
    githubUrl: "https://github.com/mynteee/tracking-14-a",
    eyebrow: "IoT Asset Tracking / Software & Hardware",
    title: "ESP32 Asset Tracking",
    collaboration: {
      label: "In collaboration with",
      highlight: "ES1050",
      url: "https://www.eng.uwo.ca/media/news/2024/Thompson-Centre-ES1050-professors-making-an-impact.html",
    },
    summary:
      "Developed an ESP32-based indoor tracking system designed to monitor BLE-enabled assets across hospital rooms and zones. Multiple ESP32 gateways scan for low-power Bluetooth beacons and use received signal strength to estimate each tag’s location, then transmit tracking data over Wi-Fi to a central MQTT server for monitoring and visualization on a web-based dashboard.",
    tags: ["ESP32", "BLE", "MQTT", "Wi-Fi", "Onshape"],
    slides: [
      { title: "ESP32 Case", image: "./projects/Tracker System/CaseOpen.jpg" },
      { title: "Tag", image: "./projects/Tracker System/TagHousing.jpg" },
      { title: "Tag Battery", image: "./projects/Tracker System/TagBattery.jpg" },
      { title: "Dashboard", image: "./projects/Tracker System/WebApp.png" },
    ],
  },
  {
    number: "04",
    year: "2025",
    eyebrow: "Gearbox Design / Mechanical",
    title: "Harmonic Drive",
    summary:
      "Designed and developed a custom harmonic drive gearbox using a flex spline printed in nylon and a wave generator to achieve a compact form factor and 20:1 reduction ratio. The project was designed to fit flush with a NEMA 17 stepper motor and focused on mechanical design, gear geometry, material selection, and design for additive manufacturing while balancing flexibility, stiffness, and durability.",
    tags: [
      "Gear Design",
      "Fusion 360",
      "Material Selection",
      "Additive Manufacturing",
      "Stepper Motor",
    ],
    slides: [
      { title: "Exploded", image: "./projects/Harmonic Drive/Exploded.png" },
      { title: "Exploded", image: "./projects/Harmonic Drive/ExplodedBack.png" },
      { title: "Cross Section", image: "./projects/Harmonic Drive/Cross.png" },
      { title: "Open", image: "./projects/Harmonic Drive/Open.jpg" },
      { title: "Closed", image: "./projects/Harmonic Drive/Closed.jpg" },
      { title: "Bread board", image: "./projects/Harmonic Drive/BreadBoard.jpg" },
    ],
  },
  {
    number: "05",
    year: "2025",
    eyebrow: "Drone Design / Mechanical & Electrical",
    title: "3D-Printed Drone",
    summary:
      "Designed and built a custom 3D-printed drone, developing the airframe from scratch and printing it in carbon-fiber-filled PETG with a focus on weight, strength, and component integration. I used Betaflight to configure an F405 Mini flight controller stack to enable smooth flight. This project combined CAD modeling, additive manufacturing, electronics integration, assembly, and iterative testing to refine the frame and overall flight platform.",
    tags: ["Fusion 360", "Bambu Slicer", "Betaflight", "Additive Manufacturing"],
    slides: [
      { title: "Front", image: "./projects/3D Printed Drone/Front.jpg" },
      { title: "Back", image: "./projects/3D Printed Drone/Back.jpg" },
      { title: "Top", image: "./projects/3D Printed Drone/Top.jpg" },
      { title: "CAD", image: "./projects/3D Printed Drone/Cad Top.png" },
      { title: "Bumper", image: "./projects/3D Printed Drone/Bumper.png" },
    ],
  },
  {
    number: "06",
    year: "2025",
    githubUrl: "https://github.com/KoiBirb/Forsaken-Crown",
    eyebrow: "Game Design / Software",
    title: "Arcade Machine Game",
    collaboration: {
      label: "In collaboration with London Central Secondary School",
      highlight: "",
      url: "",
    },
    summary:
      "Designed and developed a hack-and-slash platformer game inspired by Hollow Knight. I used Java Swing to display the graphics and developed experience structuring and maintaining a codebase of over 20,000 lines. Used Tiled to create the game maps and JSON files to store map data.",
    tags: ["Java", "IntelliJ", "JSON", "GitHub", "Tiled"],
    slides: [
      { title: "Main", image: "./projects/Forsaken Crown/Main.jpg" },
      { title: "Dark Cave", image: "./projects/Forsaken Crown/Start.jpg" },
      { title: "Checkpoint", image: "./projects/Forsaken Crown/Checkpoint.jpg" },
      { title: "Bone Castle", image: "./projects/Forsaken Crown/Mid.jpg" },
      { title: "Arena", image: "./projects/Forsaken Crown/Boss.jpg" },
      { title: "Map", image: "./projects/Forsaken Crown/Map.png" },
      { title: "Controls", image: "./projects/Forsaken Crown/Controls.jpg" },
    ],
  },
  {
    number: "07",
    year: "2024",
    githubUrl: "https://github.com/KoiBirb/Robot-Dog",
    eyebrow: "Quadruped Robotics / Mechanical / Electrical",
    title: "Robot Dog",
    collaboration: {
      label: "In collaboration with",
      highlight: "Moiz Ahmad",
      url: "https://moizahmad.com",
    },
    summary:
      "Designed and built a custom quadruped robot dog for a Western University competition, integrating an ESP32, custom KiCad PCB, servo driver, and 12 actuated joints. The project combined mechanical design, electronics, and inverse kinematics to coordinate multi-joint leg motion and produce controlled walking movements.",
    tags: ["C++", "Arduino IDE", "KiCad", "ESP32", "Inverse Kinematics", "Servos"],
    slides: [
      { title: "Folded", image: "./projects/Robot dog/Folded.jpg" },
      { title: "Side", image: "./projects/Robot dog/Side.jpg" },
      { title: "Top", image: "./projects/Robot dog/Top.jpg" },
      { title: "Front", image: "./projects/Robot dog/Front.jpg" },
      { title: "Unassembled", image: "./projects/Robot dog/Unassembled.jpg" },
      { title: "Poster", image: "./projects/Robot dog/Poster.png" },
    ],
  },
];

export const timelineYears = Array.from(
  new Set(["2026", ...projects.map((project) => project.year)]),
);
