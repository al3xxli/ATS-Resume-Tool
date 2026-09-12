import { ProjectPacket } from '@/types/packets';

export const defaultProjectPackets: ProjectPacket[] = [
  {
    id: 'packet-morph-42',
    name: 'MORPH 42',
    subtitle: 'Split Ergonomic Keyboard, 42 Keys, Designed and Built from Scratch',
    dateRange: 'Jan 2025 - May 2025',
    category: 'hardware',
    tags: ['Ergonomics', '3D Printing', 'Hardware', 'User Testing'],
    highlights: [
      'Designed and built a 42-key split ergonomic keyboard centered on sustained-use comfort and typing performance.',
      'Iterated with 3D-printing and user testing; achieved +43% typing speed and +18% accuracy against an 87-key baseline.',
    ],
  },
  {
    id: 'packet-flow-auxetic',
    name: 'FLOW',
    subtitle: 'Bistable Auxetic Metamaterial, Computational Material & Form Exploration',
    awards: 'UWaterloo Outstanding Design Award | BDP Quadrangle Digital Fabrication Award | Riverside Gallery Feature',
    dateRange: 'Jun 2024 - Dec 2024',
    category: 'computational',
    tags: ['Computational Design', 'Auxetics', 'Human-in-the-Loop AI', 'Fabrication'],
    highlights: [
      'Developed robust Human-In-The-Loop AI framework and workflow to generate and validate complex geometries.',
      'Physically prototyped with 3D Printing, Laser-cutting, and precision cutting across a variety of materials.',
    ],
  },
  {
    id: 'packet-kurokeebs-hw',
    name: 'Kurokeebs Hardware Ecosystem',
    subtitle: 'Custom Mechanical Keyboards, PCB Architecture & Low-Volume Production',
    dateRange: 'Jan 2023 - Present',
    category: 'hardware',
    tags: ['KiCAD', 'PCB Design', 'RP2040', 'DFM', 'CNC Machining'],
    highlights: [
      'Engineered custom split PCB schematics and routing in KiCAD with surface-mount components, hot-swap sockets, and RP2040 microcontrollers.',
      'Managed end-to-end BOM, vendor sourcing, DFM verification, and CNC aluminum casing tolerances for international community group-buys.',
    ],
  },
  {
    id: 'packet-kinetic-facade',
    name: 'Parametric Kinetic Facade System',
    subtitle: 'Responsive Environmental Enclosure & Closed-Loop Solar Shading',
    dateRange: 'Sep 2024 - Apr 2025',
    category: 'architecture',
    tags: ['Grasshopper', 'Rhino 3D', 'Microcontrollers', 'Mechatronics', 'Parametric'],
    highlights: [
      'Designed algorithmic kinetic louvers in Rhino Grasshopper dynamically responsive to solar radiation data, reducing cooling load by 28%.',
      'Built 1:5 functional mechatronic prototype with microcontrollers, servo linkages, and laser-cut acrylic structural cassettes.',
    ],
  },
  {
    id: 'packet-ai-workflows',
    name: 'AI Generative Workflow Suite',
    subtitle: 'ComfyUI & Stable Diffusion Pipelines for Rapid Industrial Design Ideation',
    dateRange: 'Oct 2024 - Feb 2025',
    category: 'ai',
    tags: ['ComfyUI', 'Stable Diffusion', 'Python', 'Generative AI', 'Automation'],
    highlights: [
      'Engineered custom node workflows in ComfyUI integrating ControlNet and LoRA fine-tuning for high-fidelity CMF concept exploration.',
      'Automated batch rendering scripts in Python, reducing early-stage physical ideation cycles from days to hours.',
    ],
  },
];
