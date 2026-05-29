import { useState } from 'react';
import { amenazasCaracterizadas } from '../data';

const interesesRecomendados = [
  'Soberanía Nacional de la Zona Fronteriza no delimitada, de reducido control o de herencia cultural de isla lacustre Taquile-Amantani.',
  'Control territorial de corredores económicos Desaguadero-Ilo.',
  'Control de Recursos Estratégicos de corredor San Juan del Oro-Macusani.',
  'Mantenimiento de aprobación del segmento aimara respecto a control gubernamental del Estado.',
  'Mantenimiento de capacidad de comercio internacional.',
];

export default function InterestSelection({ onGenerateMatrix, onBack }) {
  const [mode, setMode] = useState('idle');
  const [texts, setTexts] = useState(Array(5).fill(''));
  const [loading, setLoading] = useState(false);

  const allFilled = texts.every((t) => t.trim().length > 0);

  const handleRecommend = () => {
    setLoading(true);
    setTimeout(() => {
      setTexts([...interesesRecomendados]);
      setLoading(false);
      setMode('filled');
    }, 6000);
  };

  return (
    <div className="h-screen flex flex-col bg-dash-bg">
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[40%] border-r border-dash-border p-10 overflow-y-auto">
          <h2 className="text-lg font-bold uppercase tracking-wider text-[#f97316] mb-8">
            Amenazas Caracterizadas
          </h2>
          <div className="flex flex-col gap-10">
  {amenazasCaracterizadas.map((am) => (
              <div
                key={am.id}
                className="border border-dash-border rounded-xl p-6 bg-dash-surface/30 hover:border-dash-muted/40 transition-colors"
              >
                <div className="flex items-center gap-4 mb-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#f97316]/15 text-[#f97316] text-sm font-bold">
                    {String(am.id).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-semibold text-dash-muted uppercase tracking-wider">Amenaza Caracterizada</span>
                </div>
                <p className="text-sm text-dash-text leading-relaxed mb-1">{am.nombre}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {am.path.map((pid) => (
                    <span
                      key={pid}
                      className="text-[10px] px-3 py-1 rounded-full border border-dash-border/50 text-dash-muted bg-white/5 font-medium"
                    >
                      {pid}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col p-10 overflow-y-auto">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-2xl font-bold tracking-[0.15em] text-dash-text uppercase">
              Intereses Nacionales
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setMode('editing')}
                className="px-8 py-3.5 text-sm font-bold uppercase tracking-wider bg-dash-surface text-dash-text border-2 border-dash-border rounded-xl hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all"
              >
                Redactar Intereses
              </button>
              <button
                onClick={handleRecommend}
                disabled={loading}
                className="px-8 py-3.5 text-sm font-bold uppercase tracking-wider bg-[#3b82f6] text-white border-2 border-[#2563eb] rounded-xl hover:bg-[#2563eb] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Recomendar Intereses
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-3 mb-10 px-5 py-4 bg-dash-surface/50 border border-dash-border rounded-xl">
              <div className="w-3 h-3 bg-[#3b82f6] rounded-full animate-pulse" />
              <span className="text-sm text-dash-muted font-mono">
                Analizando escenarios políticos, económicos y sociales...
              </span>
            </div>
          )}

          {mode === 'idle' ? (
            <div className="flex flex-col items-center justify-center flex-1 text-dash-muted">
              <div className="w-16 h-16 rounded-full border-2 border-dash-border flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-dash-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-base">Presione <span className="text-dash-text font-semibold">"Redactar Intereses"</span> para escribir manualmente</p>
              <p className="text-base mt-2">o <span className="text-[#3b82f6] font-semibold">"Recomendar Intereses"</span> para generar automáticamente</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="border border-dash-border rounded-xl p-6 bg-dash-surface/30"
                >
                  <span className="text-xs font-bold text-dash-muted uppercase tracking-wider mb-3 block">
                    Interés Nacional {i + 1}
                  </span>
                  {mode === 'editing' && !loading ? (
                    <textarea
                      value={texts[i]}
                      onChange={(e) => {
                        const next = [...texts];
                        next[i] = e.target.value;
                        setTexts(next);
                      }}
                      placeholder="Redacte el interés nacional..."
                      rows={4}
                      className="w-full bg-dash-bg border border-dash-border rounded-lg px-4 py-3 text-sm text-dash-text placeholder-dash-muted/50 focus:border-[#3b82f6] focus:outline-none resize-none transition-colors"
                    />
                  ) : (
                    <p className="text-sm text-dash-text leading-relaxed min-h-[4rem]">
                      {texts[i] || (
                        <span className="text-dash-muted/40 italic">
                          Cargando...
                        </span>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-28 flex items-center justify-center gap-8 border-t border-dash-border bg-dash-surface shrink-0 px-8">
        <button
          onClick={() => onGenerateMatrix(texts)}
          disabled={!allFilled}
          className={`px-14 py-4 text-base font-bold uppercase tracking-wider rounded-xl border-2 transition-all ${
            allFilled
              ? 'bg-[#ef4444] text-white border-[#dc2626] hover:bg-[#dc2626] shadow-lg shadow-red-500/20 cursor-pointer'
              : 'bg-dash-bg text-dash-muted/40 border-dash-border cursor-not-allowed'
          }`}
        >
          Generar Matriz
        </button>
        <button
          onClick={onBack}
          className="flex items-center gap-3 px-12 py-4 text-base font-semibold uppercase tracking-widest text-dash-muted hover:text-dash-text border-2 border-dash-border rounded-xl hover:border-dash-muted transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5m7-7l-7 7 7 7" />
          </svg>
          VOLVER
        </button>
      </div>
    </div>
  );
}
