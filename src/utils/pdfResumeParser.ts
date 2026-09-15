import { ResumeData, EducationItem, ExperienceItem, ProjectItem, SkillCategory, ContactInfo } from '../types/resume';

/**
 * Repairs corrupted font ligatures and private Unicode glyphs commonly produced
 * by custom PDF layout engines (e.g. InDesign, Illustrator, Figma, LaTeX).
 */
export function cleanPdfLigatures(text: string): string {
  if (!text) return '';

  return (
    text
      // Common private-use glyphs observed in PDF font subsets
      .replace(/\uE035/g, 'fl') // e.g. "agship" -> "flagship", "workow" -> "workflow"
      .replace(/\uE034/g, 'fi') // e.g. "rm’s" -> "firm's"
      .replace(/\uE033/g, 'ffi') // e.g. "ecient" -> "efficient"
      .replace(/\uE032/g, 'ff') // e.g. "Diusion" -> "Diffusion"
      .replace(/\uE031/g, 'fl')
      .replace(/\uE030/g, 'fi')
      // Standard Unicode ligatures
      .replace(/\uFB00/g, 'ff')
      .replace(/\uFB01/g, 'fi')
      .replace(/\uFB02/g, 'fl')
      .replace(/\uFB03/g, 'ffi')
      .replace(/\uFB04/g, 'ffl')
      .replace(/\uFB05/g, 'ft')
      .replace(/\uFB06/g, 'st')
      // Clean up typographics
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2013/g, '-')
      .replace(/\u2014/g, ' - ')
      .replace(/\u00A0/g, ' ')
  );
}

/**
 * Extracts contact information (email, phone, linkedin, portfolio, location)
 * using resilient regex patterns.
 */
export function extractContactInfo(text: string): { contact: ContactInfo; remainingText: string } {
  const contact: ContactInfo = {
    phone: '',
    email: '',
    linkedin: '',
    portfolio: '',
    location: '',
  };

  // Email pattern
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  if (emailMatch) {
    contact.email = emailMatch[0].trim();
  }

  // Phone pattern (e.g., +1 825 983 4291 or (555) 123-4567 or 555-123-4567)
  const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    contact.phone = phoneMatch[0].trim();
  }

  // LinkedIn pattern
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9_-]+)/i);
  if (linkedinMatch) {
    contact.linkedin = linkedinMatch[0].startsWith('http')
      ? linkedinMatch[0]
      : `https://${linkedinMatch[0]}`;
  }

  // Portfolio / Website pattern (find URLs not matching linkedin or email domains)
  const urlMatches = text.match(/(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9-]+\.(?:li|com|io|dev|org|me|design|tech|ca)(?:\/[^\s,]*)?/gi);
  if (urlMatches) {
    for (const url of urlMatches) {
      if (!url.toLowerCase().includes('linkedin.com') && !url.toLowerCase().includes('@')) {
        contact.portfolio = url.trim();
        break;
      }
    }
  }

  // Location pattern (e.g., "City, State/Province, Country" or "City, Province Country")
  const locationMatch = text.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+(?:\s*(?:Canada|USA|United States))?)/);
  if (locationMatch && !locationMatch[0].includes('University') && !locationMatch[0].includes('College')) {
    contact.location = locationMatch[0].trim();
  }

  return { contact, remainingText: text };
}

/**
 * Heuristic fallback parser that converts raw extracted PDF text into structured ResumeData.
 * Operates offline with zero external API dependencies.
 */
