import React, { useState, useEffect } from 'react';
import ReviewRating from './ReviewRating';

/**
 * ReviewModal Component
 *
 * This component renders a modal for creating or editing reviews and replies on a user's profile. 
 *
 * Props:
 * - id: The unique identifier for the review or reply being edited, used when saving.
 * - onSave: Function to handle saving the text. It is called with the entered text and the id.
 * - onClose: Function to close the modal without saving.
 * - initialText: The initial text to display in the text area, useful for editing existing reviews or replies.
 * - parentText: The text of the parent review, if the modal is used for writing a reply.
 */
const ReviewModal = ({ id, onSave, onClose, initialText, parentText }) => {
  const [text, setText] = useState(initialText || '');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
        if (isDirty && text !== initialText) {
            e.preventDefault();
            e.returnValue = '';
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
}, [isDirty, text, initialText]);

  useEffect(() => {
    setIsDirty(false);
  }, [initialText]);

  const handleClose = () => {
    if (isDirty && text !== initialText) {
      const confirmClose = window.confirm("Du hast ungespeicherte Änderungen. Bist du sicher, dass du schließen möchtest?");
      if (confirmClose) {
        onClose();
      }
    } else {
      onClose();
    }
  };
  
  const handleSave = () => {
    onSave(text, id);
    setIsDirty(false);
  };

  const handleChange = (e) => {
    setText(e.target.value);
    setIsDirty(e.target.value !== initialText);
  };

  const isReply = !!parentText;

  return (
    <div className="modal-overlay">
      <div className='modal-container'>
        <h2>{isReply ? 'Antwort verfassen' : 'Beitrag verfassen'}</h2>
        <div className='modal-box'>
          {isReply && (
            <div className="reply-to-text">
              <p>Antwort auf:</p>
              {parentText}
            </div>
          )}
          <form className="edit-aboutme-wrapper">
            <textarea
              placeholder={isReply ? 'Schreibe eine Antwort ...' : 'Hinterlasse einen Beitrag ...'}
              value={text}
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

export default ReviewModal;
