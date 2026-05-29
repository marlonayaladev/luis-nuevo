import { useState, useMemo } from 'react';
import { categories, relationMatrix } from '../data';

export default function MatrixModal({ filters, onClose }) {
  const [showCuestionario, setShowCuestionario] = useState(false);
  const [respuestas, setRespuestas] = useState({});
  const [generated, setGenerated] = useState(false);

  const preguntas = [
    { id: 'impacto', label: 'Nivel de impacto', opciones: ['Alto', 'Medio', 'Bajo'] },
    { id: 'probabilidad', label: 'Probabilidad', opciones: ['Alta', 'Media', 'Baja'] },
    { id: 'urgencia', label: 'Urgencia', opciones: ['Alta', 'Media', 'Baja'] },
    { id: 'tendencia', label: 'Tendencia', opciones: ['Creciente', 'Estable', 'Decreciente'] },
  ];

  const activeCategories = useMemo(
    () =>
      categories.filter((cat) => cat.items.some((item) => filters[cat.id]?.[item.id])),
    [filters]
  );

  const cuestionarioCompleto = preguntas.every((p) => respuestas[p.id]);

  const handleRespuesta = (id, valor) => {
    setRespuestas((prev) => ({ ...prev, [id]: valor }));
  };

  const handleGenerarConDatos = () => {
    setGenerated(true);
  };

  const descargarPDF = (nombreArchivo) => {
    fetch('/' + nombreArchivo)
      .then(r => {
        if (!r.ok) throw new Error(`No se encontró el archivo (${r.status})`);
        return r.blob();
      })
      .then(b => {
        const u = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = u;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(u);
      })
      .catch(err => alert('Error al descargar: ' + err.message));
  };

  const valoresNumericos = useMemo(() => {
    if (!generated) return null;
    const mapping = { Alto: 0.9, Medio: 0.6, Bajo: 0.3, Alta: 0.9, Media: 0.6, Baja: 0.3, Creciente: 0.9, Estable: 0.6, Decreciente: 0.3 };
    const vals = Object.values(respuestas).map((v) => mapping[v] || 0.5);
    if (vals.length < 4) return {};
    const score = (vals[0] + vals[1] + vals[2] + vals[3]) / 4;
    const result = {};
    for (const cat of activeCategories) {
      for (const item of cat.items) {
        if (filters[cat.id]?.[item.id]) {
          const conns = relationMatrix[item.id] || [];
          const total = conns.length;
          const base = total > 0 ? Math.round(score * total * 10) : 0;
          result[item.id] = { conexiones: total, valor: base };
        }
      }
    }
    return result;
  }, [generated, respuestas, activeCategories, filters]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-dash-surface border border-dash-border rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dash-border shrink-0">
          <h2 className="text-base font-bold uppercase tracking-widest text-dash-text">
            Matriz de Relaciones Estratégicas
          </h2>
          <button onClick={onClose} className="text-dash-muted hover:text-dash-text transition-colors text-xl leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-dash-muted uppercase tracking-wider font-semibold border-b border-dash-border sticky top-0 bg-dash-surface">Elemento</th>
                {activeCategories.map((cat) => (
                  <th key={cat.id} className="px-3 py-2 text-dash-muted uppercase tracking-wider font-semibold border-b border-dash-border sticky top-0 bg-dash-surface text-center">{cat.short}</th>
                ))}
                {generated && valoresNumericos && (
                  <th className="px-3 py-2 text-[#f4a261] uppercase tracking-wider font-semibold border-b border-dash-border sticky top-0 bg-dash-surface text-center">VALOR</th>
                )}
              </tr>
            </thead>
            <tbody>
              {activeCategories.map((cat) =>
                cat.items.filter((item) => filters[cat.id]?.[item.id]).map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2 text-dash-text font-medium border-b border-dash-border/50">
                      <span className="text-ring-0">{item.id}</span>{' '}
                      <span className="text-dash-muted">{item.nombre}</span>
                    </td>
                    {activeCategories.map((otherCat) => {
                      const conns = relationMatrix[item.id] || [];
                      const otherItems = otherCat.items.filter((oi) => filters[otherCat.id]?.[oi.id]);
                      const count = otherItems.filter((oi) => conns.includes(oi.id)).length;
                      return (
                        <td key={otherCat.id} className="px-3 py-2 text-center border-b border-dash-border/50">
                          {count > 0 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-ring-0/20 text-ring-0 text-[10px] font-bold">{count}</span>
                          ) : <span className="text-dash-muted/30">—</span>}
                        </td>
                      );
                    })}
                    {generated && valoresNumericos && (
                      <td className="px-3 py-2 text-center border-b border-dash-border/50">
                        <span className="text-sm font-bold text-[#f4a261]">{valoresNumericos[item.id]?.valor ?? '—'}</span>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {showCuestionario && !generated && (
            <div className="mt-8 border-2 border-[#f4a261]/40 rounded-xl p-6 bg-dash-surface/30">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#f97316] mb-5">CUESTIONARIO</h3>
              <div className="grid grid-cols-2 gap-5">
                {preguntas.map((p) => (
                  <div key={p.id}>
                    <label className="block text-xs font-semibold text-dash-text mb-2 uppercase tracking-wider">{p.label}</label>
                    <div className="flex gap-2">
                      {p.opciones.map((op) => (
                        <button
                          key={op}
                          onClick={() => handleRespuesta(p.id, op)}
                          className={`px-4 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${
                            respuestas[p.id] === op
                              ? 'border-[#f4a261] bg-[#f4a261]/15 text-[#f4a261]'
                              : 'border-dash-border text-dash-muted hover:border-dash-border/60'
                          }`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleGenerarConDatos}
                disabled={!cuestionarioCompleto}
                className={`mt-6 px-8 py-3 text-sm font-bold uppercase tracking-wider rounded-xl border-2 transition-all ${
                  cuestionarioCompleto
                    ? 'bg-[#f4a261] text-white border-[#e8944e] hover:bg-[#e8944e]'
                    : 'bg-dash-bg text-dash-muted/40 border-dash-border cursor-not-allowed'
                }`}
              >
                GENERAR VALORES
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center px-6 py-4 border-t border-dash-border shrink-0 gap-4">
          <button
            onClick={() => descargarPDF('boton1.pdf')}
            className="px-6 py-3 text-sm font-bold uppercase tracking-wider bg-[#3b82f6] text-white border-2 border-[#2563eb] rounded-xl hover:bg-[#2563eb] transition-all"
          >
            DESCARGAR PDF
          </button>
          {!showCuestionario && (
            <button
              onClick={() => setShowCuestionario(true)}
              className="px-6 py-3 text-sm font-bold uppercase tracking-wider bg-[#f4a261] text-white border-2 border-[#e8944e] rounded-xl hover:bg-[#e8944e] transition-all"
            >
              CUESTIONARIO
            </button>
          )}
          <button
            onClick={() => descargarPDF('boton2.pdf')}
            className="px-6 py-3 text-sm font-bold uppercase tracking-wider bg-[#22c55e] text-white border-2 border-[#16a34a] rounded-xl hover:bg-[#16a34a] transition-all"
          >
            DESCARGAR MATRIZ
          </button>
          <span className="text-[10px] text-dash-muted ml-4">
            Total: {activeCategories.reduce((s, c) => s + c.items.filter((i) => filters[c.id]?.[i.id]).length, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}