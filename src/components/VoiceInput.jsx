import React, { useState, useRef } from 'react';

const VoiceInput = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const recognition = useRef(null);

  if (!recognition.current && 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.webkitSpeechRecognition;
    recognition.current = new SpeechRecognition();
    recognition.current.continuous = false;
    recognition.current.lang = 'en-US';
    recognition.current.interimResults = false;

    recognition.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript); // Pass the voice input to parent
    };

    recognition.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };
  }

  const toggleListening = () => {
    if (isListening) {
      recognition.current.stop();
    } else {
      recognition.current.start();
    }
    setIsListening(!isListening);
  };

  return (
    <button onClick={toggleListening}>
      🎤 {isListening ? "Stop" : "Speak"}
    </button>
  );
};

export default VoiceInput;
