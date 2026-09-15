import { ResumeData } from '@/types/resume';

export function generateAtsPlainText(resume: ResumeData): string {
  const lines: string[] = [];

  // Name & Target Title
  lines.push(resume.name.toUpperCase());
  if (resume.targetJobTitle) {
    lines.push(resume.targetJobTitle.toUpperCase());
  }
  lines.push('');

  // Contact
  const contactParts: string[] = [];
  if (resume.contact.phone) contactParts.push(resume.contact.phone);
  if (resume.contact.email) contactParts.push(resume.contact.email);
  if (resume.contact.portfolio) contactParts.push(resume.contact.portfolio);
  if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin);
  if (resume.contact.location) contactParts.push(resume.contact.location);
  lines.push(contactParts.join(' | '));
  lines.push('');

  // Summary
  if (resume.summary) {
    lines.push('PROFESSIONAL SUMMARY');
    lines.push(resume.summary);
    lines.push('');
  }

  // Experience
  if (resume.experience.length > 0) {
    lines.push('PROFESSIONAL EXPERIENCE');
    resume.experience.forEach((exp) => {
      lines.push(`${exp.company} - ${exp.location}`);
      lines.push(`${exp.role} (${exp.dateRange})`);
      exp.highlights.forEach((h) => lines.push(`- ${h}`));
      lines.push('');
    });
  }

  // Projects
  if (resume.projects.length > 0) {
    lines.push('TECHNICAL & DESIGN PROJECTS');
    resume.projects.forEach((proj) => {
      lines.push(`${proj.name} (${proj.dateRange})`);
      if (proj.subtitle) lines.push(proj.subtitle);
      if (proj.awards) lines.push(`Awards: ${proj.awards}`);
      proj.highlights.forEach((h) => lines.push(`- ${h}`));
      lines.push('');
    });
  }

  // Education
  if (resume.education.length > 0) {
    lines.push('EDUCATION');
    resume.education.forEach((edu) => {
      lines.push(`${edu.institution} (${edu.dateRange})`);
      lines.push(edu.degree);
      edu.details.forEach((d) => lines.push(`- ${d}`));
      lines.push('');
    });
  }

  // Skills
  if (resume.skills.length > 0) {
    lines.push('TECHNICAL SKILLS');
    resume.skills.forEach((cat) => {
      lines.push(`${cat.category}: ${cat.items.join(', ')}`);
    });
    if (resume.languages.length > 0) {
      lines.push(`Languages: ${resume.languages.join(', ')}`);
    }
  }

  return lines.join('\n');
}
