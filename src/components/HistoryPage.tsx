import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ImageOff } from 'lucide-react';

interface CapturedImage {
  id: number;
  timestamp: string;
  image: string;
}

function HistoryPage() {
  const navigate = useNavigate();
  const [captures, setCaptures] = useState<CapturedImage[]>([]);

  useEffect(() => {
    loadCaptures();
  }, []);

  const loadCaptures = () => {
    try {
      const stored = localStorage.getItem('captures');
      const loadedCaptures: CapturedImage[] = stored ? JSON.parse(stored) : [];
      setCaptures(loadedCaptures.reverse());
    } catch (err) {
      console.error('Error loading captures:', err);
      setCaptures([]);
    }
  };

  const deleteImage = (id: number) => {
    try {
      const stored = localStorage.getItem('captures');
      const allCaptures: CapturedImage[] = stored ? JSON.parse(stored) : [];
      const filtered = allCaptures.filter((capture) => capture.id !== id);
      localStorage.setItem('captures', JSON.stringify(filtered));
      loadCaptures();
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Failed to delete image.');
    }
  };

  const clearAll = () => {
    if (captures.length === 0) return;

    if (window.confirm(`Are you sure you want to delete all ${captures.length} captured images?`)) {
      try {
        localStorage.removeItem('captures');
        setCaptures([]);
      } catch (err) {
        console.error('Error clearing all images:', err);
        alert('Failed to clear images.');
      }
    }
  };

  const downloadImage = (capture: CapturedImage) => {
    const link = document.createElement('a');
    link.href = capture.image;
    link.download = `capture-${capture.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Camera
            </button>

            {captures.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
                Clear All
              </button>
            )}
          </div>

          <h1 className="text-4xl font-bold text-center">Captured Images</h1>
          <p className="text-center text-gray-400 mt-2">
            {captures.length === 0
              ? 'No images captured yet'
              : `${captures.length} image${captures.length === 1 ? '' : 's'} in history`}
          </p>
        </header>

        {captures.length === 0 ? (
          <div className="text-center py-20">
            <ImageOff size={80} className="mx-auto mb-6 text-gray-600" />
            <h2 className="text-2xl font-semibold mb-4 text-gray-400">No captured images yet</h2>
            <p className="text-gray-500 mb-8">
              Go to the camera page and start capturing frames!
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Go to Camera
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {captures.map((capture) => (
              <div
                key={capture.id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="relative group">
                  <img
                    src={capture.image}
                    alt={`Captured on ${capture.timestamp}`}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => downloadImage(capture)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-semibold">
                      Click to download
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-sm text-gray-400 mb-3">{capture.timestamp}</p>
                  <button
                    onClick={() => deleteImage(capture.id)}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
