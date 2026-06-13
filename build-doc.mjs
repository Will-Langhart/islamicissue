import fs from "fs";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  TableOfContents, Header, Footer, PageNumber, LevelFormat, BorderStyle,
} from "docx";
import { parts, conclusionParas, bibliography, preface } from "./content/content.mjs";

// ---------- helpers ----------
const JUST = AlignmentType.JUSTIFIED;

function p(text, opts = {}) {
  return new Paragraph({
    alignment: JUST,
    spacing: { after: 160 },
    children: [new TextRun(text)],
    ...opts,
  });
}

function lead(label, text) {
  return new Paragraph({
    alignment: JUST,
    spacing: { before: 120, after: 160 },
    children: [
      new TextRun({ text: label + " ", bold: true }),
      new TextRun(text),
    ],
  });
}

function quote(text, ref) {
  const children = [new TextRun({ text: "“" + text + "”", italics: true })];
  if (ref) children.push(new TextRun({ text: "  — " + ref, italics: false, size: 20 }));
  return new Paragraph({
    alignment: JUST,
    spacing: { after: 160 },
    indent: { left: 720, right: 720 },
    children,
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    alignment: JUST,
    spacing: { after: 80 },
    children: [new TextRun(text)],
  });
}

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun(text)] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
}

function renderBlock(out, label, entries) {
  entries.forEach((e, i) => {
    if (typeof e === "string") {
      if (i === 0) out.push(lead(label + ".", e));
      else out.push(p(e));
    } else if (e.q) {
      out.push(quote(e.q, e.ref));
    } else if (e.b) {
      e.b.forEach((item) => out.push(bullet(item)));
    }
  });
}

function renderItem(out, idx, item) {
  out.push(h2(idx + ". " + item.title));
  renderBlock(out, "The Critique", item.critique);
  if (item.response) renderBlock(out, "Common Muslim Responses", item.response);
  if (item.rebuttal) renderBlock(out, "Counter-Rebuttal", item.rebuttal);
}

// ---------- build ----------

const children = [];

// Title page
children.push(new Paragraph({ spacing: { before: 2400, after: 240 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Examining Islam from Within", bold: true, size: 56 })] }));
children.push(new Paragraph({ spacing: { after: 240 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "A Comprehensive Compendium of Internal Critiques", size: 32 })] }));
children.push(new Paragraph({ spacing: { after: 1200 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Contradictions, Textual History, and Truth-Claims — with Muslim Responses and Counter-Rebuttals", italics: true, size: 24 })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Compiled June 2026", size: 22 })] }));

// TOC
children.push(new Paragraph({ pageBreakBefore: true, heading: HeadingLevel.HEADING_1, children: [new TextRun("Table of Contents")] }));
children.push(new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }));

// Preface
children.push(h1("Preface: Method and Scope"));
preface.forEach((t) => children.push(p(t)));

// Parts
parts.forEach((part) => {
  children.push(h1(part.title));
  part.intro.forEach((t) => children.push(p(t)));
  part.items.forEach((item, i) => renderItem(children, i + 1, item));
});

// Conclusion
children.push(h1("Conclusion: The Cumulative Case"));
conclusionParas.forEach((t) => children.push(p(t)));

// Bibliography
children.push(h1("Sources and Further Reading"));
bibliography.forEach((t) => children.push(bullet(t)));

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Georgia", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Georgia", color: "1F3864" },
        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Georgia", color: "2E5395" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  features: { updateFields: true },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "999999", space: 2 } },
        children: [new TextRun({ text: "Examining Islam from Within — Internal Critiques Compendium", italics: true, size: 18, color: "666666" })],
      })] }),
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Page ", size: 18 }),
          new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
          new TextRun({ text: " of ", size: 18 }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
        ],
      })] }),
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("Examining-Islam-from-Within.docx", buffer);
  console.log("Written:", buffer.length, "bytes");
});
