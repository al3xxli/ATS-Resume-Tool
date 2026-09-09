import { ResumeData } from '@/types/resume';

export const alexLiOriginalResume: ResumeData = {
  name: 'ALEX LI',
  targetJobTitle: 'Hardware Product Designer', // Matches job application title per 10.6x rule
  summary:
    'Architecture-trained product designer focused on physical products, human use, and material exploration. Experienced in taking products from concept and form development through prototyping, electronics, and digital fabrication.',
  contact: {
    phone: '+1 825 983 4291',
    email: 'a368li@berkeley.edu',
    linkedin: 'linkedin.com/in/al3xx-li',
    portfolio: 'al3xx.li',
    location: 'Berkeley, CA',
  },
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: "Master's of Design (Design for Emerging Technologies)",
      location: 'Berkeley, CA',
      dateRange: 'Aug 2026 - Dec 2027',
      details: [
        'College of Engineering and College of Environmental Design.',
        'Available Full-Time January 2028.',
      ],
    },
    {
      id: 'edu-2',
      institution: 'University of Waterloo',
      degree: 'Bachelor of Architectural Studies',
      location: 'Waterloo, ON, Canada',
      dateRange: 'Sep 2021 - Aug 2026',
      details: [
        'Graduated with Honours, Term Distinctions.',
        'Recipient of 6 academic/merit-based awards and 3 leadership awards.',
      ],
    },
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'DIALOG',
      role: 'Architectural Intern, Computational Design',
      location: 'Calgary, AB, Canada',
      dateRange: 'Jan 2026 - Apr 2026',
      highlights: [
        'Took over as Acting Computational Design Lead on the Red Deer Regional Hospital facade after senior technician departed mid-project.',
        'Reverse-engineered parametric Grasshopper script to be 62% more efficient, allowing direct manipulation by team members with basic Grasshopper familiarity.',
        'Specialized in Science & Technology and Aviation typologies; engineered designs for human-robot interactions in closed-loop systems.',
      ],
    },
    {
      id: 'exp-2',
      company: 'Perkins & Will',
      role: 'Architectural Intern, Design Documentation',
      location: 'Calgary, AB, Canada',
      dateRange: 'May 2025 - Aug 2025',
      highlights: [
        'Directed cross-team coordination and management to revamp and publish complete drawing packages for 18 flagship residential projects.',
        'Streamlined multi-disciplinary CAD and BIM standards to reduce design review revisions by 25%.',
      ],
    },
    {
      id: 'exp-3',
      company: 'BDP Quadrangle',
      role: 'Architectural Intern, Visualization',
      location: 'Toronto, ON, Canada',
      dateRange: 'May 2024 - Aug 2024',
      highlights: [
        'Convinced Principals to retain 3D visualization for inaugural healthcare project in-house by developing an AI-assisted rendering workflow to reduce external overhead.',
        'Delivered high-fidelity architectural renders under tight deadlines; final deliverables drew direct client commendation.',
      ],
    },
    {
      id: 'exp-4',
      company: 'GBL Architects',
      role: 'Architectural Intern, Design Development',
      location: 'Vancouver, BC, Canada',
      dateRange: 'Sep 2023 - Dec 2023',
      highlights: [
        'Carried schematic design through development-permit submission as part of a 4-person team in under 4 months, achieving the fastest permit progression in firm history.',
      ],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'MORPH 42',
      subtitle: 'Split Ergonomic Keyboard, 42 Keys, Designed and Built from Scratch',
      dateRange: 'Jan 2025 - May 2025',
      highlights: [
        'Designed and engineered a 42-key split ergonomic keyboard centered on sustained-use comfort, human ergonomics, and high typing throughput.',
        'Iterated rapidly through 3D printing and rigorous user testing; achieved +43% typing speed and +18% accuracy relative to an 87-key baseline.',
        'Completed full hardware stack including PCB schematic in KiCAD, Ergogen layout, SMD hand-soldering, and custom firmware flashing.',
      ],
    },
    {
      id: 'proj-2',
      name: 'FLOW',
      subtitle: 'Bistable Auxetic Metamaterial, Computational Material & Form Exploration',
      awards: 'UWaterloo Outstanding Design Award | BDP Quadrangle Digital Fabrication Award | Riverside Gallery Feature',
      dateRange: 'Jun 2024 - Dec 2024',
      highlights: [
        'Developed robust Human-In-The-Loop AI framework and workflow to generate, simulate, and validate complex auxetic geometric lattices.',
        'Physically prototyped using multi-material FDM 3D printing, laser-cutting, and precision CNC fabrication across elastomeric and rigid polymers.',
      ],
    },
  ],
  skills: [
    {
      category: 'Digital Fabrication',
      items: ['FDM 3D Printing (PLA, TPU, multi-material)', 'Laser-cutting', 'Precision CNC Cutting', 'Rapid Prototyping', 'Design for Manufacturing (DFM)'],
    },
    {
      category: '3D & CAD Modeling',
      items: ['Rhino 3D', 'Grasshopper (Parametric Modeling)', 'Revit (BIM)', 'AutoCAD', 'SolidWorks', 'Surface Modeling'],
    },
    {
      category: 'Electronics & Hardware',
      items: ['KiCAD', 'Ergogen', 'PCB Design', 'SMD Hand-Soldering', 'Microcontrollers (Arduino/RP2040)', 'Firmware Configuration'],
    },
    {
      category: 'AI & Computational Workflows',
      items: ['Python Scripting', 'Local LLM Scripting (LMStudio, Ollama)', 'ComfyUI Node Graphs', 'Stable Diffusion', 'Human-in-the-Loop AI'],
    },
    {
      category: '2D & Visualization',
      items: ['Adobe Creative Suite (Photoshop, Illustrator, InDesign)', 'Figma', 'Twinmotion', 'DaVinci Resolve', 'Technical Documentation'],
    },
  ],
  languages: ['English (Fluent)', 'Mandarin Chinese (Native)'],
};
