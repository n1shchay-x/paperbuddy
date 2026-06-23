"use client";

import { useState } from "react";
import { QuestionPaper } from "@/types";
import { parseRawText } from "@/utils/parser";
import styles from "./page.module.css";
import { FileText, Download, Printer } from "lucide-react";
import PrintView from "@/components/PrintView";
import { generateWordDoc } from "@/utils/docxGenerator";

export default function Home() {
  const [rawText, setRawText] = useState("");
  const [paper, setPaper] = useState<QuestionPaper | null>(null);

  const handleParse = () => {
    if (!rawText.trim()) return;
    const parsed = parseRawText(rawText);
    setPaper(parsed);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!paper) return;
    try {
      // @ts-ignore
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("print-view-container");
      if (!element) return;
      const opt = {
        margin:       10,
        filename:     `QuestionPaper_${paper.meta.standard}_${paper.meta.subject}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error(e);
      alert("Failed to download PDF directly. Please use 'Print to PDF' instead.");
    }
  };

  const handleWordExport = async () => {
    if (!paper) return;
    const blob = await generateWordDoc(paper);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QuestionPaper_${paper.meta.standard}_${paper.meta.subject}.docx`;
    a.click();
  };

  return (
    <>
      <div className={`${styles.container} no-print`}>
        <header className={styles.header}>
          <h1 className={styles.title}>PaperBuddy</h1>
          <p className={styles.subtitle}>S-Tier Document Generation Engine</p>
        </header>

        <div className={styles.grid}>
          {/* Left Panel: Smart Paste */}
          <section className={styles.panel}>
            <div className={styles.panelTitle}>
              <span>Smart Paste Data</span>
              <FileText size={20} />
            </div>
            <textarea 
              className={styles.textarea} 
              placeholder="Paste the raw WhatsApp message here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            <button className={styles.btn} onClick={handleParse}>
              Extract & Build Form
            </button>
          </section>

          {/* Right Panel: Manual Review Form */}
          <section className={styles.panel}>
            <div className={styles.panelTitle}>
              <span>Document Structure Review</span>
            </div>
            
            {!paper ? (
              <div style={{ color: "var(--muted-foreground)", padding: "40px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius)" }}>
                Awaiting Data Extraction...
              </div>
            ) : (
              <>
                {/* Meta Editor */}
                <div className={styles.metaGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Standard</label>
                    <input className={styles.input} value={paper.meta.standard} onChange={e => setPaper({...paper, meta: {...paper.meta, standard: e.target.value}})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Subject</label>
                    <input className={styles.input} value={paper.meta.subject} onChange={e => setPaper({...paper, meta: {...paper.meta, subject: e.target.value}})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Chapter</label>
                    <input className={styles.input} value={paper.meta.chapter || ""} onChange={e => setPaper({...paper, meta: {...paper.meta, chapter: e.target.value}})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Total Marks</label>
                    <input type="number" className={styles.input} value={paper.meta.totalMarks} onChange={e => setPaper({...paper, meta: {...paper.meta, totalMarks: parseInt(e.target.value) || 0}})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Date</label>
                    <input className={styles.input} value={paper.meta.date} onChange={e => setPaper({...paper, meta: {...paper.meta, date: e.target.value}})} />
                  </div>
                </div>

                {/* Sections Editor */}
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h3 className={styles.label}>Sections & Questions</h3>
                  {paper.sections.map((sec, sIdx) => (
                    <div key={sec.id} className={styles.section}>
                      <input 
                        className={styles.input} 
                        style={{ fontWeight: "bold", marginBottom: "12px", width: "100%" }}
                        value={sec.title} 
                        onChange={e => {
                          const newSections = [...paper.sections];
                          newSections[sIdx].title = e.target.value;
                          setPaper({...paper, sections: newSections});
                        }} 
                      />
                      
                      {sec.questions.map((q, qIdx) => (
                        <div key={q.id} className={styles.question}>
                          <div className={styles.questionHeader}>
                            <input 
                              className={`${styles.input} ${styles.questionNumber}`} 
                              value={q.number} 
                              onChange={e => {
                                const newSections = [...paper.sections];
                                newSections[sIdx].questions[qIdx].number = e.target.value;
                                setPaper({...paper, sections: newSections});
                              }}
                            />
                            <textarea 
                              className={`${styles.input} ${styles.questionText}`} 
                              value={q.text} 
                              onChange={e => {
                                const newSections = [...paper.sections];
                                newSections[sIdx].questions[qIdx].text = e.target.value;
                                setPaper({...paper, sections: newSections});
                              }}
                              rows={2}
                            />
                            <input 
                              type="number"
                              className={`${styles.input} ${styles.questionMarks}`} 
                              value={q.marks} 
                              onChange={e => {
                                const newSections = [...paper.sections];
                                newSections[sIdx].questions[qIdx].marks = parseInt(e.target.value) || 0;
                                setPaper({...paper, sections: newSections});
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
                  <button className={styles.btnOutline} onClick={handlePrint} style={{ flex: 1 }}>
                    <Printer size={18} /> Print to PDF
                  </button>
                  <button className={styles.btn} onClick={handleDownloadPDF} style={{ flex: 1 }}>
                    <FileText size={18} /> Download PDF
                  </button>
                  <button className={styles.btnOutline} onClick={handleWordExport} style={{ flex: 1 }}>
                    <Download size={18} /> Export Word (.docx)
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {paper && (
        <div id="print-view-container" className={styles.printContainer}>
          <PrintView paper={paper} />
        </div>
      )}
    </>
  );
}
