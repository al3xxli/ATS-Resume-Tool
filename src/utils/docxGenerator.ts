import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import { ResumeData } from '@/types/resume';

/**
 * Creates an ATS-compliant Word document (.docx).
 * Rules followed:
 * - Single-column layout (no tables or frames)
 * - Standard 0.75" (1080 twips) margins
 * - Standard ATS font: Calibri
 * - Exact job title in header
 * - Standard section headers
 * - Clean native bullet points
 * - Contact info in body
 */
export async function generateAtsDocx(resume: ResumeData): Promise<Blob> {
  const children: Paragraph[] = [];

  // Helper for section headings
  const createSectionHeader = (title: string) => {
    return new Paragraph({
      spacing: { before: 240, after: 120 },
      border: {
        bottom: {
          color: '333333',
          space: 3,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 22, // 11pt
          font: 'Calibri',
          color: '111111',
        }),
      ],
    });
  };

  // 1. Candidate Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: resume.name.toUpperCase(),
          bold: true,
          size: 36, // 18pt
          font: 'Calibri',
          color: '111111',
        }),
      ],
    })
  );

  // 2. Exact Target Job Title (10.6x callback multiplier)
  if (resume.targetJobTitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: resume.targetJobTitle.toUpperCase(),
            bold: true,
            size: 24, // 12pt
            font: 'Calibri',
            color: '2563EB', // subtle clean blue
          }),
        ],
      })
    );
  }

  // 3. Contact Info (In body, separated by plain pipes)
  const contactParts: string[] = [];
  if (resume.contact.phone) contactParts.push(resume.contact.phone);
  if (resume.contact.email) contactParts.push(resume.contact.email);
  if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin);
  if (resume.contact.portfolio) contactParts.push(resume.contact.portfolio);
  if (resume.contact.location) contactParts.push(resume.contact.location);

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: contactParts.join('  |  '),
          size: 19, // 9.5pt
          font: 'Calibri',
          color: '444444',
        }),
      ],
    })
  );

  // 4. Summary Statement
  if (resume.summary) {
    children.push(createSectionHeader('Professional Summary'));
    children.push(
      new Paragraph({
        spacing: { after: 160, line: 260 },
        children: [
          new TextRun({
            text: resume.summary,
            size: 21, // 10.5pt
            font: 'Calibri',
            color: '222222',
          }),
        ],
      })
    );
  }

  // 5. Professional Experience
  if (resume.experience && resume.experience.length > 0) {
    children.push(createSectionHeader('Professional Experience'));

    resume.experience.forEach((exp) => {
      // Company & Location / Date line
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: exp.company,
              bold: true,
              size: 21,
              font: 'Calibri',
              color: '111111',
            }),
            new TextRun({
              text: ` — ${exp.location}`,
              italics: true,
              size: 20,
              font: 'Calibri',
              color: '555555',
            }),
            new TextRun({
              text: `  (${exp.dateRange})`,
              bold: true,
              size: 20,
              font: 'Calibri',
              color: '333333',
            }),
          ],
        })
      );

      // Role Title
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: exp.role,
              italics: true,
              bold: true,
              size: 20,
              font: 'Calibri',
              color: '2563EB',
            }),
          ],
        })
      );

      // Bullet points
      exp.highlights.forEach((bullet) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60, line: 250 },
            children: [
              new TextRun({
                text: bullet,
                size: 20,
                font: 'Calibri',
                color: '222222',
              }),
            ],
          })
        );
      });
    });
  }

  // 6. Selected Projects
  if (resume.projects && resume.projects.length > 0) {
    children.push(createSectionHeader('Technical & Design Projects'));

    resume.projects.forEach((proj) => {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: proj.name,
              bold: true,
              size: 21,
              font: 'Calibri',
              color: '111111',
            }),
            new TextRun({
              text: `  (${proj.dateRange})`,
              bold: true,
              size: 20,
              font: 'Calibri',
              color: '333333',
            }),
          ],
        })
      );

      if (proj.subtitle) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: proj.subtitle,
                italics: true,
                size: 20,
                font: 'Calibri',
                color: '444444',
              }),
            ],
          })
        );
      }

      if (proj.awards) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: `Awards & Recognition: ${proj.awards}`,
                size: 19,
                font: 'Calibri',
                color: '059669', // subtle green
              }),
            ],
          })
        );
      }

      proj.highlights.forEach((bullet) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60, line: 250 },
            children: [
              new TextRun({
                text: bullet,
                size: 20,
                font: 'Calibri',
                color: '222222',
              }),
            ],
          })
        );
      });
    });
  }

  // 7. Education
  if (resume.education && resume.education.length > 0) {
    children.push(createSectionHeader('Education'));

    resume.education.forEach((edu) => {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: edu.institution,
              bold: true,
              size: 21,
              font: 'Calibri',
              color: '111111',
            }),
            new TextRun({
              text: `  (${edu.dateRange})`,
              bold: true,
              size: 20,
              font: 'Calibri',
              color: '333333',
            }),
          ],
        })
      );

      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: edu.degree,
              italics: true,
              size: 20,
              font: 'Calibri',
              color: '2563EB',
            }),
          ],
        })
      );

      edu.details.forEach((detail) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40, line: 250 },
            children: [
              new TextRun({
                text: detail,
                size: 20,
                font: 'Calibri',
                color: '333333',
              }),
            ],
          })
        );
      });
    });
  }

  // 8. Technical Skills
  if (resume.skills && resume.skills.length > 0) {
    children.push(createSectionHeader('Technical Skills'));

    resume.skills.forEach((skillGroup) => {
      children.push(
        new Paragraph({
          spacing: { after: 50, line: 250 },
          children: [
            new TextRun({
              text: `${skillGroup.category}: `,
              bold: true,
              size: 20,
              font: 'Calibri',
              color: '111111',
            }),
            new TextRun({
              text: skillGroup.items.join(', '),
              size: 20,
              font: 'Calibri',
              color: '333333',
            }),
          ],
        })
      );
    });

    if (resume.languages && resume.languages.length > 0) {
      children.push(
        new Paragraph({
          spacing: { before: 60, after: 50 },
          children: [
            new TextRun({
              text: 'Languages: ',
              bold: true,
              size: 20,
              font: 'Calibri',
              color: '111111',
            }),
            new TextRun({
              text: resume.languages.join(', '),
              size: 20,
              font: 'Calibri',
              color: '333333',
            }),
          ],
        })
      );
    }
  }

  // Document setup with 0.75 inch margins (1080 twips)
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1080,
              right: 1080,
              bottom: 1080,
              left: 1080,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Convenience helper to download the resume directly as a .docx file.
 */
export async function downloadAtsDocx(resume: ResumeData, filename?: string) {
  const blob = await generateAtsDocx(resume);
  const cleanTitle = (resume.targetJobTitle || 'Resume')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();
  const nameSlug = resume.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const actualFilename = filename || `${nameSlug}_${cleanTitle}_ats.docx`;

  saveAs(blob, actualFilename);
}
