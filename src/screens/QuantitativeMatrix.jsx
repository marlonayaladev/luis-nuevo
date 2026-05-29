import { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { amenazasCaracterizadas } from '../data';

const columnHeaders = [
  'DAÑO',
  'RECUPERACIÓN',
  'PERSUASIÓN',
  'ÁMBITO GEOGRÁFICO',
  'PROB. RIESGO',
  'GRADO VULNERABILIDAD',
];

const matrixData = [
  {
    inIdx: 0,
    rows: [
      { scores: [4, 3, 3, 4, 4, 4] },
      { scores: [5, 5, 4, 5, 5, 5] },
      { scores: [5, 4, 4, 5, 5, 5] },
      { scores: [5, 4, 3, 5, 5, 5] },
      { scores: [4, 4, 4, 5, 4, 5] },
    ],
    partial: [4.6, 4, 3.6, 4.8, 4.8, 4.8],
  },
  {
    inIdx: 1,
    rows: [
      { scores: [4, 3, 3, 5, 4, 4] },
      { scores: [5, 3, 4, 5, 5, 5] },
      { scores: [5, 4, 4, 5, 5, 5] },
      { scores: [4, 3, 4, 5, 4, 4] },
      { scores: [4, 4, 4, 5, 5, 5] },
    ],
    partial: [4.4, 3.4, 3.8, 5, 4.6, 4.6],
  },
  {
    inIdx: 2,
    rows: [
      { scores: [5, 5, 4, 5, 5, 5] },
      { scores: [5, 5, 4, 5, 5, 5] },
      { scores: [5, 4, 4, 5, 5, 5] },
      { scores: [4, 3, 3, 4, 4, 4] },
      { scores: [5, 4, 4, 5, 5, 5] },
    ],
    partial: [4.8, 4.2, 3.8, 4.8, 4.8, 4.8],
  },
  {
    inIdx: 3,
    rows: [
      { scores: [4, 3, 3, 4, 4, 4] },
      { scores: [4, 4, 4, 5, 4, 5] },
      { scores: [5, 4, 4, 5, 5, 5] },
      { scores: [4, 3, 3, 4, 4, 4] },
      { scores: [5, 4, 4, 5, 5, 4] },
    ],
    partial: [4.4, 3.6, 3.6, 4.6, 4.4, 4.4],
  },
  {
    inIdx: 4,
    rows: [
      { scores: [5, 4, 4, 5, 5, 5] },
      { scores: [4, 3, 3, 4, 4, 4] },
      { scores: [5, 4, 4, 5, 5, 5] },
      { scores: [4, 4, 4, 5, 4, 4] },
      { scores: [5, 5, 4, 5, 5, 5] },
    ],
    partial: [4.6, 4, 3.8, 4.8, 4.6, 4.6],
  },
];

function buildCellList() {
  const cells = [];
  for (const inBlock of matrixData) {
    for (let a = 0; a < 5; a++) {
      for (let c = 0; c < 6; c++) {
        cells.push({ inIdx: inBlock.inIdx, rowType: 'data', amenazaIdx: a, colIdx: c });
      }
    }
    for (let c = 0; c < 6; c++) {
      cells.push({ inIdx: inBlock.inIdx, rowType: 'partial', colIdx: c });
    }
  }
  return cells;
}

const allCells = buildCellList();
const HALFWAY = Math.floor(allCells.length / 2);

const modalQuestions = [
  {
    label:
      'Respecto al interés nacional 1: Soberanía Nacional... diga del 1 al 5 ¿cómo cree ud que el riesgo 1 genera DAÑO?',
    key: 'q1',
  },
  {
    label:
      'Respecto al interés nacional 3: Control de Recursos... ¿cómo cree ud que el riesgo 3 afecta su RECUPERACIÓN?',
    key: 'q2',
  },
  {
    label:
      'Respecto al interés nacional 5: Mantenimiento de capacidad... diga del 1 al 5 ¿cómo cree ud que el riesgo 5 representa VULNERABILIDAD DEL INTERÉS?',
    key: 'q3',
  },
];

function getCellValue(inIdx, rowType, amenazaIdx, colIdx) {
  const block = matrixData[inIdx];
  if (rowType === 'partial') return block.partial[colIdx];
  return block.rows[amenazaIdx].scores[colIdx];
}

export default function QuantitativeMatrix({ intereses, onBack }) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalAnswers, setModalAnswers] = useState({ q1: 0, q2: 0, q3: 0 });
  const [finished, setFinished] = useState(false);
  const tableRef = useRef(null);
  const intervalRef = useRef(null);

  const allAnswered =
    modalAnswers.q1 > 0 && modalAnswers.q2 > 0 && modalAnswers.q3 > 0;

  const startInterval = useCallback((ms) => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRevealedCount((prev) => {
        const next = prev + 1;
        if (next === HALFWAY) {
          clearInterval(intervalRef.current);
          setPaused(true);
          setShowModal(true);
          return prev;
        }
        if (next >= allCells.length) {
          clearInterval(intervalRef.current);
          setFinished(true);
          return allCells.length;
        }
        return next;
      });
    }, ms);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => startInterval(50), 500);
    return () => {
      clearTimeout(timer);
      clearInterval(intervalRef.current);
    };
  }, [startInterval]);

  const handleResume = () => {
    setShowModal(false);
    setPaused(false);
    setRevealedCount((prev) => {
      const next = prev + 1;
      if (next >= allCells.length) {
        setFinished(true);
        return allCells.length;
      }
      return next;
    });
    const remaining = allCells.length - (HALFWAY + 1);
    const ms = Math.max(20, Math.floor(remaining > 0 ? 1800 / remaining : 20));
    startInterval(ms);
  };

  const cellRevealed = (inIdx, rowType, amenazaIdx, colIdx) => {
    const idx = allCells.findIndex(
      (c) =>
        c.inIdx === inIdx &&
        c.rowType === rowType &&
        c.amenazaIdx === (amenazaIdx ?? 0) &&
        c.colIdx === colIdx
    );
    return idx < revealedCount;
  };

  const downloadPDF = () => {
    fetch('/Analisis_cuantitativo_cualitativo.pdf')
      .then(r => {
        if (!r.ok) throw new Error(`No se encontró el archivo (${r.status})`);
        return r.blob();
      })
      .then(b => {
        const u = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = u;
        a.download = 'Analisis_cuantitativo_cualitativo.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(u);
      })
      .catch(err => alert('Error al descargar: ' + err.message));
  };

  return (
    <div className="h-screen flex flex-col bg-dash-bg">
      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-[0.15em] text-dash-text uppercase">
            Matriz de Riesgo y Tamizaje
          </h1>
          {finished && (
            <button
              onClick={downloadPDF}
              className="px-8 py-3.5 text-base font-bold uppercase tracking-wider bg-[#ef4444] text-white border-2 border-[#dc2626] rounded-xl hover:bg-[#dc2626] transition-all shadow-lg shadow-red-500/20"
            >
              DESCARGAR MATRIZ
            </button>
          )}
        </div>

        <div ref={tableRef} className="bg-dash-surface/30 border border-dash-border rounded-xl overflow-hidden inline-block min-w-full">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="text-left px-4 py-3 text-dash-muted uppercase tracking-wider font-semibold border-b border-dash-border bg-dash-surface/50 sticky top-0 z-10 min-w-[220px]">
                  Interés / Amenaza
                </th>
                {columnHeaders.map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-dash-muted uppercase tracking-wider font-semibold border-b border-dash-border bg-dash-surface/50 sticky top-0 z-10 text-center min-w-[100px]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixData.map((inBlock) => (
                <Fragment key={`in-block-${inBlock.inIdx}`}>
                  <tr key={`in-header-${inBlock.inIdx}`}>
                    <td
                      colSpan={7}
                      className="px-3 py-2.5 bg-[#3b82f6]/20 border-b border-dash-border/50"
                    >
                      <span className="text-sm font-bold text-[#3b82f6] uppercase tracking-wider">
                        IN {inBlock.inIdx + 1}
                        {intereses[inBlock.inIdx]
                          ? `: ${intereses[inBlock.inIdx].length > 80 ? intereses[inBlock.inIdx].slice(0, 80) + '...' : intereses[inBlock.inIdx]}`
                          : ''}
                      </span>
                    </td>
                  </tr>

                  {inBlock.rows.map((row, aIdx) => (
                    <tr
                      key={`in${inBlock.inIdx}-a${aIdx}`}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 border-b border-dash-border/50 text-dash-text font-medium">
                        <span className="text-ring-0">A{aIdx + 1}</span>{' '}
                        <span className="text-dash-muted text-[10px]">
                          {amenazasCaracterizadas[aIdx].nombre.length > 50
                            ? amenazasCaracterizadas[aIdx].nombre.slice(0, 50) + '...'
                            : amenazasCaracterizadas[aIdx].nombre}
                        </span>
                      </td>
                      {row.scores.map((_, cIdx) => {
                        const revealed = cellRevealed(
                          inBlock.inIdx,
                          'data',
                          aIdx,
                          cIdx
                        );
                        const val = getCellValue(inBlock.inIdx, 'data', aIdx, cIdx);
                        return (
                          <td
                            key={cIdx}
                            className="px-4 py-3 text-center border-b border-dash-border/50"
                          >
                            {revealed ? (
                              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-ring-0/20 text-ring-0 text-sm font-bold">
                                {val}
                              </span>
                            ) : (
                              <span className="text-dash-muted/20 text-sm">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  <tr className="bg-dash-surface/40">
                    <td className="px-4 py-3 border-b border-dash-border/50 text-dash-muted text-[10px] font-semibold uppercase tracking-wider">
                      Parcial IN {inBlock.inIdx + 1}
                    </td>
                    {inBlock.partial.map((val, cIdx) => {
                      const revealed = cellRevealed(inBlock.inIdx, 'partial', 0, cIdx);
                      return (
                    <td
                            key={cIdx}
                            className="px-4 py-3 text-center border-b border-dash-border/50"
                          >
                            {revealed ? (
                              <span className="inline-flex items-center justify-center w-9 h-9 rounded bg-[#f97316]/20 text-[#f97316] text-sm font-bold">
                                {val.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-dash-muted/20 text-sm">—</span>
                            )}
                          </td>
                      );
                    })}
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="h-16 flex items-center px-6 border-t border-dash-border bg-dash-surface shrink-0">
        <div className="flex items-center gap-2 text-xs text-dash-muted">
          <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" />
          {finished
            ? 'Matriz completada'
            : paused
              ? 'Procesamiento pausado - responda la encuesta'
              : `Calculando... ${Math.min(revealedCount, allCells.length)}/${allCells.length} celdas`}
        </div>
        <div className="flex-1" />
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold uppercase tracking-widest text-dash-muted hover:text-dash-text border border-dash-border rounded-xl hover:border-dash-muted transition-all"
        >
          VOLVER
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-dash-surface border border-dash-border rounded-xl w-full max-w-2xl mx-4 p-6">
            <h2 className="text-base font-bold uppercase tracking-wider text-dash-text mb-6">
              Encuesta de Tamizaje
            </h2>

            <div className="space-y-6">
              {modalQuestions.map((q) => (
                <div key={q.key}>
                  <p className="text-sm text-dash-text mb-3 leading-snug">{q.label}</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() =>
                          setModalAnswers((prev) => ({ ...prev, [q.key]: n }))
                        }
                        className={`w-10 h-10 rounded-lg text-sm font-bold border-2 transition-all ${
                          modalAnswers[q.key] === n
                            ? 'bg-[#3b82f6] text-white border-[#3b82f6]'
                            : 'bg-dash-bg text-dash-muted border-dash-border hover:border-dash-muted'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleResume}
                disabled={!allAnswered}
                className={`px-8 py-3 text-sm font-bold uppercase tracking-wider rounded-xl border-2 transition-all ${
                  allAnswered
                    ? 'bg-[#3b82f6] text-white border-[#2563eb] hover:bg-[#2563eb] shadow-lg shadow-blue-500/20'
                    : 'bg-dash-bg text-dash-muted/40 border-dash-border cursor-not-allowed'
                }`}
              >
                {allAnswered ? 'Reanudar Cálculo' : 'Responda todas las preguntas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
