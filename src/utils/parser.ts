import { PaperMeta, QuestionPaper, Section, Question, QuestionType, QuestionOption } from "@/types";

export function parseRawText(text: string): QuestionPaper {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const meta: PaperMeta = {
    standard: "",
    subject: "",
    chapter: "",
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
    totalMarks: 20,
    schoolName: "પુષ્ટિસંસ્કાર સ્કૂલ",
    schoolSubtitle: "મૂલ્યાંકન કસોટી",
    schoolMedium: "ગુજરાતી માધ્યમ"
  };

  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let currentQuestion: Question | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Meta extraction
    if (line.toUpperCase().startsWith("STD")) {
      meta.standard = line.replace(/STD\s*[-=:]?\s*/i, "").trim();
      continue;
    }
    if (line.toLowerCase().startsWith("ch-") || line.toLowerCase().startsWith("chapter")) {
      meta.chapter = line.replace(/ch[-=:]?\s*/i, "").trim();
      continue;
    }

    // Section extraction
    if (line.toLowerCase().includes("section")) {
      const titleMatch = line.match(/Section\s*[-=:]?\s*([A-Z])/i);
      const title = titleMatch ? `Section - ${titleMatch[1]}` : line;
      currentSection = {
        id: crypto.randomUUID(),
        title: title,
        questions: []
      };
      sections.push(currentSection);
      continue;
    }

    // Question extraction (e.g., Q-1(अ) or Q- 2(अ))
    const qMatch = line.match(/^Q[-.\s]*(\d+(?:\([^)]+\))?)(.*?)(?:\(([\d]+)\))?$/i);
    if (qMatch) {
      const qNum = qMatch[1].trim();
      const qText = qMatch[2].replace(/^[-.\s]+/, '').trim();
      const marks = qMatch[3] ? parseInt(qMatch[3], 10) : 0;

      // Guess question type based on text
      let type: QuestionType = "DESCRIPTIVE";
      if (qText.includes("विकल्प") || qText.includes("સાચો શબ્દ") || qText.includes("choose")) type = "MCQ";
      if (qText.includes("रिक्त स्थान") || qText.includes("ખાલી જગ્યા") || qText.includes("ખૂટતા")) type = "FILL_IN_BLANK";
      if (qText.includes("એક શબ્દ") || qText.includes("समानार्थी") || qText.includes("विरुद्धार्थी")) type = "ONE_WORD";
      if (qText.includes("જોડકા") || qText.includes("છૂટા પાડો")) type = "MATCH";
      if (qText.includes("નિબંધ") || qText.includes("निबंध") || qText.includes("essay")) {
        type = "DESCRIPTIVE";
      }

      currentQuestion = {
        id: crypto.randomUUID(),
        number: qNum,
        text: qText,
        marks: marks,
        type: type,
        options: [],
        linesRequired: type === "DESCRIPTIVE" && qText.includes("નિબંધ") ? 8 : 2
      };

      if (!currentSection) {
        currentSection = { id: crypto.randomUUID(), title: "General", questions: [] };
        sections.push(currentSection);
      }
      currentSection.questions.push(currentQuestion);
      continue;
    }

    // Sub-questions or Options
    // Check if line starts with 1. 2. A. B. (A)
    const subQMatch = line.match(/^(\d+|\([A-Z]\)|[A-Z]\.)\s*(.*)/i);
    if (subQMatch && currentQuestion) {
       // Could be a subquestion inside a main question
       // If the main question was MCQ and options are on the same line or next line:
       if (currentQuestion.type === "MCQ") {
         // Usually options are inline: (A) Option (B) Option
         const optionsMatch = line.match(/\([A-D]\)[^()]+/g) || line.match(/[A-D]\.\s[^A-D]+/g);
         if (optionsMatch && optionsMatch.length > 1) {
            optionsMatch.forEach(opt => {
                let isCorrect = opt.includes('✓');
                currentQuestion!.options!.push({
                    text: opt.replace(/✓/g, '').trim(),
                    isCorrect
                });
            });
            continue;
         }
       }
       
       // Otherwise treat it as a subquestion item
       // We'll append it to the current question's text if it's not a generic MCQ options line
       // For simple parse, we'll convert it to a sub-item in text
       if (!line.startsWith("(")) {
           // We might need to handle this as a separate question or append to current text
           currentQuestion.text += "\n" + line;
       }
    } else if (currentQuestion && line.startsWith("(")) {
        // Likely answer in brackets e.g. ( *रंग* )
        currentQuestion.answer = line.replace(/^\(\s*\*/, '').replace(/\*\s*\)$/, '').trim();
    }
  }

  // Calculate total marks if missing
  if (meta.totalMarks === 0) {
      meta.totalMarks = sections.reduce((acc, sec) => acc + sec.questions.reduce((qAcc, q) => qAcc + q.marks, 0), 0);
  }

  return { meta, sections };
}
