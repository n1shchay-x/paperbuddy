import { QuestionPaper } from "@/types";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, HeadingLevel } from "docx";

export const generateWordDoc = async (paper: QuestionPaper): Promise<Blob> => {
  const allQuestions = paper.sections.flatMap(s => s.questions);
  const mainQuestions = Array.from(new Set(allQuestions.map(q => q.number.replace(/[^0-9]/g, '')))).filter(n => n !== "");
  const columns = mainQuestions.length > 0 ? mainQuestions : ["1", "2", "3", "4", "5"];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Nirmala UI", // Best support for Gujarati/Hindi on Windows
            size: 22, // 11pt
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: "1cm",
              right: "1cm",
              bottom: "1cm",
              left: "1cm",
            },
          },
        },
        children: [
          // Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: paper.meta.schoolName,
                bold: true,
                size: 32, // 16pt
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${paper.meta.schoolSubtitle} | ${paper.meta.schoolMedium}`,
                size: 24, // 12pt
              }),
            ],
          }),
          new Paragraph({ text: "" }), // Spacing

          // Meta Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "auto" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
              left: { style: BorderStyle.NONE, size: 0, color: "auto" },
              right: { style: BorderStyle.NONE, size: 0, color: "auto" },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(`ધોરણ :- ${paper.meta.standard}`)] }),
                  new TableCell({ children: [new Paragraph(`વર્ગ :- _________`)] }),
                  new TableCell({ children: [new Paragraph(`વિષય :- ${paper.meta.subject}`)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(`નામ :- _____________________________`)] }),
                  new TableCell({ children: [new Paragraph(`રોલ નં :- _________`)] }),
                  new TableCell({ children: [new Paragraph(`તારીખ :- ${paper.meta.date}`)] }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }), // Spacing

          // Score Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "પ્રશ્ન નં.", alignment: AlignmentType.CENTER })] }),
                  ...columns.map(c => new TableCell({ children: [new Paragraph({ text: c, alignment: AlignmentType.CENTER })] })),
                  new TableCell({ children: [new Paragraph({ text: "કુલ ગુણ", alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph({ text: String(paper.meta.totalMarks), alignment: AlignmentType.CENTER })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "ગુણ", alignment: AlignmentType.CENTER })] }),
                  ...columns.map(() => new TableCell({ children: [new Paragraph("")] })),
                  new TableCell({ children: [new Paragraph({ text: "મેળવેલ ગુણ", alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [new Paragraph("")] }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }), // Spacing

          // Signatures
          new Paragraph({
            children: [
              new TextRun({ text: "નિરીક્ષકની સહી - _________________\t\t\t\t\t\t\t\t" }),
              new TextRun({ text: "પરીક્ષકની સહી - _________________" }),
            ],
          }),
          new Paragraph({ text: "" }), // Spacing

          // Sections and Questions
          ...paper.sections.flatMap(section => {
            const sectionElements = [];
            
            if (section.title !== "General") {
              sectionElements.push(
                new Paragraph({
                  text: section.title,
                  heading: HeadingLevel.HEADING_2,
                  alignment: AlignmentType.CENTER,
                })
              );
            }

            section.questions.forEach(q => {
              // Parse newlines in question text
              const textLines = q.text.split("\n");
              const textRuns = textLines.map((line, i) => new TextRun({ text: line, break: i > 0 ? 1 : 0 }));

              // Question Header
              sectionElements.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: `પ્રશ્ન - ${q.number} `, bold: true }),
                    ...textRuns,
                    new TextRun({ text: `\t\t(${String(q.marks).padStart(2, '0')})`, bold: true }), // Marks aligned right-ish
                  ],
                })
              );

              // Answer space based on type
              if (q.type === "FILL_IN_BLANK" || q.type === "ONE_WORD") {
                sectionElements.push(new Paragraph({ text: "____________________________________________________________" }));
              } else if (q.type === "DESCRIPTIVE") {
                const lines = q.linesRequired || 4;
                for (let i = 0; i < lines; i++) {
                  sectionElements.push(new Paragraph({ text: "____________________________________________________________________________________" }));
                }
              } else if (q.type === "MCQ" && q.options && q.options.length > 0) {
                const optionsText = q.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt.text}`).join("    ");
                sectionElements.push(new Paragraph({ text: `   ${optionsText}` }));
              }
              
              sectionElements.push(new Paragraph({ text: "" })); // Spacing between questions
            });

            return sectionElements;
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
};
