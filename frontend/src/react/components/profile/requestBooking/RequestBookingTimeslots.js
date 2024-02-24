import React from 'react';
import "../../../../layout/style/booking.css"

/**
 * RequestBookingTimeslots is a component used for displaying and interacting with time slots in a booking system.
 * It allows users to view and select available time slots for making a booking.
 *
 * Props:
 * - selectedSlots: Array of slot IDs that are currently selected by the user.
 * - handleSlotClick: Function to handle clicks on individual time slots.
 * - bookedSlots: Array of slot objects representing the slots that are already booked.
 */
const RequestBookingTimeslots = ({
  selectedSlots,
  handleSlotClick,
  handleHourClick,
  bookedSlots,
}) => {

  // Function to render slots for each hour in a given range
  const renderHourColumns = () => {
    // Generate hours within the specified range
    return [...Array(24).keys()].slice(0).map(hour => {
      const slots = [];

      // Display the hour heading
      slots.push(<div key={`heading-${hour}`} className="hourHeading clickable-hour" onClick={() => handleHourClick(hour)}>{`${hour}`}</div>);

      // Generate slots for each 15-minute interval in the hour
      for (let minute = 0; minute < 60; minute += 15) {
        const slotTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        // Find if there's a booked slot matching this time
        const slot = bookedSlots.find(s => s.time === slotTime);
        // Check if the current slot is selected
        const selectedSlot = selectedSlots.includes(slot?._id);

        // Determine the CSS class names based on slot's state
        const slotClassNames = [
          "slot",
          selectedSlot ? "click-slot" : "",
          !slot ? "disabled-slot" : "",
        ].join(" ").trim();

        // Add the slot div to the array
        slots.push(
          <div
            key={slotTime}
            className={slotClassNames}
            onClick={() => handleSlotClick(slot)}
          >
            {slotTime}
          </div>
        );
      }

      // Return a column for each hour with all its slots
      return (
        <div key={`column-${hour}`} className="hourColumn">
          {slots}
        </div>
      );
    });
  };

  // Render the TimeSlots component with navigation buttons
  return (
    <div className="timeslots">
      {renderHourColumns()}
    </div>
  );
};

export default RequestBookingTimeslots;
