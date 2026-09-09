# ATS Resume Optimizer & Generator

A minimal, clean, and intuitive web application designed to eliminate the "pretty resume tax" and make candidate resumes 100% visible to Applicant Tracking Systems (ATS) like **Workday, Greenhouse, Lever, iCIMS, and Taleo**.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and native **`.docx` generation** using the `docx` library. Ready for 1-click deployment on **Vercel**.

---

## 🚀 Key Features

1. **Rule #2: The 10.6x Callback Matcher**
   - Resumes matching the exact job title from the job posting in their header/summary experience a **10.6x callback multiplier**.
   - The app automatically detects the posting's title and syncs it into the resume header.

2. **Rule #4: The 25–35 Keyword Sweet Spot Gauge**
   - Real-time keyword density meter.
   - Highlights under-indexed resumes (<25 keywords) and prevents AI keyword-stuffing penalties (>35 keywords).
   - **One-Click Auto-Align**: Intelligently weaves in missing job requirements into technical skills and bullet points.

3. **Rule #3: Single-Column Stream & Ligature Fixer**
   - Alex Li's original PDF suffered from font ligature corruptions (`workow` for workflow, `rm’s` for firm's, `ecient` for efficient, `Diusion` for Diffusion) and multi-column OCR interleaving.
   - All corrupt Unicode characters are sanitized to clean standard UTF-8.
   - Reconstructed as a strictly single-column layout with no tables, floating frames, or multi-column grids.

4. **Rule #5: Date Format Standardization**
   - Normalizes inconsistent dates into standard `Mon YYYY - Mon YYYY` (e.g. `Jan 2026 - Apr 2026`).

5. **Rule #6: Download as Native `.docx`**
   - Native Microsoft Word `.docx` generator formatted with standard Calibri typography, 0.75" margins, clean bullet points, and single-column flow.

6. **Full Forensic ATS Audit (Before vs After)**
   - Interactive diagnostic report scoring Alex Li's original PDF (42/100) vs the ATS-optimized version (98/100).

7. **Flexible Job Input**
   - Copy & paste job description.
   - Upload job description files (`.txt`, `.md`).
   - Quick test presets tailored to Alex Li's background:
     - *Hardware Product Designer*
     - *Senior Computational Design Specialist*
     - *AI Design Technologist*

---

## 💻 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the local development server**:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deploying to Vercel

This repository is built as a standard Next.js application with zero native binary dependencies or server-side file dependencies. It deploys out-of-the-box to Vercel:

### Method 1: Deploy via Vercel Dashboard (Recommended)
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete ATS resume optimizer webapp"
   git push origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your GitHub repository `ats-tool`.
4. Leave all default settings (Framework Preset: **Next.js**, Build Command: `npm run build`, Output Directory: `.next`).
5. Click **Deploy**.

### Method 2: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Document Generation**: `docx` (client-side native Word document builder)
- **Icons**: `lucide-react`
- **File Utilities**: `file-saver`
