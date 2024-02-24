import React, { useState, useEffect } from 'react';
import "../../../../layout/style/userProfile.css"

/**
 * AboutMeModal Component
 *
 * This component represents a modal window that allows users to edit their 'About Me' section in the user profile.
 *
 * Props:
 * - initialText: The initial text to be displayed in the modal's textarea.
 * - onSave: A function that will be called when the user clicks the save button.
 * - onClose: A function to close the modal, triggered when the close button is clicked.
 */
const AboutMeModal = ({ initialText, onSave, onClose }) => {
  const [aboutMeText, setAboutMeText] = useState(initialText);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
        if (isDirty && aboutMeText !== initialText) {
            e.preventDefault();
            e.returnValue = '';
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
}, [isDirty, aboutMeText, initialText]);

  useEffect(() => {
    setIsDirty(false);
  }, [initialText]);

  const handleChange = (e) => {
    const newText = e.target.value;
    setAboutMeText(newText);
    setIsDirty(newText !== initialText);
  };

  const handleClose = () => {
    if (isDirty && aboutMeText !== initialText) {
      const confirmClose = window.confirm("Möchtest du das Modal schließen? Alle ungespeicherten Änderungen gehen verloren.");
      if (confirmClose) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    onSave(aboutMeText);
    setIsDirty(false);
  };

  return (
    <div className="modal-overlay">
      <div className='modal-container'>
        <h2>Profilbeschreibung bearbeiten</h2>
        <div className='modal-box'>
          <p className='inbox-heading'>Über mich:</p>
          <form className="edit-aboutme-wrapper">
            <textarea
              placeholder='schreibe über dich ...'
              value={aboutMeText}
              onChange={handleChange}
            />
          </form>
        </div>

        <div>
          <button className="reset-btn" onClick={handleClose}>Zurück</button>
          <button className="save-btn" onClick={handleSave}>Speichern</button>
        </div>
      </div>
    </div>
  );
};

export default AboutMeModal;

