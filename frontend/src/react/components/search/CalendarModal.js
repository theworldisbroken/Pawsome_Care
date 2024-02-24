import { DayPicker } from 'react-day-picker';
import React, { useState } from 'react';
import { format, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
const CalendarModal = ({ dates, setDates, onSave, onClose }) => {

  const [selectedDates, setSelectedDates] = useState(dates);

  const handleSave = () => {
    setDates(selectedDates)
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const handleDateChange = (range) => {
    if (!range) {
      setSelectedDates({ from: undefined, to: undefined });
      return;
    }
    if (range.from && range.to) {
      if (range.from.toDateString() === range.to.toDateString()) {
        setSelectedDates({ from: undefined, to: undefined });
      } else {
        setSelectedDates(range);
      }
    } else {
      setSelectedDates({ from: range.from, to: undefined });
    }
  }

  return (
    <div className="modal-overlay">

      <div className='modal-container'>
        <div className='modal-box'>
          <DayPicker
            className='booking-rdp'
            modifiers={{
              disabled: { before: startOfDay(new Date()) },
              today: new Date(),

            }}
            modifiersStyles={{
              today: { fontWeight: 'normal' }
            }}
            disableNavigation
            fromMonth={new Date()}
            numberOfMonths={2}
            locale={de}
            weekStartsOn={1}
            mode="range"
            selected={selectedDates}
            onSelect={handleDateChange}
          />
        </div>
        <div>
          <button className="reset-btn" onClick={handleClose}>Zurück</button>
          <button className="save-btn" onClick={handleSave}>Speichern</button>
        </div>
      </div>

    </div>
  );
};

export default CalendarModal;