import React, { useState } from 'react';
import ReviewRating from './ReviewRating';

const BookingReviewModal = ({ onSave, onClose, id, receiver }) => {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);

  const [warnings, setWarnings] = useState({
    text: false,
    rating: false,
  });
  const handleSaveClick = () => {
    setWarnings({
      text: !text,
      rating: !rating,
    });
    if (text && rating) {
      onSave(receiver, text, id, rating,);
      onClose();
    }
  };

  const handleRating = (rating) => {
    setWarnings(prev => ({ ...prev, rating: false }));
    setRating(rating)
  };

  const handleText = (text) => {
    setWarnings(prev => ({ ...prev, text: false }));
    setText(text)
  };



  return (
    <div className="modal-overlay">
      <div className='modal-container'>
        <h2>{'Bewertung schreiben'}</h2>
        <div className='modal-box'>
          <div className="star-rating">
            Bewertung:
            <div className={`star-rating ${warnings.rating ? 'red-border' : ''}`}>
            <ReviewRating
              rating={rating}
              setRating={handleRating}
            />
            </div>
          </div>
          <form className="edit-aboutme-wrapper">
            <textarea
              className={`${warnings.text ? 'red-border' : ''}`}
              placeholder={'Schreibe einen Text zur Bewertung'}
              value={text}
              onChange={(e) =>  handleText(e.target.value)}
              onClick={() => setWarnings( {text: false})}
            />
          </form>
        </div>
        <div>
          <button className="reset-btn" onClick={onClose}>Zurück</button>
          <button className="save-btn" onClick={handleSaveClick}>Speichern</button>
        </div>
      </div>
    </div>
  );
};

export default BookingReviewModal;
