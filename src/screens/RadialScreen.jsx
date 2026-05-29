import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadialChart from '../components/RadialChart';
import { amenazasCaracterizadas } from '../data';

export default function RadialScreen({ filters, onBack }) {
  const [activeAmenaza, setActiveAmenaza] = useState(null);
  const [revealed, setRevealed] = useState(new Set());
  const [chartDone, setChartDone] = useState(false);

  const allRevealed = revealed.size >= amenazasCaracterizadas.length;

  const handleActiveChange = useCallback((idx) => {
    if (idx !== null) {
      setActiveAmenaza(idx);
      setRevealed((prev) => {
        const next = new Set(prev);
        next.add(idx);
        if (next.size >= amenazasCaracterizadas.length) {
          setTimeout(() => setChartDone(true), 1500);
        }
        return next;
      });
    } else {
      setActiveAmenaza(null);
    }
  }, []);

  const descargarMatriz = () => {
    fetch('/boton2.pdf')
      .then(r => {
        if (!r.ok) throw new Error(`No se encontró el archivo (${r.status})`);
        return r.blob();
      })
      .then(b => {
        const u = URL.createObjectURL(b);
        const a = document.createElement('a');
        a.href = u;
        a.download = 'matriz-estrategica.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(u);
      })
      .catch(err => alert('Error al descargar: ' + err.message));
  };

  return (
    <div className="h-screen flex flex-col bg-dash-bg">
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <RadialChart
            filters={filters}
            activeAmenaza={activeAmenaza}
            onActiveChange={handleActiveChange}
          />
        </div>

        <aside className="w-[420px] flex flex-col justify-center px-6 py-8 overflow-y-auto">
          <h3 className="text-lg font-bold uppercase tracking-wider text-[#f97316] mb-6">
            AMENAZAS CARACTERIZADAS
          </h3>

          <div className="space-y-4">
            {!allRevealed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-dash-muted"
              >
                <div className="w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm">Caracterizando amenazas...</p>
              </motion.div>
            )}

            <AnimatePresence>
              {amenazasCaracterizadas.map((am, idx) => {
                if (!revealed.has(idx)) return null;
                const isActive = activeAmenaza === idx;

                return (
                  <motion.div
                    key={am.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`rounded-xl border-2 p-4 transition-all duration-700 ${
                      isActive
                        ? 'border-[#f4a261] bg-[#f4a261]/10 shadow-lg shadow-[#f4a261]/20'
                        : 'border-dash-border bg-dash-surface/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-sm font-bold shrink-0 mt-0.5 ${
                        isActive ? 'text-[#f4a261]' : 'text-dash-muted'
                      }`}>
                        {String(am.id).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium leading-snug transition-colors duration-700 ${
                          isActive ? 'text-white' : 'text-dash-text/80'
                        }`}>
                          {am.nombre}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {am.path.map((pid) => (
                            <span key={pid} className={`text-[10px] px-2 py-0.5 rounded-full border transition-all duration-700 ${
                              isActive
                                ? 'border-[#f4a261]/50 text-[#f4a261] bg-[#f4a261]/15'
                                : 'border-dash-border/50 text-dash-muted bg-white/5'
                            }`}>
                              {pid}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <button
            onClick={descargarMatriz}
            disabled={!allRevealed}
            className={`w-full mt-8 py-4 text-base font-bold uppercase tracking-wider rounded-xl border-2 transition-all ${
              allRevealed
                ? 'bg-[#3b82f6] text-white border-[#2563eb] hover:bg-[#2563eb] shadow-lg shadow-blue-500/20 cursor-pointer'
                : 'bg-dash-bg text-dash-muted/40 border-dash-border cursor-not-allowed'
            }`}
          >
            DESCARGAR MATRIZ
          </button>
        </aside>
      </div>

      <div className="h-20 flex items-end justify-end px-12 pb-6">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-16 h-16 bg-[#3b82f6] hover:bg-[#2563eb] rounded-full transition-all shadow-lg shadow-blue-500/20"
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M19 12H5m7-7l-7 7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
