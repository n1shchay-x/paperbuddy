import { QuestionPaper } from "@/types";
import styles from "./PrintView.module.css";

export default function PrintView({ paper }: { paper: QuestionPaper }) {
  // Collect all questions for the score table
  const allQuestions = paper.sections.flatMap(s => s.questions);
  // Get unique main question numbers, roughly. The image shows columns 1, 2, 3, 4, 5. 
  // We'll generate a dynamic table with up to 5 columns or however many main questions there are.
  const mainQuestions = Array.from(new Set(allQuestions.map(q => q.number.replace(/[^0-9]/g, '')))).filter(n => n !== "");
  const columns = mainQuestions.length > 0 ? mainQuestions : ["1", "2", "3", "4", "5"];

  return (
    <div className={styles.page}>
      
      {/* Header Block */}
      <div className={styles.headerBlock}>
        <div className={styles.logoPlaceholder}>Logo</div>
        <div className={styles.headerText}>
          <h1 className={styles.schoolName}>{paper.meta.schoolName}</h1>
          <div className={styles.subtitles}>
            <span className={styles.subtitleLeft}></span>
            <span className={styles.subtitleCenter}>{paper.meta.schoolSubtitle}</span>
            <span className={styles.subtitleRight}>{paper.meta.schoolMedium}</span>
          </div>
        </div>
      </div>

      {/* Meta Information */}
      <div className={styles.metaSection}>
        <div className={styles.metaRow}>
          <span>ધોરણ :- {paper.meta.standard}</span>
          <span>વર્ગ :- _________</span>
          <span>વિષય :- {paper.meta.subject}</span>
        </div>
        <div className={styles.metaRow}>
          <span>નામ :- _____________________________</span>
          <span>રોલ નં :- _________</span>
          <span>તારીખ :- {paper.meta.date}</span>
        </div>
      </div>

      {/* Score Table */}
      <table className={styles.scoreTable}>
        <thead>
          <tr>
            <th>પ્રશ્ન નં.</th>
            {columns.map(c => <th key={c}>{c}</th>)}
            <th>કુલ ગુણ</th>
            <th>{paper.meta.totalMarks}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ગુણ</td>
            {columns.map(c => <td key={`g-${c}`}></td>)}
            <td>મેળવેલ ગુણ</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* Signatures */}
      <div className={styles.signatures}>
        <span>નિરીક્ષકની સહી - _________________</span>
        <span>પરીક્ષકની સહી - _________________</span>
      </div>

      {/* Questions */}
      <div className={styles.content}>
        {paper.sections.map((section, sIdx) => (
          <div key={section.id} className={styles.section}>
            {/* We might not want to print "Section A" if the original paper doesn't have it, but we'll include it for clarity if present */}
            {section.title !== "General" && <div className={styles.sectionTitle}>{section.title}</div>}
            
            {section.questions.map((q, qIdx) => {
              // Parse text for table structures (lines with |)
              const textLines = q.text.split("\n");
              const hasTable = textLines.some(l => l.includes("|"));
              
              return (
                <div key={q.id} className={styles.questionBlock}>
                  <div className={styles.questionHeader}>
                    <div className={styles.questionText}>
                      પ્રશ્ન - {q.number}{" "}
                      {hasTable ? (
                        <div style={{ marginTop: "10px" }}>
                          {textLines.map((line, i) => {
                            if (line.includes("|")) {
                              const cells = line.split("|").map(c => c.trim());
                              return (
                                <div key={i} style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
                                  {cells.map((cell, j) => (
                                    <div key={j} style={{ flex: 1, padding: "4px", borderRight: j < cells.length - 1 ? "1px solid #ccc" : "none", fontWeight: i === 0 ? "bold" : "normal" }}>
                                      {cell}
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            return <div key={i}>{line}</div>;
                          })}
                        </div>
                      ) : (
                        q.text
                      )}
                    </div>
                    <div className={styles.questionMarks}>({String(q.marks).padStart(2, '0')})</div>
                  </div>

                {/* Answer Area based on type */}
                {q.type === "FILL_IN_BLANK" || q.type === "ONE_WORD" ? (
                  <div className={styles.answerLines}>
                    {/* Render a single line */}
                    <div className={styles.line}></div>
                  </div>
                ) : q.type === "DESCRIPTIVE" ? (
                  <div className={styles.answerLines}>
                    {Array.from({ length: q.linesRequired || 4 }).map((_, i) => (
                      <div key={i} className={styles.line}></div>
                    ))}
                  </div>
                ) : q.type === "MCQ" && q.options && q.options.length > 0 ? (
                  <div className={styles.options}>
                     {q.options.map((opt, i) => (
                       <span key={i} className={styles.optionItem}>{String.fromCharCode(65 + i)}. {opt.text}</span>
                     ))}
                  </div>
                ) : null}

              </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
