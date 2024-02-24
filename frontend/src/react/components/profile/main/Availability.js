import React, { useState, useEffect } from 'react';
import { format, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import editIcon from "../../../../layout/images/icon-edit.png";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

/**
 * Availability Component
 *
 * This component is responsible for displaying the availability calendar for a user's profile. 
 * It shows which days have active slots (available for booking) and which days are fully booked.
 *
 * Props:
 * - profileID: The unique identifier of the user profile for which the availability is being displayed.
 */
function Availability({ isProfileOwner, onEdit, daysWithActiveSlots, daysWithOnlyBookedSlots }) {

  return (
    <div className="availability-wrapper">

      <div className="heading-with-line">
        <h2>Verfügbarkeit</h2>
        <div className="line"></div>
      </div>

      <div className='availability-content'>
        <div className='availability-box'>
          <div className='calendar-display'>
            <DayPicker
              className='availability-rdp'
              modifiers={{
                disabled: { before: startOfDay(new Date()) },
                active: daysWithActiveSlots,
                booked: daysWithOnlyBookedSlots,
              }}
              modifiersStyles={{
                active: { backgroundColor: 'rgb(124, 181, 104, 0.5)' },
                booked: { backgroundColor: 'rgb(198, 124, 124, 0.5)' },
              }}
              disableNavigation
              fromMonth={new Date()}
              numberOfMonths={2}
              locale={de}
              weekStartsOn={1}
              mode="multiple"
            />
          </div>
        </div>
        <div>
          <div className='legend-container'>
            <div>
              <div className='legend-item'>
                <span className='legend-symbol available'></span>
                <span className='legend-text'>Verfügbar</span>
              </div>
              <div className='legend-item'>
                <span className='legend-symbol booked'></span>
                <span className='legend-text'>Ausgebucht</span>
              </div>
              <div className='legend-item'>
                <span className='legend-symbol unavailable'></span>
                <span className='legend-text'>Nicht verfügbar</span>
              </div>
            </div>
          </div>
          <div className="edit-btn">
            {isProfileOwner && (
              <button onClick={onEdit}><img src={editIcon} alt="edit-Icon" width={25} title="Bearbeiten" /></button>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}

export default Availability;