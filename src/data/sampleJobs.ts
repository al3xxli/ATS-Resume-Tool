export interface SampleJob {
  id: string;
  title: string;
  company: string;
  category: string;
  description: string;
  primaryKeywords: string[];
}

export const sampleJobs: SampleJob[] = [
  {
    id: 'hardware-product-designer',
    title: 'Hardware Product Designer',
    company: 'Humane Hardware Labs',
    category: 'Hardware & Industrial Design',
    primaryKeywords: [
      'Hardware Product Designer',
      'Rapid Prototyping',
      'FDM 3D Printing',
      'Laser-cutting',
      'Rhino 3D',
      'CAD Modeling',
      'Ergonomics',
      'Human-Centered Design',
      'PCB Design',
      'KiCAD',
      'User Testing',
      'Design for Manufacturing',
      'DFM',
      'SMD Hand-Soldering',
      'Physical Computing',
      'Surface Modeling',
      'Figma',
      'Precision Cutting',
      'Python',
      'Functional Prototypes',
      'Iterative Design',
      'Material Exploration',
      'Mechanical Assembly',
      'Technical Documentation',
      'Cross-Functional Collaboration',
      'BOM Management',
      'Tolerance Analysis',
    ],
    description: `Title: Hardware Product Designer
Company: Humane Hardware Labs
Location: San Francisco, CA / Remote

About the Role:
We are seeking an innovative Hardware Product Designer to drive physical product development from early concept exploration through functional prototyping, iteration, and manufacturing readiness. You will work closely with electrical engineers, software developers, and industrial designers to build tactile, human-centric hardware products.

Key Responsibilities:
- Translate human needs and physical interaction insights into elegant hardware architectures and physical forms.
- Lead end-to-end rapid prototyping cycles using FDM 3D printing, laser-cutting, CNC, and multi-material fabrication.
- Build ergonomic, functional physical prototypes and execute quantitative user testing to validate comfort, typing performance, and usability.
- Collaborate with engineering on PCB design integration using KiCAD, SMD hand-soldering, and sensor placement.
- Produce production-ready CAD modeling and surface modeling in Rhino 3D and SolidWorks adhering to Design for Manufacturing (DFM) principles.
- Maintain meticulous technical documentation, drawing packages, and BOM management for contract manufacturers.
- Conduct cross-functional collaboration with firmware engineers to flash microcontrollers and debug electromechanical assemblies.

Requirements & Qualifications:
- Bachelor's or Master's degree in Product Design, Industrial Design, Mechanical Design, or related architectural/engineering discipline.
- Demonstrated hands-on expertise in rapid prototyping, 3D printing (PLA, TPU), precision cutting, and hand fabrication.
- Deep proficiency with Rhino 3D, Grasshopper, and parametric surface modeling.
- Working knowledge of PCB layout (KiCAD or Ergogen) and basic electronics assembly / soldering.
- Proven experience conducting human ergonomics research, usability testing, and data-driven design iteration.
- Strong visual communication skills using Figma and Adobe Creative Suite.
- Passion for material exploration and human-centered design principles.`,
  },
  {
    id: 'computational-design-specialist',
    title: 'Senior Computational Design Specialist',
    company: 'Foster + Partners / Studio Synthesis',
    category: 'Architecture & Computational Design',
    primaryKeywords: [
      'Senior Computational Design Specialist',
      'Grasshopper',
      'Rhino',
      'Parametric Modeling',
      'Facade Systems',
      'Python Scripting',
      'Revit',
      'BIM Automation',
      'AI Workflows',
      'Algorithm Development',
      'Generative Design',
      'Digital Fabrication',
      'Closed-Loop Systems',
      'Complex Geometries',
      'Technical Documentation',
      'Drawing Packages',
      'Performance Optimization',
      'Cross-Team Coordination',
      'Twinmotion',
      'Architectural Documentation',
      'Healthcare Facilities',
      'Aviation Typologies',
      'Design Computation',
      'Data-Driven Design',
      'Permit Submission',
      'Human-Robot Interaction',
    ],
    description: `Title: Senior Computational Design Specialist
Company: Studio Synthesis
Location: New York, NY / Hybrid

About the Role:
We are looking for a Senior Computational Design Specialist to lead algorithmic design, facade engineering, and BIM automation across complex international commissions. You will architect computational workflows that unlock geometric complexity, optimize building performance, and bridge the gap between design and digital fabrication.

Responsibilities:
- Spearhead computational design workflows using Rhino and Grasshopper for complex geometries, kinetic facade systems, and stadium/aviation typologies.
- Develop custom Python scripts and Grasshopper components to automate repetitive modeling tasks and boost team workflow efficiency.
- Lead coordination between parametric Grasshopper algorithms and Revit BIM models for schematic design and permit submission.
- Serve as computational lead on flagship projects, mentoring junior designers and reverse-engineering complex legacy scripts into clean, maintainable tools.
- Integrate AI workflows and machine learning pipelines for generative form-finding and performance optimization.
- Partner with fabrication consultants and contractors to translate algorithmic models directly into digital fabrication drawing packages.

Qualifications:
- Degree in Architecture, Computational Design, Architectural Engineering, or related field.
- Advanced mastery of Rhino 3D, Grasshopper, Python, and Revit.
- Proven track record leading facade engineering, complex geometric rationalization, or digital fabrication projects.
- Strong background in architectural documentation, BIM standards, and cross-team coordination.
- Experience with AI-assisted workflows (Stable Diffusion, ComfyUI, or local LLMs) is a significant advantage.`,
  },
  {
    id: 'ai-design-engineer',
    title: 'AI Design Technologist',
    company: 'Synthetic Mind Studios',
    category: 'AI & Creative Tech',
    primaryKeywords: [
      'AI Design Technologist',
      'ComfyUI',
      'Stable Diffusion',
      'Python',
      'Human-In-The-Loop AI',
      'Local LLM',
      'Ollama',
      'Rapid Prototyping',
      'Creative Technology',
      'Figma',
      'HTML/CSS/JS',
      'Generative Workflows',
      'Model Fine-Tuning',
      'Prompt Engineering',
      'Physical Computing',
      'Parametric Design',
      'Digital Fabrication',
      'Interactive Prototypes',
      'Cross-Functional Teams',
      'User Experience',
      'Node-Based Systems',
      'Research & Development',
      'Machine Learning Integration',
      'Technical Documentation',
      '3D Printing',
      'Client Presentation',
    ],
    description: `Title: AI Design Technologist
Company: Synthetic Mind Studios
Location: San Francisco, CA

About the Role:
Synthetic Mind Studios is hiring an AI Design Technologist at the intersection of emerging AI workflows, physical computing, and product interaction. You will build internal generative AI pipelines, explore multimodal interaction models, and create next-generation interactive hardware/software prototypes.

Key Duties:
- Architect and maintain custom node-based AI workflows in ComfyUI, Stable Diffusion, and local LLM frameworks (Ollama, LMStudio).
- Build Human-in-the-Loop AI frameworks that empower creative teams to iterate faster while preserving design intentionality.
- Develop rapid web and hardware prototypes using Python, JavaScript, microcontrollers, and 3D printing.
- Partner with product designers and AI researchers to translate experimental models into tangible user experiences.
- Conduct user testing and usability benchmarks on novel AI interfaces and physical controllers.

Requirements:
- Bachelor's or Master's degree in Emerging Technologies, Interaction Design, Computer Science, or Product Design.
- Demonstrated portfolio demonstrating AI pipelines (ComfyUI, Stable Diffusion), Python scripting, and physical computing.
- Hands-on experience with digital fabrication, 3D printing, and rapid hardware iterations.
- Ability to articulate complex technological architectures to clients and cross-functional leadership.`,
  },
];
