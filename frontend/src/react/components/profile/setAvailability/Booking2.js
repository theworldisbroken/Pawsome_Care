
import React, { useState, useEffect } from 'react';
import { format, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import TimeSlots from './TimeSlots';
import "../../../../layout/style/booking.css"


/**
 * Booking component that allows a user to view and manage their bookings.
 * Users can select dates, add new bookings, and delete existing ones.
 */
function Booking({id, accessToken}) {
  // State for the dates selected by the user.
  const [selectedDates, setSelectedDates] = useState([]);

  // State for the slots that the user intends to book.
  const [selectedSlotsCreate, setSelectedSlotsCreate] = useState([]);

  // State for the slots that the user intends to delete.
  const [selectedSlotsDelete, setSelectedSlotsDelete] = useState([]);

  // State for storing the days which already have bookings.
  const [bookedDays, setBookedDays] = useState([]);

  // State for slots that are booked across all selected dates.
  const [commonSlots, setCommonSlots] = useState([]);

  // State for slots that are booked on some but not all selected dates.
  const [partlyCommonSlots, setPartlyCommonSlots] = useState([]);


  // Fetch the days that have been booked when the component mounts.
  useEffect(() => {
    fetchBookedDays();
  }, []);

  // Fetch common and partly common slots whenever the selected dates change.
  useEffect(() => {
    if (selectedDates.length > 0) {
      findAllBookedSlots(selectedDates);
    } else {
      setCommonSlots([]);
      setPartlyCommonSlots([]);
    }
  }, [selectedDates]);

  // Function to fetch booked days for a specific user.
  const fetchBookedDays = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER+`/slot?creator=${id}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}` // Hier fügen Sie den Token ein
          }
        });
      if (response.ok) {
        const bookings = await response.json();
        const uniqueDays = new Set();
        bookings.forEach(booking => {
          const dateOnly = format(new Date(booking.date), 'yyyy-MM-dd');
          uniqueDays.add(dateOnly);
        });
        const bookedDays = Array.from(uniqueDays).map(day => new Date(day));
        setBookedDays(bookedDays);
      } else {
        console.error('Fehler beim Abrufen der Buchungen');
        setBookedDays([]);
      }
    } catch (error) {
      console.error('Netzwerkfehler', error);
    }
  };

  // Function to fetch booked slots for a specific date.
  const fetchBookedSlots = async (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    try {
      const response = await fetch(process.env.REACT_APP_SERVER + `/slot?creator=${id}&date=${formattedDate}`);
      if (response.ok) {
        const bookings = await response.json();
        const slots = bookings.map(booking => booking.time);
        return slots;
      } else {
        console.error('Fehler beim Abrufen der gebuchten Zeitslots');
        return [];
      }
    } catch (error) {
      console.error('Netzwerkfehler', error);
    }
  };

  // Function to find all booked slots for the selected dates.
  const findAllBookedSlots = async (dates) => {
    const allBookings = await Promise.all(dates.map(date => fetchBookedSlots(date)));
    const commonSlots = findCommonSlots(allBookings);
    const partlyCommonSlots = findPartlyCommonSlots(allBookings);

    setCommonSlots(commonSlots);
    setPartlyCommonSlots(partlyCommonSlots);
  };

  // Function to find slots that are commonly booked on all selected dates.
  const findCommonSlots = (allBookings) => {
    const slotCounts = {};
    allBookings.flat().forEach(slot => {
      slotCounts[slot] = (slotCounts[slot] || 0) + 1;
    });
    return Object.keys(slotCounts).filter(slot => slotCounts[slot] === selectedDates.length);
  };

  // Function to find slots that are booked on some but not all selected dates.
  const findPartlyCommonSlots = (allBookings) => {
    const slotCounts = {};
    const uniqueSlots = new Set();

    allBookings.flat().forEach(slot => {
      uniqueSlots.add(slot);
      slotCounts[slot] = (slotCounts[slot] || 0) + 1;
    });
    return Array.from(uniqueSlots).filter(slot => slotCounts[slot] < selectedDates.length);
  };

  // Handler for when the user changes selected dates.
  const handleDateChange = (selectedDays) => {
    setSelectedDates(selectedDays);
  };

  // Handler for submitting new bookings and deletions.
  const handleSubmit = async () => {
    const bookingDataCreate = {
      creator: id,
      dates: selectedDates.map(date => format(date, 'yyyy-MM-dd')),
      times: selectedSlotsCreate
    };
    const bookingDataDelete = {
      creator: id,
      dates: selectedDates.map(date => format(date, 'yyyy-MM-dd')),
      times: selectedSlotsDelete
    };
    try {

      if (selectedSlotsCreate.length > 0) {
        const response = await fetch(process.env.REACT_APP_SERVER+"/slot", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify(bookingDataCreate)
        });

        if (response.ok) {
          await response.json();
        }
        else {
          console.error('Fehler beim Senden der Buchung');
        }
      }

      if (selectedSlotsDelete.length > 0) {
        const deleteResponse = await fetch(process.env.REACT_APP_SERVER+ "/slot", {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify(bookingDataDelete)
        });

        if (!deleteResponse.ok) throw new Error('Fehler beim Löschen der Buchung.');
      }

      setSelectedSlotsCreate([])
      setSelectedSlotsDelete([])
      findAllBookedSlots(selectedDates);
      fetchBookedDays('654c19df28a9e1d98b15e91b');
    } catch (error) {
      console.error('Netzwerkfehler', error);
    }
  };

  const handleReset = () => {
    setSelectedSlotsCreate([]);
    setSelectedSlotsDelete([]);
    setSelectedDates([])
  };

  // Handler for when a user clicks on a slot.
  const handleSlotClick = (slot, commonSlots) => {
    setSelectedSlotsDelete(prev => {
      if (prev.includes(slot)) {
        return prev.filter(s => s !== slot);
      } else if (commonSlots) {
        return [...prev, slot];
      }
      return prev;
    });
    setSelectedSlotsCreate(prev => {
      if (prev.includes(slot)) {
        return prev.filter(s => s !== slot);
      } else if (!commonSlots) {
        return [...prev, slot];
      }
      return prev;
    });
  };

  // Render the Booking component with DayPicker and TimeSlots components.
  return (
    <div className='booking-body'>
      <div className='booking-container'>
        <label>Verfügbarkeit bearbeiten</label>
        <div className='calendar-timeslots-container'>
          <div className='calendar-legend-container'>
            <div className='calendar-container'>
              <DayPicker
                modifiers={{
                  booked: bookedDays,
                  disabled: { before: startOfDay(new Date()) },
                  today: new Date(),
                }}
                modifiersStyles={{
                  booked: { fontWeight: 'bold' },
                  today: { fontWeight: 'normal' }
                }}
                locale={de}
                weekStartsOn={1}
                mode="multiple"
                selected={selectedDates}
                onSelect={handleDateChange}
              />
            </div>

            <div className='legend-container'>
              <div className='legend-symbol'>
                <span className='test1'></span>
                <span className='test2'></span>
              </div>
              <div className='legend-name'>
                <span className='test3'>Gebuchte Slots</span>
                <span className='test4'>Teilweise Gebuchte Slots</span>
              </div>
            </div>
          </div>

          <div className='timeslots-container'>
            <TimeSlots
              selectedSlotsCreate={selectedSlotsCreate}
              selectedSlotsDelete={selectedSlotsDelete}
              handleSlotClick={handleSlotClick}
              commonSlots={commonSlots}
              partlyCommonSlots={partlyCommonSlots}
            />
          </div>
        </div>

        <button className="save-btn"
          onClick={handleSubmit}>Speichern</button>
        <button className='reset-btn'
          onClick={handleReset}>Zurücksetzen</button>
      </div>
    </div >
  )
}

export default Booking;