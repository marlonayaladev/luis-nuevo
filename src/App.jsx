import { useState, useCallback } from 'react';
import HomeScreen from './screens/HomeScreen';
import AreaScreen from './screens/AreaScreen';
import FilterScreen from './screens/FilterScreen';
import RadialScreen from './screens/RadialScreen';
import InterestSelection from './screens/InterestSelection';
import QuantitativeMatrix from './screens/QuantitativeMatrix';
import { categories, relationMatrix } from './data';

function buildDefaultFilters() {
  const f = {};
  for (const cat of categories) {
    f[cat.id] = {};
    for (const item of cat.items) {
      const idNum = parseInt(item.id.replace(/\D/g, ''), 10);
      switch (cat.id) {
        case 'mt':
          f[cat.id][item.id] = idNum <= 8;
          break;
        case 'tn':
          f[cat.id][item.id] = idNum <= 9;
          break;
        case 'tin':
          f[cat.id][item.id] = idNum <= 9;
          break;
        case 'ts':
          f[cat.id][item.id] = idNum <= 7;
          break;
        case 'r':
          f[cat.id][item.id] = idNum <= 5;
          break;
        case 'a':
          f[cat.id][item.id] = idNum <= 5;
          break;
        default:
          f[cat.id][item.id] = false;
      }
    }
  }
  return f;
}

function App() {
  const [screen, setScreen] = useState('home');
  const [filters, setFilters] = useState(buildDefaultFilters);
  const [areaCritica, setAreaCritica] = useState('');
  const [intereses, setIntereses] = useState([]);

  const handleToggleItem = useCallback((catId, itemId) => {
    setFilters((prev) => ({
      ...prev,
      [catId]: {
        ...prev[catId],
        [itemId]: !prev[catId][itemId],
      },
    }));
  }, []);

  const handleSelectAll = useCallback((catId, value) => {
    setFilters((prev) => {
      const cat = categories.find((c) => c.id === catId);
      const next = { ...prev, [catId]: {} };
      for (const item of cat.items) {
        next[catId][item.id] = value;
      }
      return next;
    });
  }, []);

  const handleRecommendSelection = useCallback(() => {
    setFilters(() => {
      const next = {};
      for (const cat of categories) {
        next[cat.id] = {};
        for (const item of cat.items) {
          next[cat.id][item.id] = false;
        }
      }

      const mtCat = categories.find((c) => c.id === 'mt');
      for (const item of mtCat.items) {
        next.mt[item.id] = true;
      }

      for (const item of mtCat.items) {
        if (next.mt[item.id]) {
          const connections = relationMatrix[item.id] || [];
          for (const connId of connections) {
            for (const cat of categories) {
              if (cat.items.some((i) => i.id === connId)) {
                next[cat.id][connId] = true;
                break;
              }
            }
          }
        }
      }

      return next;
    });
  }, []);

  const handleGenerateRadial = useCallback(() => {
    setScreen('radial');
  }, []);

  const handleGenerateMatrix = useCallback((texts) => {
    setIntereses(texts);
    setScreen('quantitative-matrix');
  }, []);

  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          onNavigate={(s) => {
            if (s === 'interests') {
              setIntereses([]);
            }
            setScreen(s);
          }}
        />
      )}
      {screen === 'area' && (
        <AreaScreen onNavigate={setScreen} onAreaSelect={setAreaCritica} />
      )}
      {screen === 'filters' && (
        <FilterScreen
          filters={filters}
          onToggleItem={handleToggleItem}
          onSelectAll={handleSelectAll}
          onRecommendSelection={handleRecommendSelection}
          onGenerateRadial={handleGenerateRadial}
          onBack={() => setScreen('area')}
          areaCritica={areaCritica}
        />
      )}
      {screen === 'radial' && (
        <RadialScreen filters={filters} onBack={() => setScreen('home')} />
      )}
      {screen === 'interests' && (
        <InterestSelection
          onGenerateMatrix={handleGenerateMatrix}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'quantitative-matrix' && (
        <QuantitativeMatrix
          intereses={intereses}
          onBack={() => setScreen('home')}
        />
      )}
    </>
  );
}

export default App;