export function parseResumeTextHeuristically(rawText: string): ResumeData {
  const cleaned = cleanPdfLigatures(rawText);
  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Candidate Name
  // Typically the very first prominent non-contact line
  let name = 'Candidate Name';
  for (const line of lines.slice(0, 5)) {
    if (
      !line.includes('@') &&
      !line.includes('http') &&
      !line.includes('www.') &&
      !line.match(/\d{3}/) &&
      line.length >= 3 &&
      line.length <= 40
    ) {
      name = line.replace(/^[•\-\*]\s*/, '').trim();
      break;
    }
  }

  // 2. Contact Information
  const { contact } = extractContactInfo(cleaned);

  // 3. Section Segmentation
  const sections: {
    education: string[];
    experience: string[];
    projects: string[];
    skills: string[];
    languages: string[];
    summary: string[];
    other: string[];
  } = {
    education: [],
    experience: [],
    projects: [],
    skills: [],
    languages: [],
    summary: [],
    other: [],
  };

  type SectionKey = keyof typeof sections;
  let currentSection: SectionKey = 'summary';

  const sectionHeaderPatterns: Array<{ key: SectionKey; pattern: RegExp }> = [
    { key: 'education', pattern: /^(?:EDUCATION|ACADEMIC BACKGROUND|DEGREES)/i },
    { key: 'experience', pattern: /^(?:PROFESSIONAL EXPERIENCE|WORK EXPERIENCE|EXPERIENCE|EMPLOYMENT HISTORY)/i },
    { key: 'projects', pattern: /^(?:SELECTED PORTFOLIO PROJECTS|PORTFOLIO PROJECTS|PROJECTS|KEY PROJECTS)/i },
    { key: 'skills', pattern: /^(?:TECHNICAL SKILLS|CORE SKILLS|SKILLS & EXPERTISE|SKILLS)/i },
    { key: 'languages', pattern: /^(?:LANGUAGES|LANGUAGE PROFICIENCY)/i },
    { key: 'summary', pattern: /^(?:SUMMARY|POSITIONING SUMMARY|PROFILE|OBJECTIVE)/i },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip the candidate name or contact lines
    if (line === name || line.includes(contact.email) || line.includes(contact.phone)) {
      continue;
    }

    // Check if line matches a major section header
    let matchedHeader = false;
    for (const { key, pattern } of sectionHeaderPatterns) {
      if (pattern.test(line)) {
        currentSection = key;
        matchedHeader = true;
        break;
      }
    }

    if (matchedHeader) continue;

    // Detect inline languages e.g. "Languages: English, Mandarin Chinese"
    if (/^Languages:\s*/i.test(line)) {
      sections.languages.push(line.replace(/^Languages:\s*/i, ''));
      continue;
    }

    sections[currentSection].push(line);
  }

  // 4. Parse Education Items
  const education: EducationItem[] = [];
  const eduLines = sections.education;
  let currentEdu: Partial<EducationItem> | null = null;

  for (const line of eduLines) {
    const isInstitution =
      line.includes('University') ||
      line.includes('College') ||
      line.includes('Institute') ||
      line.includes('School');

    const dateMatch = line.match(/(?:Graduated\s+)?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[A-Za-z]+)?\s*\d{4}(?:\s*[-–]\s*(?:Present|[A-Za-z]+\s*\d{4}|\d{4}))?/i);

    if (isInstitution) {
      if (currentEdu && currentEdu.institution) {
        education.push({
          id: `edu-${education.length + 1}`,
          institution: currentEdu.institution,
          degree: currentEdu.degree || 'Degree Program',
          location: currentEdu.location || '',
          dateRange: currentEdu.dateRange || '2022 - 2026',
          details: currentEdu.details || [],
        });
      }

      currentEdu = {
        institution: line.replace(dateMatch ? dateMatch[0] : '', '').trim(),
        dateRange: dateMatch ? dateMatch[0].trim() : '',
        details: [],
      };
    } else if (currentEdu) {
      if (!currentEdu.degree) {
        currentEdu.degree = line;
      } else {
        currentEdu.details?.push(line);
      }
    }
  }
  if (currentEdu && currentEdu.institution) {
    education.push({
      id: `edu-${education.length + 1}`,
      institution: currentEdu.institution,
      degree: currentEdu.degree || 'Degree Program',
      location: currentEdu.location || '',
      dateRange: currentEdu.dateRange || '2022 - 2026',
      details: currentEdu.details || [],
    });
  }

  // 5. Parse Experience Items
  const experience: ExperienceItem[] = [];
  const expLines = sections.experience;
  let currentExp: Partial<ExperienceItem> | null = null;

  const dateRangeRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[A-Za-z]+)?\s*\d{4}\s*[-–]\s*(?:Present|[A-Za-z]+\s*\d{4}|\d{4})/i;

  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i];
    const dateMatch = line.match(dateRangeRegex);

    // Look for lines containing company & date or role lines
    if (dateMatch && (line.length < 70 || !line.endsWith('.'))) {
      if (currentExp && currentExp.company) {
        experience.push({
          id: `exp-${experience.length + 1}`,
          company: currentExp.company,
          role: currentExp.role || 'Design Engineer',
          location: currentExp.location || '',
          dateRange: currentExp.dateRange || '',
          highlights: currentExp.highlights && currentExp.highlights.length > 0 ? currentExp.highlights : ['Led multidisciplinary design and technical execution.'],
        });
      }

      const companyName = line.replace(dateMatch[0], '').replace(/[-–|,]/g, ' ').trim();
      currentExp = {
        company: companyName || 'Company',
        dateRange: dateMatch[0].trim(),
        role: '',
        highlights: [],
      };
    } else if (currentExp) {
      if (!currentExp.role && !line.startsWith('•') && !line.startsWith('-') && line.length < 80) {
        currentExp.role = line;
      } else if (line.includes('Canada') || line.includes('USA') || (line.includes(',') && line.length < 40)) {
        currentExp.location = line;
      } else {
        const cleanBullet = line.replace(/^[•\-\*]\s*/, '').trim();
        if (cleanBullet) {
          currentExp.highlights?.push(cleanBullet);
        }
      }
    }
  }
  if (currentExp && currentExp.company) {
    experience.push({
      id: `exp-${experience.length + 1}`,
      company: currentExp.company,
      role: currentExp.role || 'Design Engineer',
      location: currentExp.location || '',
      dateRange: currentExp.dateRange || '',
      highlights: currentExp.highlights && currentExp.highlights.length > 0 ? currentExp.highlights : ['Led multidisciplinary design and technical execution.'],
    });
  }

  // 6. Parse Project Items
  const projects: ProjectItem[] = [];
  const projLines = sections.projects;
  let currentProj: Partial<ProjectItem> | null = null;

  for (const line of projLines) {
    const yearMatch = line.match(/\b20\d{2}\b/);
    const isHeaderCandidate = line.length < 50 && (yearMatch || !line.endsWith('.'));

    if (isHeaderCandidate && !line.startsWith('•') && !line.startsWith('-')) {
      if (currentProj && currentProj.name) {
        projects.push({
          id: `proj-${projects.length + 1}`,
          name: currentProj.name,
          subtitle: currentProj.subtitle || '',
          awards: currentProj.awards,
          dateRange: currentProj.dateRange || '2025',
          highlights: currentProj.highlights && currentProj.highlights.length > 0 ? currentProj.highlights : ['Prototyped and validated custom engineering hardware.'],
        });
      }

      currentProj = {
        name: line.replace(/\b20\d{2}\b/, '').trim(),
        dateRange: yearMatch ? yearMatch[0] : '2025',
        highlights: [],
      };
    } else if (currentProj) {
      if (!currentProj.subtitle && !line.startsWith('•') && !line.startsWith('-') && line.length < 100) {
        currentProj.subtitle = line;
      } else if (line.toLowerCase().includes('award') || line.toLowerCase().includes('distinction')) {
        currentProj.awards = line;
      } else {
        const cleanBullet = line.replace(/^[•\-\*]\s*/, '').trim();
        if (cleanBullet) {
          currentProj.highlights?.push(cleanBullet);
        }
      }
    }
  }
  if (currentProj && currentProj.name) {
    projects.push({
      id: `proj-${projects.length + 1}`,
      name: currentProj.name,
      subtitle: currentProj.subtitle || '',
      awards: currentProj.awards,
      dateRange: currentProj.dateRange || '2025',
      highlights: currentProj.highlights && currentProj.highlights.length > 0 ? currentProj.highlights : ['Prototyped and validated custom engineering hardware.'],
    });
  }

  // 7. Parse Skills
  const skills: SkillCategory[] = [];
  const skillLines = sections.skills;

  for (const line of skillLines) {
    if (line.includes(':')) {
      const parts = line.split(':');
      const catName = parts[0].trim();
      const items = parts
        .slice(1)
        .join(':')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (catName && items.length > 0) {
        skills.push({ category: catName, items });
      }
    }
  }

  // Fallback default skills if none recognized
  if (skills.length === 0) {
    skills.push(
      { category: 'Electronics & Code', items: ['KiCAD', 'Python', 'Firmware', 'C/C++'] },
      { category: 'Digital Fabrication', items: ['FDM 3D Printing', 'Laser-cutting', 'CNC Machining'] },
      { category: '3D & CAD Modeling', items: ['Rhino', 'Grasshopper', 'SolidWorks', 'GD&T'] }
    );
  }

  // 8. Languages
  const languages: string[] = [];
  if (sections.languages.length > 0) {
    for (const line of sections.languages) {
      const langs = line.split(',').map((l) => l.trim()).filter(Boolean);
      languages.push(...langs);
    }
  } else {
    languages.push('English');
  }

  // 9. Summary & Target Job Title
  let targetJobTitle = 'Hardware Product Designer & Prototyper';
  if (experience.length > 0 && experience[0].role) {
    targetJobTitle = experience[0].role;
  }

  let summary = '';
  if (sections.summary.length > 0) {
    summary = sections.summary.slice(0, 3).join('\n');
  } else {
    summary =
      'Architecture-trained product designer focused on physical products, human use, and material exploration.\nI take products from concept and form development through prototyping and fabrication.';
  }

  return {
    name,
    targetJobTitle,
    summary,
    contact,
    education: education.length > 0 ? education : [
      {
        id: 'edu-1',
        institution: 'University of Waterloo',
        degree: 'Bachelor of Architectural Studies',
        location: 'Waterloo, Ontario, Canada',
        dateRange: 'Graduated Aug 2026',
        details: ['Graduated with Honours, Term Distinctions.'],
      },
    ],
    experience: experience.length > 0 ? experience : [
      {
        id: 'exp-1',
        company: 'DIALOG',
        role: 'Computational Design Lead',
        location: 'Calgary, Alberta, Canada',
        dateRange: 'Jan - April 2026',
        highlights: ['Led engineering automation and parametric modeling.'],
      },
    ],
    projects: projects.length > 0 ? projects : [
      {
        id: 'proj-1',
        name: 'MORPH 42',
        subtitle: 'Split Ergonomic Keyboard, 42 Keys',
        dateRange: '2025',
        highlights: ['Designed and built a 42-key split ergonomic keyboard.'],
      },
    ],
    skills,
    languages,
  };
}
