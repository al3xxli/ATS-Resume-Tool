import { ResumeData } from '@/types/resume';

export const alexLiOriginalResume: ResumeData = {
  name: 'ALEX LI',
  targetJobTitle: 'HARDWARE PRODUCT DESIGNER',
  summary:
    'Architecture-trained product designer focused on physical products, human use, and material exploration.\nI take products from concept and form development through prototyping and fabrication.',
  contact: {
    phone: '+1 825 983 4291',
    email: 'a368li@berkeley.edu',
    linkedin: 'linkedin.com/in/al3xx-li',
    portfolio: 'www.al3xx.li',
    location: 'Berkeley, CA',
  },
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: "Master's of Design — Design for Emerging Technologies",
      location: 'Berkeley, CA',
      dateRange: 'Aug 2026 - Dec 2027',
      details: [
        'College of Engineering and College of Environmental Design. Available Full-Time Jan 2028.',
      ],
    },
    {
      id: 'edu-2',
      institution: 'University of Waterloo',
      degree: 'Bachelor of Architectural Studies',
      location: 'Waterloo, ON',
      dateRange: 'Sep 2021 - Aug 2026',
      details: [
        'Graduated with Honours, Term Distinctions. Recipient of 6 academic/merit-based awards and 3 leadership awards.',
      ],
    },
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'DIALOG',
      role: 'Architectural Intern, Computational Design',
      location: 'Calgary, AB, Canada',
      dateRange: 'Jan 2026 - Apr 2026 & Jan 2025 - Apr 2025',
      highlights: [
        'Took over as Acting Computational Design Lead on Red Deer Regional Hospital facade after technician left mid-project.',
        'Reverse-engineered Grasshopper script to be 62% more efficient and operable by anyone with basic Grasshopper familiarity.',
        'Specialized in Science & Technology, Aviation Typologies; design for human-robot interactions in closed loop systems.',
      ],
    },
    {
      id: 'exp-2',
      company: 'Perkins & Will',
      role: 'Architectural Intern, Design Documentation',
      location: 'Calgary, AB, Canada',
      dateRange: 'May 2025 - Aug 2025',
      highlights: [
        'Directed cross-team coordination and management to revamp and publish drawing sets for 18 flagship residential projects.',
      ],
    },
    {
      id: 'exp-3',
      company: 'BDP Quadrangle',
      role: 'Architectural Intern, Visualization',
      location: 'Toronto, ON, Canada',
      dateRange: 'May 2024 - Aug 2024',
      highlights: [
        'Convinced Principals to keep visualization of inaugural healthcare project in-house by developing an AI-assisted rendering workflow to reduce overhead and maintain design agency; results drew direct client praise.',
      ],
    },
    {
      id: 'exp-4',
      company: 'GBL Architects',
      role: 'Architectural Intern, Design Development',
      location: 'Vancouver, BC, Canada',
      dateRange: 'Sep 2023 - Dec 2023',
      highlights: [
        'Carried schematic design to development-permit submission as part of team of four in under four months as the fastest progression the firm had achieved.',
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
        'Designed and built a 42-key split ergonomic keyboard centered on sustained-use comfort and typing performance.',
        'Iterated with 3D-printing and user testing; achieved +43% typing speed and +18% accuracy against an 87-key baseline.',
      ],
    },
    {
      id: 'proj-2',
      name: 'FLOW',
      subtitle: 'Bistable Auxetic Metamaterial, Computational Material & Form Exploration',
      awards: 'UWaterloo Outstanding Design Award | BDP Quadrangle Digital Fabrication Award | Riverside Gallery Feature',
      dateRange: 'Jun 2024 - Dec 2024',
      highlights: [
        'Developed robust Human-In-The-Loop AI framework and workflow to generate and validate complex geometries.',
        'Physically prototyped with 3D Printing, Laser-cutting, and precision cutting across a variety of materials.',
      ],
    },
  ],
  skills: [
    {
      category: 'Digital Fabrication',
      items: ['FDM 3D Printing (PLA, TPU, multi-material)', 'Laser-cutting', 'Precision-cutting', 'DFM Rapid Prototyping'],
    },
    {
      category: '3D & CAD',
      items: ['Rhino 3D', 'Grasshopper', 'Revit', 'AutoCAD', 'SolidWorks'],
    },
    {
      category: 'Electronics & Hardware',
      items: ['KiCAD', 'Ergogen', 'SMD Hand-Soldering', 'Python', 'PCB Design', 'Microcontrollers'],
    },
    {
      category: 'AI & Computational',
      items: ['Local Scripting (LMStudio, Ollama)', 'ComfyUI', 'Stable Diffusion', 'Human-in-the-Loop AI'],
    },
    {
      category: '2D & Visual',
      items: ['Adobe Creative Suite', 'Figma', 'Twinmotion', 'DaVinci Resolve'],
    },
  ],
  languages: ['English', 'Mandarin Chinese'],
  sectionOrder: 'projects_first',
};
