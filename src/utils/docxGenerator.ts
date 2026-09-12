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
 * Computes smart vertical spacing parameters based on content density:
 * Ensures the resume fills the Letter page gracefully to avoid a large bottom gap
 * (bottom space strictly no more than 1/10th of the 11in page),
 * while dynamically scaling to guarantee it never overflows onto page 2.
 */
function calculateSmartSpacing(resume: ResumeData) {
  // Count total bullet points and entries
  const eduBullets = resume.education.reduce((acc, e) => acc + e.details.length, 0);
  const projBullets = resume.projects.reduce((acc, p) => acc + p.highlights.length, 0);
  const expBullets = resume.experience.reduce((acc, e) => acc + e.highlights.length, 0);
  const skillsCount = resume.skills.length + (resume.languages.length > 0 ? 1 : 0);
  const totalItems =
    resume.education.length +
    resume.projects.length +
    resume.experience.length +
    eduBullets +
    projBullets +
    expBullets +
    skillsCount;

  // If content is concise (e.g. <= 30 elements), evenly distribute spacing across sections and sub-sections
  if (totalItems <= 26) {
    return {
      topMargin: 864, // 0.6 in
      bottomMargin: 864, // 0.6 in
      sideMargin: 936, // 0.65 in
      lineSpacing: 300, // ~1.25 line spacing
      nameAfter: 50,
      titleAfter: 60,
      contactAfter: 110,
      summaryAfter: 160,
      sectionBefore: 220, // 11pt before section header
      sectionAfter: 60,
      itemBefore: 180, // 9pt before each sub-section for even rhythm
      itemAfter: 35,
      bulletAfter: 55,
      skillAfter: 55,
    };
  } else if (totalItems <= 32) {
    return {
      topMargin: 864,
      bottomMargin: 864,
      sideMargin: 936,
      lineSpacing: 285,
      nameAfter: 40,
      titleAfter: 50,
      contactAfter: 90,
      summaryAfter: 140,
      sectionBefore: 180,
      sectionAfter: 50,
      itemBefore: 140,
      itemAfter: 30,
      bulletAfter: 40,
      skillAfter: 40,
    };
  } else {
    // Dense content: compact spacing to protect 1-page boundary
    return {
      topMargin: 720, // 0.5 in
      bottomMargin: 720,
      sideMargin: 864, // 0.6 in
      lineSpacing: 276, // 1.15 line spacing
      nameAfter: 30,
      titleAfter: 40,
      contactAfter: 80,
      summaryAfter: 120,
      sectionBefore: 160,
      sectionAfter: 50,
      itemBefore: 90,
      itemAfter: 25,
      bulletAfter: 30,
      skillAfter: 30,
    };
  }
}

/**
 * Creates an ATS-compliant Word document (.docx) adhering to styling guidelines with smart spacing:
 * - Fills the page to avoid a large bottom gap (bottom margin <= 1/10th page)
 * - Strict 1-page Letter fit
 * - Classic, professional font (Calibri, Arial, or Times New Roman)
 * - 12pt bold section headings
 * - 10pt body text & bullets
 * - 100% Black text on pure white background
 */
export async function generateAtsDocx(
  resume: ResumeData,
  fontFamily: AllowedFont = 'Calibri'
): Promise<Blob> {
  const children: Paragraph[] = [];
  const spacing = calculateSmartSpacing(resume);

  // Helper for section headings (12pt Bold Uppercase with bottom border)
  const createSectionHeader = (title: string) => {
    return new Paragraph({
      spacing: { before: spacing.sectionBefore, after: spacing.sectionAfter },
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
      spacing: { before: 0, after: spacing.nameAfter },
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
        spacing: { after: spacing.titleAfter },
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
      spacing: { after: spacing.contactAfter },
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

  // 4. Concise Summary / Positioning Statement (10pt, line-sensitive)
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
        spacing: { after: spacing.summaryAfter, line: spacing.lineSpacing },
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
          spacing: { before: spacing.itemBefore, after: spacing.itemAfter },
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
            spacing: { after: spacing.bulletAfter, line: spacing.lineSpacing },
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
          spacing: { before: spacing.itemBefore, after: spacing.itemAfter },
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
            spacing: { after: spacing.itemAfter },
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
            spacing: { after: spacing.bulletAfter, line: spacing.lineSpacing },
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
          spacing: { before: spacing.itemBefore, after: spacing.itemAfter },
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
            spacing: { after: spacing.bulletAfter, line: spacing.lineSpacing },
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
          spacing: { after: spacing.skillAfter, line: spacing.lineSpacing },
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
          spacing: { after: spacing.skillAfter, line: spacing.lineSpacing },
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

  // Single Letter Page configuration with Smart Spacing
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: spacing.topMargin,
              right: spacing.sideMargin,
              bottom: spacing.bottomMargin,
              left: spacing.sideMargin,
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
