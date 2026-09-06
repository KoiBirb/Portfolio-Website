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
  // Each entry is a separate paragraph; optional bullet points follow below.
  paragraphs?: string[];
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
          paragraphs: [
            "My goal was to create a compact amplifier that converts an analog audio signal into a high-frequency PWM waveform, in other words a class D amplifier. I wanted to only use through-hole componets that were easy to get and hand solder, while keeping switching losses and audible distortion low.",
          ],
          imageIndex: 0,
        },
        {
          heading: "Research",
          paragraphs: [
            "The design explores how a switching amplifier reproduces audio by varying the duty cycle of a high-frequency signal. Component selection focused on generating the carrier, comparing it with the audio input, and driving the power stage from separate logic and power supplies.",
            "A TLC555 timer generates the carrier ramp used by the PWM comparator. The gate-drive circuit includes complementary control signals and timing networks intended to limit overlap between the two MOSFETs.",
            "Output filtering reduces the switching-frequency content before the signal reaches the speaker.",
          ],
          imageIndex: -1,
        },
        {
          heading: "Circuit Design",
          paragraphs: [
            "The circuit is organized into an audio-input stage, carrier oscillator, PWM comparator, gate driver, MOSFET half-bridge, and output filter. This separates the low-level audio processing from the circuitry that switches power to the speaker.",
            "The schematic also includes a dedicated 5 V supply for the PWM logic, derived from the 12 V input. Keeping the signal path and power requirements visible as separate circuit blocks helped organize the component connections before laying out the PCB.",
          ],
          imageIndex: 0,
        },
        {
          heading: "Audio Input & PWM Generation",
          paragraphs: [
            "The audio input feeds a volume control, then separate resistors combine the left and right channels into one signal. AC coupling and a bias network place that signal around a DC reference for the single-supply comparator stage.",
            "A TLC555 timer generates the carrier ramp, which an LM393 comparator compares with the biased audio. The comparator output changes state as the two signals cross, encoding the audio into the duty cycle of the PWM waveform. An SN74HC04 inverter provides the complementary control path for the gate driver.",
          ],
          imageIndex: 0,
        },
        {
          heading: "Gate Drive & Output Filtering",
          paragraphs: [
            "An IR2113 high-side/low-side driver controls two IRLZ44N MOSFETs arranged as a 12 V half-bridge. The high-side drive uses a bootstrap diode and capacitor, while each MOSFET gate has a series resistor and a pull-down resistor. Resistor-capacitor and diode networks on the driver inputs are intended to limit overlap between the switching commands.",
            "The half-bridge output passes through three series inductors and a shunt capacitor to reduce the switching-frequency content. A separate coupling capacitor blocks the output's DC component before the speaker connection. These stages connect the PWM power waveform back to the analog audio output; their performance remains part of the ongoing testing work.",
          ],
          imageIndex: 0,
        },
        {
          heading: "Power Architecture",
          paragraphs: [
            "The 12 V input supplies the MOSFET output stage and gate-driver power rail. An LM2596 buck converter steps that supply down to 5 V for the timer, comparator, inverter, and driver logic.",
            "The converter output includes additional resistor-capacitor filtering, and local bypass capacitors sit around the individual IC supply connections. The schematic also includes bulk and high-frequency decoupling at the power input and driver, alongside the continuous ground layer used in the PCB layout.",
          ],
          imageIndex: 0,
        },
        {
          heading: "PCB Design",
          paragraphs: [
            "The Altium layout brings the audio input, PWM circuitry, gate driver, power stage, and output filter onto one board. Through-hole components and board-edge connections support assembly and access to the power input, volume control, and speaker output.",
            "The MOSFETs and output inductors are grouped around the switching stage, with wider copper paths for the power and speaker connections. The low-level audio and comparator components occupy a separate area from the power-switching components.",
            "The PCB uses two layers: component connections and signal routing on the first layer, with a continuous ground plane on the second. The ground plane provides a shared reference and return path for the circuitry, while local bypass capacitors support the supply rails.",
          ],
          imageIndex: 1,
        },
        {
          heading: "Enclosure",
          paragraphs: ["WIP"],
          imageIndex: -1,
        },
        {
          heading: "Testing & Outcome",
          paragraphs: ["WIP"],
          imageIndex: -1,
        },
        {
          heading: "Technical Summary",
          items: [
            "Architecture: analog-input Class D amplifier with a MOSFET half-bridge.",
            "PWM generation: TLC555 carrier oscillator, LM393 comparator, and SN74HC04 inverter.",
            "Power stage: IR2113 gate driver and two IRLZ44N MOSFETs.",
            "Supplies: 12 V input and an LM2596-derived, filtered 5 V logic rail.",
            "Audio path: adjustable volume, resistive stereo summing, input coupling and bias, output low-pass filtering, and DC blocking at the speaker.",
            "PCB: two layers, with top-layer routing and a continuous second-layer ground plane; designed in Altium using through-hole components.",
            "In progress: enclosure design and performance testing.",
          ],
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
      "Designed a custom four-layer STM32F446RET6 flight-controller board with Moiz Ahmad to match the requirements of our 3D-printed fixed-wing RC aircraft. The board combines motion and pressure sensing with nine PWM outputs: five for control surfaces, three for landing gear, and one for the ESC. Work covered STM32CubeMX pin and peripheral planning, Altium schematic and PCB design, power regulation, controlled-impedance USB routing, and manufacturing preparation.",
    tags: ["Altium", "SPI & I2C", "UART", "USB", "STM32CubeMX"],
    details: {
      sections: [
        {
          heading: "Project Goal",
          paragraphs: [
            "Our goal was to design a flight controller around the STM32F446RET6 for a 3D-printed fixed-wing aircraft me and my team are building. We wanted the electronics to match our aircraft's design specifications, including the required control-surface and landing-gear outputs, sensor connections, power distribution, and programming access.",
            "Designing a custom board let us choose the interfaces and connector layout around the aircraft it would go into. We could bring the processor, sensors, and actuator connections onto one compact PCB and plan the wiring and integration alongside the airframe design.",
          ],
          imageIndex: 0,
        },
        {
          heading: "Research",
          paragraphs: [
            "We started by mapping the aircraft's hardware requirements to the STM32F446RET6. Component datasheets guided the sensor interfaces, supply requirements, support circuitry, and footprints, while an 8 MHz external crystal formed the basis of our clock planning.",
            "STM32CubeMX helped us work through the MCU configuration before finalizing the schematic. We used its pinout and peripheral configuration to assign the PWM timer channels, SPI sensor bus, I2C pressure-sensor bus, USB, UART, and SWD connections. Planning these together helped us identify pin conflicts before those assignments became PCB traces.",
            "We also used CubeMX's clock-tree view to review the external-clock configuration and peripheral clocks, and generated the initial firmware project structure from the configuration. This connected our hardware pin choices to the starting firmware setup and gave us a way to revisit peripheral assignments as the schematic developed.",
            "Alongside MCU planning, we checked package dimensions, recommended footprints, decoupling, and connector assignments. We reviewed PCBWay's fabrication limits so the Altium layout rules reflected the board manufacturer's requirements.",
          ],
          imageIndex: 1,
        },
        {
          heading: "Circuit Design",
          paragraphs: [
            "The STM32F446RET6 connects to an IAM-20680HP IMU over SPI and a BMP581 pressure sensor over I2C, bringing motion and barometric sensing onto the controller itself. The schematic includes the sensors' supply connections and local decoupling, together with the MCU's external-crystal support network.",
            "USB Full-Speed and UART provide communication interfaces, while a dedicated SWD header gives an ST-Link access for programming and debugging. We planned these connections alongside the sensor buses and actuator outputs so they could all be supported by the same MCU pinout.",
          ],
          imageIndex: 0,
        },
        {
          heading: "Actuator Outputs & Aircraft Integration",
          paragraphs: [
            "Our aircraft needs nine PWM outputs: five for the control surfaces, three for the landing gear, and one for the motor's ESC. That allocation was a key requirement for the custom board and informed the timer-channel and pin assignments in STM32CubeMX.",
            "Board-mounted connectors bring those outputs directly to the aircraft's wiring. Planning the connections around our control surfaces, landing gear, and propulsion system helped us account for connector access and cable routing as part of integrating the controller into the 3D-printed airframe.",
          ],
          imageIndex: 0,
        },
        {
          heading: "Power Architecture",
          paragraphs: [
            "An external UBEC supplies approximately 5 V to the controller. The PCB distributes that incoming rail where needed and uses a TPS7A2033 regulator to produce 3.3 V for the STM32 and other low-voltage electronics.",
            "We incorporated regulator bypass components and local IC decoupling into the schematic, then considered the supply paths and grounding during placement and routing. The external 5 V supply and onboard 3.3 V regulation form separate parts of the board's power architecture.",
          ],
          imageIndex: 0,
        },
        {
          heading: "PCB Design",
          paragraphs: [
            "The four-layer board uses a Signal / Ground / Power / Signal stack-up. The ground layer beneath the top traces provides a reference for signal return paths, while the internal power layer distributes the supply rails. Placement brings together the MCU, sensors, clock, decoupling, and connectors around their routing requirements.",
            "USB D+ and D- were routed as a differential pair with an approximately 90-ohm impedance target. Pair spacing, reference-plane continuity, and routing discontinuities were considered during USB layout.",
            "Power routing, sensor-bus connections, and connector access were reviewed alongside the dense MCU fan-out.",
          ],
          imageIndex: 2,
        },
        {
          heading: "Manufacturing & Design Review",
          paragraphs: [
            "Altium design rules were set around the manufacturer's trace, clearance, via, annular-ring, solder-mask, and silkscreen requirements. Footprint checks and repeated design-rule reviews supported the transition from schematic to fabrication-ready layout.",
            "The board was reviewed in 2D and 3D to check component placement, mechanical fit, connector access, fine-pitch solder-mask details, and assembly clearances. Gerbers and assembly information, including component placement data, were then prepared and reviewed before fabrication.",
          ],
          imageIndex: 3,
        },
        {
          heading: "Outcome",
          paragraphs: [
            "The project produced a dedicated flight-controller design and manufactured PCB, bringing the aircraft interfaces onto one four-layer board. The completed scope covers the electronics, layout, USB routing, and fabrication preparation; flight-performance results are not yet included here.",
          ],
          imageIndex: 4,
        },
        {
          heading: "Technical Summary",
          items: [
            "Microcontroller: STM32F446RET6 with an 8 MHz external crystal.",
            "Sensors: IAM-20680HP IMU over SPI and BMP581 barometric pressure sensor over I2C.",
            "Actuators: nine PWM outputs, allocated to five control surfaces, three landing-gear connections, and one ESC.",
            "Communication and programming: USB Full-Speed, UART, and SWD for ST-Link access.",
            "Power: external approximately 5 V UBEC supply and onboard TPS7A2033 3.3 V regulation.",
            "PCB: four layers arranged Signal / Ground / Power / Signal, with an approximately 90-ohm USB differential-impedance target.",
            "Design tools: Altium Designer and STM32CubeMX, with layout rules based on PCBWay fabrication requirements.",
          ],
          imageIndex: -1,
        },
      ],
    },
    slides: [
      { title: "Schematic", image: "./projects/STM Flight Controller/Schematic Altium.png" },
      { title: "STM32CubeMX", image: "./projects/STM Flight Controller/STM Pinout.png" },
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
      "Developed a hospital asset-tracking prototype with an ES1050 team of 5 people, combining battery-powered BLE tags, ESP32 receiver nodes, and a React dashboard. Nodes estimate proximity from signal strength and send readings over Wi-Fi to an MQTT broker. The dashboard uses those observations to assign equipment to rooms and display it on a floor plan, with search, filters, and editable asset names.",
    tags: ["ESP32", "BLE", "MQTT", "Wi-Fi", "Onshape"],
    details: {
      sections: [
        {
          heading: "Project Goal",
          paragraphs: [
            "The teams goal was to help hospital staff locate equipment by showing the room associated with each tagged asset. Our ES1050 team developed a low-cost prototype IOT asset tracking system with replaceable tags and receiver nodes, we aimed for room-level tracking, straightforward maintenance, and positions updates well within the five-minute requirement.",
          ],
          imageIndex: 4,
        },
        {
          heading: "Hardware & BLE Tracking",
          paragraphs: [
            "Each asset carries a commercially available BLE module powered by a CR2032 coin cell. The tags broadcast about every 10 seconds, and ESP32 nodes running ESPresense scan for those advertisements. The proposed hospital installation also allows for compatible existing Cisco access points, with ESP32 nodes filling gaps in coverage.",
            "The nodes use received signal strength to estimate proximity to each tag. Those readings provide the input for room assignment in the dashboard.",
            "Battery life was projected at roughly two years; given the 220 mAh battery capacity and projected 10-microamp average-current, approximately 2.5 years could be achivable.",
          ],
          imageIndex: 5,
        },
        {
          heading: "Communication & Room Assignment",
          paragraphs: [
            "Receiver nodes publish their observations over Wi-Fi to an Eclipse Mosquitto MQTT broker. A Paho client brings updates into the web application, which retains observation data locally and compares readings from the nodes to select a room for each asset.",
            "The setup uses MQTT on port 1883 for nodes and WebSockets on port 9001 for the browser. Room assignment uses the nearest node's distance estimate alongside recent observations.",
          ],
          imageIndex: 7,
        },
        {
          heading: "Distance Estimation & Calibration",
          paragraphs: [
            "The system estimates distance with a log-distance path-loss model. It compares each RSSI reading with a reference signal strength at one metre and uses an environmental factor to relate signal loss to distance. That reference makes calibration an important part of interpreting the node's observations.",
            "Our initial test placed a tag one metre from a node, but the reported distance was only 0.1 m. The measured RSSI at that position was -47 dBm. Updating the calibration changed the one-metre reading to 0.78 m.",
            "Further checks at known distances helped us evaluate the estimates used by the room-selection logic. The dashboard's useful output is the likely room containing an asset, while the distance readings remain estimates rather than precise coordinates.",
          ],
          imageIndex: -1,
        },
        {
          heading: "Room-Assignment Iteration",
          paragraphs: [
            "Early tests exposed a timing problem: observations from different ESP32 nodes arrived at different times, so a tracker could be compared using mismatched distance readings. We revised the handling of those observations so the room decision accounted for update timing.",
            "A second issue appeared when two trackers occupied the same room. The original logic started with a room and looked for its closest tracker, which did not handle multiple assets in one room correctly. Changing the assignment to consider each tracker and its nearest node allowed multiple assets to share a room.",
            "After those fixes, the final test correctly displayed two tags in the same room and followed them as they moved to a second room. This iteration connected the incoming radio observations to the behavior users actually needed to see on the floor plan.",
          ],
          imageIndex: 8,
        },
        {
          heading: "Node Setup & Asset Registration",
          paragraphs: [
            "The setup begins by flashing ESPresense onto an ESP32, configuring Wi-Fi, giving the node an appropriate name, and entering the MQTT broker address and port. Mosquitto provides the central connection between the receiver nodes and the web application.",
            "To identify a new tag, we installed its battery and placed it close to a configured node, then sorted the detected devices by distance in ESPresense. Moving the tag away provided a check that the selected device was the right one. Its identifier could then be recorded and given a recognizable asset name in the dashboard.",
            "This process made individual assets configurable, but it still took about five minutes per asset. Reducing that manual setup would be a useful next step before extending the prototype to a much larger equipment inventory.",
          ],
          imageIndex: -1,
        },
        {
          heading: "Dashboard",
          paragraphs: [
            "The React application, built with TypeScript and JavaScript, places assets on a building floor plan. Selecting an equipment entry enlarges its marker on the map so staff can identify its location.",
          ],
          items: [
            "Search by equipment name, room, or usage tag.",
            "Filter the list by asset type to narrow down available equipment.",
            "Rename assets and assign organizational tags through the interface.",
          ],
          imageIndex: 8,
        },
        {
          heading: "Enclosure & Maintenance",
          paragraphs: [
            "Separate 3D-printed housings protect the ESP32 nodes and BLE tags. The tracker housing attaches to equipment with a zip tie, and its removable lid provides access to the coin-cell battery. The modular setup allows an individual tracker or node to be replaced independently.",
            "Enclosure design drawings and exploded assemblies for both housings, along with printing guidance for bed adhesion and lid-fit adjustments were created so anyone can replicate the enclosures. Battery replacement and node-configuration instructions explain how to maintain the system and set up replacement hardware.",
          ],
          imageIndex: 4,
        },
        {
          heading: "Testing & Outcome",
          paragraphs: [
            "In testing we found update delays of about 10–15 seconds. After RSSI calibration, distance readings were within 10% of the true values. These results supported room-level use while showing that signal-strength estimates were not precise position measurements.",
            "The final room-assignment test correctly tracked two tags moving around rooms in various scenarios reliably.",
            "Final costs were approximately $15 per tracker and $10 per receiver node. Manual asset configuration took about five minutes, leaving ease of setup as an area for improvement.",
          ],
          imageIndex: -1,
        },
        {
          heading: "Technical Summary",
          items: [
            "Tags: BLE beacon modules powered by replaceable CR2032 coin cells, advertising approximately every 10 seconds.",
            "Receiver nodes: ESP32 boards running ESPresense and connected over Wi-Fi.",
            "Location method: calibrated RSSI distance estimates and room assignment using nearby-node observations.",
            "Messaging: Eclipse Mosquitto MQTT broker, with port 1883 for nodes and WebSockets on port 9001 for the dashboard's Paho client.",
            "Dashboard: React, TypeScript, and JavaScript, with floor-plan markers, asset search, filters, names, and tags.",
            "Mechanical design: separate 3D-printed node and tracker housings, with zip-tie attachment and battery access for the tags.",
            "Reported prototype results: approximately 10–15-second updates, $15 per tracker, and $10 per node.",
            "Battery estimate: roughly 2–2.5 years based on the documented capacity and average current, not a measured lifetime.",
          ],
          imageIndex: -1,
        },
      ],
    },
    slides: [
      { title: "ESP32 Housing", image: "./projects/Tracker System/ESPCaseDrawing.png" },
      { title: "ESP32 Cap", image: "./projects/Tracker System/TopCaseDrawing.png" },
      { title: "Tag Housing", image: "./projects/Tracker System/TrackerCaseDrawing.png" },
      { title: "Tag Cap", image: "./projects/Tracker System/TrackerCapDrawing.png" },
      { title: "ESP32 Case", image: "./projects/Tracker System/CaseOpen.jpg" },
      { title: "Tag Case", image: "./projects/Tracker System/TagHousing.jpg" },
      { title: "Tag Battery", image: "./projects/Tracker System/TagBattery.jpg" },
      { title: "MQTT", image: "./projects/Tracker System/MQTT.png" },
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
      "Gearbox Design",
      "Gears",
      "Fusion 360",
      "Material Selection",
      "Additive Manufacturing",
      "Stepper Motors",
    ],
    slides: [
      { title: "Front", image: "./projects/Harmonic Drive/Full.jpg" },
      { title: "Exploded", image: "./projects/Harmonic Drive/Exploded.png" },
      { title: "Exploded", image: "./projects/Harmonic Drive/ExplodedBack.png" },
      { title: "Cross Section", image: "./projects/Harmonic Drive/Cross.png" },
      { title: "Open", image: "./projects/Harmonic Drive/Open.jpg" },
      { title: "Partial Open", image: "./projects/Harmonic Drive/PartialOpen.jpg" },
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
