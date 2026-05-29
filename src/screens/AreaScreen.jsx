import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const PERU_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

const zonas = [
  { id: 'z1', label: 'Huarango - San José de Lourdes (Cajamarca)', color: '#22c55e', coords: [-78.78, -5.27] },
  { id: 'z2', label: 'Comaina (Amazonas)', color: '#3b82f6', coords: [-78.22, -4.45] },
  { id: 'z3', label: 'Santiago (Amazonas)', color: '#f97316', coords: [-77.76, -3.72] },
  { id: 'z4', label: 'Morona (Loreto)', color: '#eab308', coords: [-77.28, -4.20] },
  { id: 'z5', label: 'Napo Curaray (Loreto)', color: '#a855f7', coords: [-74.20, -2.50] },
  { id: 'z6', label: 'Putumayo (Loreto)', color: '#06b6d4', coords: [-72.67, -2.45] },
  { id: 'z7', label: 'Trapecio Amazónico (Loreto)', color: '#22c55e', coords: [-70.50, -3.80] },
  { id: 'z8', label: 'Yaquerana - Alto Tamaya (Loreto / Ucayali)', color: '#f97316', coords: [-72.88, -5.50] },
  { id: 'z9', label: 'Zona Ucayali / Purús-Breu (Ucayali)', color: '#eab308', coords: [-73.00, -9.50] },
  { id: 'z10', label: 'Yurúa (Ucayali)', color: '#3b82f6', coords: [-72.78, -9.68] },
  { id: 'z11', label: 'Purús (Ucayali)', color: '#a855f7', coords: [-70.75, -9.80] },
  { id: 'z12', label: 'Iñapari (Madre de Dios)', color: '#06b6d4', coords: [-69.57, -10.95] },
  { id: 'z13', label: 'La Yarada Los Palos (Tacna)', color: '#22c55e', coords: [-70.54, -18.18] },
  { id: 'z14', label: 'Puno (Lago Titicaca)', color: '#ec4899', coords: [-69.8, -15.8] },
];

export default function AreaScreen({ onNavigate, onAreaSelect }) {
  const [selected, setSelected] = useState('');

  const handleConfirm = () => {
    if (!selected) return;
    onAreaSelect(selected);
    onNavigate('filters');
  };

  return (
    <div className="h-screen flex items-center justify-center bg-dash-bg gap-12 px-12 relative">
      <div className="flex items-center justify-center">
        <button
          onClick={() => {}}
          className="px-8 py-6 text-xl font-bold uppercase tracking-[0.15em] text-white bg-[#3b82f6] rounded-xl shadow-lg shadow-blue-500/20"
        >
          SELECCIONE<br />ÁREA CRÍTICA
        </button>
      </div>

      <div className="relative w-[520px] h-[620px] border-2 border-dash-border rounded-xl overflow-hidden bg-dash-surface/30">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1300, center: [-75, -9] }}
          width={520}
          height={620}
          className="w-full h-full"
        >
          <Geographies geography={PERU_URL}>
            {({ geographies }) =>
              geographies
                .filter((geo) => geo.properties.name === 'Peru')
                .map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1e293b"
                    stroke="#00d4ff"
                    strokeWidth={0.8}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#1e3a5f', outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
            }
          </Geographies>

          {zonas.map((z) => (
            <Marker key={z.id} coordinates={z.coords}>
              <circle
                r={selected === z.id ? 12 : 9}
                fill={z.color}
                fillOpacity={selected === z.id ? 0.85 : 0.55}
                stroke={z.color}
                strokeWidth={selected === z.id ? 3 : 1.5}
                strokeOpacity={0.9}
                style={{ transition: 'r 0.2s, fill-opacity 0.2s', cursor: 'pointer' }}
                onClick={() => setSelected(z.id)}
              />
              <circle r={4} fill="#ffffff" fillOpacity={0.9} />
            </Marker>
          ))}

          <Marker coordinates={[-77.5, -4.0]}>
            <text textAnchor="middle" fill="#ffffff" fontSize={5} fontWeight={700} fontFamily="'Inter', sans-serif" opacity={0.4}>
              ECUADOR
            </text>
          </Marker>
          <Marker coordinates={[-72.0, -1.5]}>
            <text textAnchor="middle" fill="#ffffff" fontSize={5} fontWeight={700} fontFamily="'Inter', sans-serif" opacity={0.4}>
              COLOMBIA
            </text>
          </Marker>
          <Marker coordinates={[-69.0, -1.5]}>
            <text textAnchor="middle" fill="#ffffff" fontSize={5} fontWeight={700} fontFamily="'Inter', sans-serif" opacity={0.4}>
              BRASIL
            </text>
          </Marker>
          <Marker coordinates={[-71.0, -16.0]}>
            <text textAnchor="middle" fill="#ffffff" fontSize={5} fontWeight={700} fontFamily="'Inter', sans-serif" opacity={0.4}>
              BOLIVIA
            </text>
          </Marker>
          <Marker coordinates={[-70.5, -19.0]}>
            <text textAnchor="middle" fill="#ffffff" fontSize={5} fontWeight={700} fontFamily="'Inter', sans-serif" opacity={0.4}>
              CHILE
            </text>
          </Marker>
        </ComposableMap>

        <div className="absolute bottom-3 left-3 bg-dash-bg/90 border border-dash-border rounded-lg p-3 max-w-[220px]">
          <h4 className="text-[9px] font-bold uppercase tracking-wider text-dash-text mb-2">ZONAS CRÍTICAS</h4>
          <div className="space-y-0.5 max-h-[120px] overflow-y-auto">
            {zonas.map((z) => (
              <div key={z.id} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                <span className="text-[7px] text-dash-muted truncate">{z.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-80">
        {zonas.map((z) => (
          <button
            key={z.id}
            onClick={() => setSelected(z.id)}
            className={`w-full text-left px-4 py-2.5 text-xs font-medium border-2 rounded-xl transition-all ${
              selected === z.id
                ? 'border-[#3b82f6] bg-[#3b82f6]/15 text-white'
                : 'border-dash-border text-dash-muted hover:border-dash-border/70 hover:text-dash-text/80'
            }`}
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{ backgroundColor: z.color }} />
            {z.label}
          </button>
        ))}

        <button
          onClick={handleConfirm}
          disabled={!selected}
          className={`w-full mt-4 py-4 text-sm font-bold uppercase tracking-wider rounded-xl border-2 transition-all ${
            selected
              ? 'bg-[#3b82f6] text-white border-[#3b82f6] hover:bg-[#2563eb] shadow-lg shadow-blue-500/20'
              : 'bg-dash-bg text-dash-muted/40 border-dash-border cursor-not-allowed'
          }`}
        >
          CONFIRMAR
        </button>
      </div>

      <div className="absolute bottom-6 left-6">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center justify-center w-14 h-14 bg-[#3b82f6] hover:bg-[#2563eb] rounded-full transition-all shadow-lg shadow-blue-500/20"
        >
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M19 12H5m7-7l-7 7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
