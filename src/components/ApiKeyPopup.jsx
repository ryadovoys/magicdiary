import { useState, useEffect } from 'react';
import './ApiKeyPopup.css';

const ApiKeyPopup = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Check if API key exists in localStorage
    const savedApiKey = localStorage.getItem('apiKey');
    if (!savedApiKey) {
      setIsVisible(true);
    } else {
      // If API key exists, pass it to the parent component
      onApiKeySubmit(savedApiKey);
    }
  }, [onApiKeySubmit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      try {
        // Save API key to localStorage
        localStorage.setItem('apiKey', apiKey);
        onApiKeySubmit(apiKey);
        setIsVisible(false);
      } catch (error) {
        console.error('Error saving API key:', error);
        alert('Failed to save API key. Please check if localStorage is enabled.');
      }
    }
  };

  // Add a function to allow users to reset their API key
  const resetApiKey = () => {
    localStorage.removeItem('apiKey');
    setApiKey('');
    setIsVisible(true);
  };

  if (!isVisible) return null;

  return (
    <div className="api-key-overlay">
      <div className="api-key-popup">
        <h2>API Key Required</h2>
        <p>Please enter your API key to use this application.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            required
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyPopup; 