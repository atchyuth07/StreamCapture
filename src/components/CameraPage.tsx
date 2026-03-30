import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image as ImageIcon } from 'lucide-react';

interface CapturedImage {
  id: number;
  timestamp: string;
  image: string;
}

function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [capturedCount, setCapturedCount] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    startCamera();
    loadCapturedCount();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsLoading(false);
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      setIsLoading(false);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please allow camera access and reload the page.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError('Failed to access camera: ' + err.message);
        }
      } else {
        setError('An unknown error occurred while accessing the camera.');
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const loadCapturedCount = () => {
    try {
      const stored = localStorage.getItem('captures');
      const captures: CapturedImage[] = stored ? JSON.parse(stored) : [];
      setCapturedCount(captures.length);
    } catch (err) {
      console.error('Error loading captures:', err);
      setCapturedCount(0);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/png');

    const now = new Date();
    const timestamp = now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newCapture: CapturedImage = {
      id: Date.now(),
      timestamp: timestamp,
      image: imageData,
    };

    try {
      const stored = localStorage.getItem('captures');
      const captures: CapturedImage[] = stored ? JSON.parse(stored) : [];
      captures.push(newCapture);
      localStorage.setItem('captures', JSON.stringify(captures));
      setCapturedCount(captures.length);
    } catch (err) {
      console.error('Error saving capture:', err);
      alert('Failed to save image. Storage might be full.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera size={40} />
            <h1 className="text-4xl font-bold">LiveFrame Capture</h1>
          </div>
          <p className="text-gray-400">Capture live frames from your camera</p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-6">
            {error ? (
              <div className="text-center py-12">
                <div className="text-red-400 mb-4 text-lg">{error}</div>
                <button
                  onClick={startCamera}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <div className="relative bg-black rounded-lg overflow-hidden mb-6">
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Starting camera...</p>
                      </div>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-auto"
                    style={{ maxHeight: '70vh' }}
                  />
                </div>

                <canvas ref={canvasRef} className="hidden" />

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="text-lg">
                    <span className="text-gray-400">Captured Images:</span>{' '}
                    <span className="font-bold text-blue-400">{capturedCount}</span>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={captureFrame}
                      disabled={!isCameraReady}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                        isCameraReady
                          ? 'bg-green-600 hover:bg-green-700 hover:scale-105'
                          : 'bg-gray-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Camera size={20} />
                      Capture Frame
                    </button>

                    <button
                      onClick={() => navigate('/history')}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                    >
                      <ImageIcon size={20} />
                      View History
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="text-center text-gray-500 text-sm">
            <p>Your images are stored locally in your browser</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraPage;
