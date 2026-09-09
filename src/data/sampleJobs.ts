export interface SampleJob {
  id: string;
  title: string;
  company: string;
  category: string;
  description: string;
  primaryKeywords: string[];
}

export const singleSampleJob: SampleJob = {
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
    'Precision-cutting',
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
We are seeking an innovative Hardware Product Designer to drive physical product development from early concept exploration through functional prototyping, iteration, and manufacturing readiness.

Key Responsibilities:
- Translate human needs and physical interaction insights into elegant hardware architectures and physical forms.
- Lead end-to-end rapid prototyping cycles using FDM 3D printing, laser-cutting, and multi-material fabrication.
- Build ergonomic, functional physical prototypes and execute quantitative user testing to validate comfort and usability.
- Collaborate with engineering on PCB design integration using KiCAD, SMD hand-soldering, and sensor placement.
- Produce production-ready CAD modeling and surface modeling in Rhino 3D adhering to Design for Manufacturing (DFM) principles.
- Maintain meticulous technical documentation, drawing packages, and BOM management.

Requirements & Qualifications:
- Degree in Product Design, Industrial Design, Mechanical Engineering, or related architectural/design discipline.
- Hands-on expertise in rapid prototyping, 3D printing (PLA, TPU), precision cutting, and hand fabrication.
- Proficiency with Rhino 3D, Grasshopper, and parametric surface modeling.
- Working knowledge of PCB layout (KiCAD or Ergogen) and basic electronics assembly / soldering.
- Experience conducting human ergonomics research, usability testing, and data-driven design iteration.
- Visual communication skills using Figma and Adobe Creative Suite.
- Passion for material exploration and human-centered design principles.`,
};

export const sampleJobs: SampleJob[] = [singleSampleJob];
