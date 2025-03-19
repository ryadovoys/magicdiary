import React, { useEffect, useRef, useState } from 'react';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Set initial styles
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  useEffect(() => {
    // Check for API key in localStorage
    const savedApiKey = localStorage.getItem('apiKey');
    setApiKey(savedApiKey);
    setIsLoading(false);
  }, []);
  
  const handleApiKeySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('apiKeyInput') as HTMLInputElement;
    const key = input.value.trim();
    
    if (key) {
      localStorage.setItem('apiKey', key);
      setApiKey(key);
      initializeApp(key);
    }
  };
  
  const initializeApp = (key: string) => {
    // Your initialization code here
    console.log('Initializing app with API key:', key);
  };
  
  useEffect(() => {
    if (apiKey) {
      initializeApp(apiKey);
    }
  }, [apiKey]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPosition(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPosition(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Wait 5 seconds before sending to API
    setTimeout(async () => {
      // Get the drawing as base64
      const imageData = canvas.toDataURL('image/png');
      
      try {
        const response = await fetch('/api/analyze-drawing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ imageData })
        });

        const data = await response.json();
        setMessage(data.message);

        // Clear canvas after getting response
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Hide message after 5 seconds
        setTimeout(() => {
          setMessage("");
        }, 5000);
      } catch (error) {
        console.error('Error:', error);
        setMessage("Your magical drawing speaks volumes. What other secrets will you share?");
        
        // Hide error message after 5 seconds
        setTimeout(() => {
          setMessage("");
        }, 5000);
      }
    }, 5000); // 5 second delay before sending to API
  };

  const getPosition = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!apiKey) {
    // Show setup screen
    return (
      <div id="setupScreen">
        <div className="setup-container">
          <h2>Welcome to the App</h2>
          <p>Please enter your API key to continue:</p>
          <form onSubmit={handleApiKeySubmit}>
            <input 
              type="text" 
              name="apiKeyInput" 
              placeholder="Enter your API key" 
              required 
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    );
  }
  
  // Show main app content
  return (
    <div className="min-h-screen bg-black">
      <canvas
        ref={canvasRef}
        className="touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      {message && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xl text-center p-6 rounded-lg bg-black bg-opacity-50">
          {message}
        </div>
      )}
      <h1>Your App</h1>
      <p>API Key is set</p>
      
      {/* Button to change API key */}
      <button onClick={() => {
        localStorage.removeItem('apiKey');
        setApiKey(null);
      }}>
        Change API Key
      </button>
    </div>
  );
}

export default App;