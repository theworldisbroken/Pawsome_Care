
import React, { useState, useEffect } from 'react';
import { format, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import TimeSlots from './TimeSlots';
import "../../../../layout/style/booking.css"


/**
 * Booking Component
 *
 * This component is designed for managing and setting the availability of time slots for bookings.
 * It allows a user to select dates and specify the availability of slots on those dates. 
 * The component shows a calendar for date selection and a list of time slots for each selected date. 
 * Users can create new available slots or delete existing ones.
 *
 * Props:
 * - profileID: The ID of the profile whose booking availability is being managed.
 * - accessToken: Token for authentication to perform API requests.
 */
function Booking({ profileID, accessToken, showToast, daysWithActiveSlots, daysWithOnlyBookedSlots, fetchBookedDays }) {
  // State for selected dates and slots for creation and deletion
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);

  // State for active and booked days, as well as the status of slots
  const [slotsStatus, setSlotsStatus] = useState({});

  const [isDirty, setIsDirty] = useState(false);
  const [warnings, setWarnings] = useState({
    date: false,
    slots: false,
  });

  // Fetch booked days when component mounts
  useEffect(() => {
    fetchBookedDays();
  }, []);

  // Fetch booked slots when selected dates change
  useEffect(() => {
    setSlotsStatus({})
    if (selectedDates.length > 0) fetchBookedSlots(selectedDates);
  }, [selectedDates]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && (selectedDates.length >= 1 || selectedSlots.length >= 1)) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, selectedDates, selectedSlots]);

  // Fetch booked slots for selected dates
  const fetchBookedSlots = async (dates) => {
    const queryParams = dates.map(date => `date=${format(date, 'yyyy-MM-dd')}`).join('&');
    try {
      const response = await fetch(process.env.REACT_APP_SERVER + `/slot?creator=${profileID}&${queryParams}`);
      if (response.ok) {
        const bookings = await response.json();
        updateSlots(bookings);
      } else {
        console.error('Fehler beim Abrufen der gebuchten Zeitslots');
        return [];
      }
    } catch (error) {
      console.error('Netzwerkfehler', error);
    }
  };

  // Update slots status based on fetched data
  const updateSlots = (bookings) => {
    // Initialize an object to keep track of counts for each time slot
    let temporaryCounts = {};

    // Iterate through each booking
    for (const booking of bookings) {
      const { time, status } = booking;

      // Initialize the count object for a time slot if it doesn't exist
      if (!temporaryCounts[time]) {
        temporaryCounts[time] = { activeCount: 0, bookedCount: 0 };
      }

      // Increment the count based on the booking status
      if (status === 'active') {
        temporaryCounts[time].activeCount += 1;
      } else {
        temporaryCounts[time].bookedCount += 1;
      }
    }

    // Process the counts to determine the status of each slot
    const newStatus = {};
    Object.keys(temporaryCounts).forEach(slot => {
      newStatus[slot] = {
        isActive: temporaryCounts[slot].activeCount > 0, // Slot is active if there's at least one active booking
        isBooked: temporaryCounts[slot].bookedCount > 0, // Slot is booked if there's at least one booked booking
        isFree: temporaryCounts[slot].activeCount + temporaryCounts[slot].bookedCount < selectedDates.length // Slot is free if the sum of active and booked is less than the number of selected dates
      };
    });
    setSlotsStatus(newStatus);
  };

  // Handle form submission to create or delete slots
  const handleSubmit = async () => {

    if (!validateBooking()) {
      showToast("Fehlende Angaben");
    }
    else {
      const slotsData = {
        creator: profileID,
        dates: selectedDates.map(date => format(date, 'yyyy-MM-dd')),
        times: selectedSlots
      };
      try {
        const response = await fetch(process.env.REACT_APP_SERVER + "/slot/manageSlots", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(slotsData)
        });

        if (response.ok) {
          const results = await response.json();
          const createCount = results.created;
          const deleteCount = results.deleted;

          let message = '';
          if (createCount === 1 && deleteCount > 0) {
            message = `${createCount} neuen Slot erstellt und ${deleteCount} gelöscht`;
          }
          else if (createCount >= 2 && deleteCount > 0) {
            message = `${createCount} neue Slots erstellt und ${deleteCount} gelöscht`;
          }
          else if (createCount === 1) {
            message = `${createCount} neuen Slot erstellt`;
          }
          else if (createCount >= 2) {
            message = `${createCount} neue Slots erstellt`;
          }
          else if (deleteCount === 1) {
            message = `${deleteCount} Slot gelöscht`;
          }
          else if (deleteCount >= 2) {
            message = `${deleteCount} Slots gelöscht`;
          }
          else {
            message = 'Keine Änderungen vorgenommen';
          }
          showToast(message);
        }
        else {
          showToast("Ein Fehler ist aufgetreten");
        }
        handleReset()
      } catch (error) {
        console.error('Netzwerkfehler', error);
      }
    }
  };

  // Reset all selections and states
  const handleReset = () => {
    setSelectedSlots([]);
    setSelectedDates([])
    setSlotsStatus({})
    fetchBookedDays(profileID);
    setWarnings({
      date: false,
      slots: false,
    });
    setIsDirty(false);
  };

  // Handle changing of dates in calendar
  const handleDateChange = (selectedDays) => {
    setSelectedDates(selectedDays);
    setWarnings(warn => ({ ...warn, date: false }));
    setIsDirty(true);
  };

  // Handle slot selection and deselection
  const handleSlotClick = (slot) => {
    setSelectedSlots(prevSlots => {
      const isSlotSelected = prevSlots.includes(slot);
      setWarnings(warn => ({ ...warn, slots: false }));
      if (isSlotSelected) {
        return prevSlots.filter(s => s !== slot);
      } else {
        setIsDirty(true);
        return [...prevSlots, slot];
      }
    });
  };


  const handleHourClick = (hour) => {
    const hourSlots = [];
    for (let minute = 0; minute < 60; minute += 15) {
      hourSlots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }

    setSelectedSlots(prevSlots => {
      const allSelected = hourSlots.every(slot => prevSlots.includes(slot));
      setWarnings(warn => ({ ...warn, slots: false }));
      if (allSelected) {
        return prevSlots.filter(s => !hourSlots.includes(s));
      } else {
        const newSlots = hourSlots.filter(slot => !prevSlots.includes(slot));
        setIsDirty(true);
        return [...prevSlots, ...newSlots];
      }
    });
  };



  const validateBooking = () => {
    let isValid = true;
    setWarnings({
      date: selectedDates.length === 0,
      slots: selectedSlots.length === 0,
    });

    if (selectedDates.length === 0 || selectedSlots.length === 0) {
      isValid = false;
    }
    return isValid;
  };

  return (

    <div className='set-availability-wrapper'>

      <div className="heading-with-line">
        <h2>Verfügbarkeit bearbeiten</h2>
        <div className="line"></div>
      </div>

      <div className='set-availability-content'>

        <div className={`content-box calendar-container ${warnings.date ? 'red-border' : ''}`}>
          <DayPicker
            className='booking-rdp'
            modifiers={{
              active: daysWithActiveSlots,
              booked: daysWithOnlyBookedSlots,
              disabled: { before: startOfDay(new Date()) },
            }}
            modifiersStyles={{
              active: { outline: '2px solid rgb(124, 181, 104)' },
              booked: { outline: '2px solid rgb(198, 124, 124)' },
            }}
            disableNavigation
            numberOfMonths={2}
            locale={de}
            weekStartsOn={1}
            mode="multiple"
            selected={selectedDates}
            onSelect={handleDateChange} />
        </div>

        <div className='legend-container'>
          <div>
            <div className='legend-item'>
              <span className='legend-symbol setAvailable'></span>
              <span className='legend-text'>Verfügbar</span>
            </div>
            <div className='legend-item'>
              <span className='legend-symbol setBooked'></span>
              <span className='legend-text'>Ausgebucht</span>
            </div>
            <div className='legend-item'>
              <span className='legend-symbol unavailable'></span>
              <span className='legend-text'>Nicht verfügbar</span>
            </div>
          </div>
          <div>
            <p>
              Wähle die Tage und die Uhrzeiten, an denen du verfügbar bist.
              <br/>
              Ein Zeitslot = 15min
            </p>
          </div>
        </div>

        <div className={`timeslots-container content-box ${warnings.slots ? 'red-border' : ''}`}>
          <TimeSlots
            selectedSlots={selectedSlots}
            handleSlotClick={handleSlotClick}
            handleHourClick={handleHourClick}
            slotsStatus={slotsStatus}
          />
        </div>
        <button className='reset-btn'
          onClick={handleReset}>Zurücksetzen</button>

        <button className="save-btn"
          onClick={handleSubmit}>Speichern</button>

      </div>

    </div>
  )
}

export default Booking;