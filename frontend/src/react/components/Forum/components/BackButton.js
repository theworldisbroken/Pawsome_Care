import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back one step in history
  };

  return (
    <button className="back-button" onClick={handleGoBack}>
      &lt; Zurück
    </button>
  );
};

export default BackButton;