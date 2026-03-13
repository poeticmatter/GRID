import { useEffect, useState } from 'react';
import { GameLayout } from './components/layout/GameLayout';
import { loadGameAssets } from './engine/loader';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGameAssets()
      .then(() => setIsLoaded(true))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-red-500 font-mono">
        <h1>FATAL ERROR: {error}</h1>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-cyan-500 font-mono italic">
        <h1>LOADING CORE ASSET PIPELINE...</h1>
      </div>
    );
  }

  return <GameLayout />;
}

export default App;
