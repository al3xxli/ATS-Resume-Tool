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

export type AllowedFont = 'Calibri' | 'Arial' | 'Times New Roman';

/**
 * Creates an ATS-compliant Word document (.docx) adhering to professional styling guidelines:
 * - Classic, professional font (Calibri, Arial, or Times New Roman)
 * - Headings: 12pt bold for clear hierarchy
 * - Body / Bullets: 10pt font for comfortable readability and white space
 * - Margins: 0.7" (1008 twips) for balanced, clean layout without overcrowding
 * - Line Spacing: 1.15 (line: 276)
 * - Strict 1-page Letter fit
 * - 100% Black text on pure white background
 * - Consistent styling across all similar elements
 */
export async function generateAtsDocx(
  resume: ResumeData,
  fontFamily: AllowedFont = 'Calibri'
): Promise<Blob> {
  const children: Paragraph[] = [];

  // Helper for section headings (12pt Bold Uppercase with bottom border)
  const createSectionHeader = (title: string) => {
    return new Paragraph({
      spacing: { before: 120, after: 40 },
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
          size: 24, // 12pt
          font: fontFamily,
          color: '000000',
        }),
      ],
    });
  };

  // 1. Candidate Name (Centered, 18pt Bold, Black)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 20 },
      children: [
        new TextRun({
          text: resume.name.toUpperCase(),
          bold: true,
          size: 36, // 18pt
          font: fontFamily,
          color: '000000',
        }),
      ],
    })
  );

  // 2. Exact Target Job Title (12pt Bold, Black, Rule #2)
  if (resume.targetJobTitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 30 },
        children: [
          new TextRun({
            text: resume.targetJobTitle.toUpperCase(),
            bold: true,
            size: 24, // 12pt
            font: fontFamily,
            color: '000000',
          }),
        ],
      })
    );
  }

  // 3. Contact Info (10pt, centered, pipe-separated)
  const contactParts: string[] = [];
  if (resume.contact.phone) contactParts.push(resume.contact.phone);
  if (resume.contact.email) contactParts.push(resume.contact.email);
  if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin);
  if (resume.contact.portfolio) contactParts.push(resume.contact.portfolio);
  if (resume.contact.location) contactParts.push(resume.contact.location);

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: contactParts.join('  |  '),
          size: 20, // 10pt
          font: fontFamily,
          color: '000000',
        }),
      ],
    })
  );

  // 4. Concise Summary / Positioning Statement (10pt, 1.15 line spacing, line-sensitive)
  if (resume.summary) {
    const summaryLines = resume.summary.split('\n');
    const summaryChildren: TextRun[] = [];

    summaryLines.forEach((lineText, idx) => {
      if (idx > 0) {
        summaryChildren.push(new TextRun({ break: 1 }));
      }
      summaryChildren.push(
        new TextRun({
          text: lineText,
          size: 20, // 10pt
          font: fontFamily,
          color: '000000',
        })
      );
    });

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80, line: 276 },
        children: summaryChildren,
      })
    );
  }

  // 5. Education
  if (resume.education && resume.education.length > 0) {
    children.push(createSectionHeader('Education'));

    resume.education.forEach((edu) => {
      children.push(
        new Paragraph({
          spacing: { before: 50, after: 15 },
          children: [
            new TextRun({
              text: edu.institution,
              bold: true,
              size: 21, // 10.5pt
              font: fontFamily,
              color: '000000',
            }),
            new TextRun({
              text: ` — ${edu.degree}`,
              italics: true,
              size: 20, // 10pt
              font: fontFamily,
              color: '000000',
            }),
            new TextRun({
              text: `  (${edu.dateRange})`,
              size: 20, // 10pt
              font: fontFamily,
              color: '000000',
            }),
          ],
        })
      );

      edu.details.forEach((detail) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 15, line: 276 },
            children: [
              new TextRun({
                text: detail,
                size: 20, // 10pt
                font: fontFamily,
                color: '000000',
              }),
            ],
          })
        );
      });
    });
  }

  // 6. Projects
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
              size: 21, // 10.5pt
              font: fontFamily,
              color: '000000',
            }),
            new TextRun({
              text: ` — ${proj.subtitle}`,
              italics: true,
              size: 20, // 10pt
              font: fontFamily,
              color: '000000',
            }),
            new TextRun({
              text: `  (${proj.dateRange})`,
              size: 20, // 10pt
              font: fontFamily,
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
                size: 19, // 9.5pt
                font: fontFamily,
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
            spacing: { after: 15, line: 276 },
            children: [
              new TextRun({
                text: bullet,
                size: 20, // 10pt
                font: fontFamily,
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
              size: 21, // 10.5pt
              font: fontFamily,
              color: '000000',
            }),
            new TextRun({
              text: ` — ${exp.role}, ${exp.location}`,
              italics: true,
              size: 20, // 10pt
              font: fontFamily,
              color: '000000',
            }),
            new TextRun({
              text: `  (${exp.dateRange})`,
              size: 20, // 10pt
              font: fontFamily,
              color: '000000',
            }),
          ],
        })
      );

      exp.highlights.forEach((bullet) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 15, line: 276 },
            children: [
              new TextRun({
                text: bullet,
                size: 20, // 10pt
                font: fontFamily,
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
          spacing: { after: 15, line: 276 },
          children: [
            new TextRun({
              text: `${skillGroup.category}: `,
              bold: true,
              size: 20, // 10pt
              font: fontFamily,
              color: '000000',
            }),
            new TextRun({
              text: skillGroup.items.join(', '),
              size: 20, // 10pt
              font: fontFamily,
              color: '000000',
            }),
          ],
        })
      );
    });

    if (resume.languages && resume.languages.length > 0) {
      children.push(
        new Paragraph({
          spacing: { after: 15, line: 276 },
          children: [
            new TextRun({
              text: 'Languages: ',
              bold: true,
              size: 20, // 10pt
              font: fontFamily,
              color: '000000',
            }),
            new TextRun({
              text: resume.languages.join(', '),
              size: 20, // 10pt
              font: fontFamily,
              color: '000000',
            }),
          ],
        })
      );
    }
  }

  // Single Letter Page configuration: 8.5" x 11" with balanced 0.7" margins (1008 twips)
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1008,
              right: 1008,
              bottom: 1008,
              left: 1008,
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
export async function downloadAtsDocx(
  resume: ResumeData,
  fontFamily: AllowedFont = 'Calibri',
  filename?: string
) {
  const blob = await generateAtsDocx(resume, fontFamily);
  const cleanTitle = (resume.targetJobTitle || 'Resume')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();
  const nameSlug = resume.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const actualFilename = filename || `${nameSlug}_${cleanTitle}_ats.docx`;

  saveAs(blob, actualFilename);
}
