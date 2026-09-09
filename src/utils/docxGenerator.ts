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
 * Creates an ATS-compliant Word document (.docx) formatted strictly onto a SINGLE Letter size page.
 * Rules:
 * - 100% Black text on pure white background (no blue, green, or color tints)
 * - Single-column layout
 * - Strict 0.5" margins (720 twips) to fit comfortably on 1 Letter page
 * - Font: Calibri (9.5pt - 10pt for body, 16pt for name)
 * - Exact job title in header
 * - Standard section headers with clean black divider line
 */
export async function generateAtsDocx(resume: ResumeData): Promise<Blob> {
  const children: Paragraph[] = [];

  // Helper for section headings
  const createSectionHeader = (title: string) => {
    return new Paragraph({
      spacing: { before: 100, after: 30 },
      border: {
        bottom: {
          color: '000000',
          space: 2,
          style: BorderStyle.SINGLE,
          size: 4,
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 20, // 10pt
          font: 'Calibri',
          color: '000000',
        }),
      ],
    });
  };

  // 1. Candidate Name (Centered, Bold, Black)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 20 },
      children: [
        new TextRun({
          text: resume.name.toUpperCase(),
          bold: true,
          size: 32, // 16pt
          font: 'Calibri',
          color: '000000',
        }),
      ],
    })
  );

  // 2. Exact Target Job Title (Rule 2: 10.6x factor, Pure Black)
  if (resume.targetJobTitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 25 },
        children: [
          new TextRun({
            text: resume.targetJobTitle.toUpperCase(),
            bold: true,
            size: 21, // 10.5pt
            font: 'Calibri',
            color: '000000',
          }),
        ],
      })
    );
  }

  // 3. Contact Info (In body, separated by plain pipes, pure black)
  const contactParts: string[] = [];
  if (resume.contact.phone) contactParts.push(resume.contact.phone);
  if (resume.contact.email) contactParts.push(resume.contact.email);
  if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin);
  if (resume.contact.portfolio) contactParts.push(resume.contact.portfolio);

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: contactParts.join('  |  '),
          size: 18, // 9pt
          font: 'Calibri',
          color: '000000',
        }),
      ],
    })
  );

  // 4. Concise Summary / Positioning Statement
  if (resume.summary) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80, line: 230 },
        children: [
          new TextRun({
            text: resume.summary,
            size: 19, // 9.5pt
            font: 'Calibri',
            color: '000000',
          }),
        ],
      })
    );
  }

  // 5. Education
  if (resume.education && resume.education.length > 0) {
    children.push(createSectionHeader('Education'));

    resume.education.forEach((edu) => {
      children.push(
        new Paragraph({
          spacing: { before: 40, after: 15 },
          children: [
            new TextRun({
              text: edu.institution,
              bold: true,
              size: 19, // 9.5pt
              font: 'Calibri',
              color: '000000',
            }),
            new TextRun({
              text: ` — ${edu.degree}`,
              italics: true,
              size: 19,
              font: 'Calibri',
              color: '000000',
            }),
            new TextRun({
              text: `  (${edu.dateRange})`,
              bold: true,
              size: 19,
              font: 'Calibri',
              color: '000000',
            }),
          ],
        })
      );

      edu.details.forEach((detail) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 15, line: 220 },
            children: [
              new TextRun({
                text: detail,
                size: 18, // 9pt
                font: 'Calibri',
                color: '000000',
              }),
            ],
          })
        );
      });
    });
  }

  // 6. Selected Projects
  if (resume.projects && resume.projects.length > 0) {
    children.push(createSectionHeader('Projects'));

    resume.projects.forEach((proj) => {
      children.push(
        new Paragraph({
          spacing: { before: 50, after: 15 },
          children: [
            new TextRun({
              text: proj.name,
              bold: true,
              size: 19,
              font: 'Calibri',
              color: '000000',
            }),
            new TextRun({
              text: ` — ${proj.subtitle}`,
              italics: true,
              size: 18,
              font: 'Calibri',
              color: '000000',
            }),
            new TextRun({
              text: `  (${proj.dateRange})`,
              bold: true,
              size: 19,
              font: 'Calibri',
              color: '000000',
            }),
          ],
        })
      );

      if (proj.awards) {
        children.push(
          new Paragraph({
            spacing: { after: 15 },
            children: [
              new TextRun({
                text: `Awards: ${proj.awards}`,
                italics: true,
                size: 17,
                font: 'Calibri',
                color: '000000',
              }),
            ],
          })
        );
      }

      proj.highlights.forEach((bullet) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 15, line: 220 },
            children: [
              new TextRun({
                text: bullet,
                size: 18, // 9pt
                font: 'Calibri',
                color: '000000',
              }),
            ],
          })
        );
      });
    });
  }

  // 7. Professional Experience
  if (resume.experience && resume.experience.length > 0) {
    children.push(createSectionHeader('Professional Experience'));

    resume.experience.forEach((exp) => {
      children.push(
        new Paragraph({
          spacing: { before: 50, after: 15 },
          children: [
            new TextRun({
              text: exp.company,
              bold: true,
              size: 19,
              font: 'Calibri',
              color: '000000',
            }),
            new TextRun({
              text: ` — ${exp.role}, ${exp.location}`,
              italics: true,
              size: 18,
              font: 'Calibri',
              color: '000000',
            }),
            new TextRun({
              text: `  (${exp.dateRange})`,
              bold: true,
              size: 19,
              font: 'Calibri',
              color: '000000',
            }),
          ],
        })
      );

      exp.highlights.forEach((bullet) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 15, line: 220 },
            children: [
              new TextRun({
                text: bullet,
                size: 18, // 9pt
                font: 'Calibri',
                color: '000000',
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
          spacing: { after: 15, line: 220 },
          children: [
            new TextRun({
              text: `${skillGroup.category}: `,
              bold: true,
              size: 18,
              font: 'Calibri',
              color: '000000',
            }),
            new TextRun({
              text: skillGroup.items.join(', '),
              size: 18,
              font: 'Calibri',
              color: '000000',
            }),
          ],
        })
      );
    });

    if (resume.languages && resume.languages.length > 0) {
      children.push(
        new Paragraph({
          spacing: { after: 15, line: 220 },
          children: [
            new TextRun({
              text: 'Languages: ',
              bold: true,
              size: 18,
              font: 'Calibri',
              color: '000000',
            }),
            new TextRun({
              text: resume.languages.join(', '),
              size: 18,
              font: 'Calibri',
              color: '000000',
            }),
          ],
        })
      );
    }
  }

  // Single Letter Page configuration (8.5" x 11" with 0.5" margins = 720 twips)
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
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
