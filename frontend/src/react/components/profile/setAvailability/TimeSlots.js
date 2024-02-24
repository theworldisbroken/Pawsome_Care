import React from 'react';
import "../../../../layout/style/booking.css"

/**
 * The TimeSlots component is responsible for rendering time slots for a day in a booking system.
 * It displays each hour of the day and divides it into 15-minute intervals, presenting them as individual slots.
 *
 * Props:
 * - selectedSlots: An array of time slots selected for creation.
 * - handleSlotClick: Function to handle clicks on individual time slots.
 * - slotsStatus: Object containing the status of each slot (active, booked, free).
 */
const TimeSlots = ({
  selectedSlots,
  handleSlotClick,
  handleHourClick,
  slotsStatus
}) => {

  // Function to render slots for each hour in a given range
  const renderHourColumn = (startHour, endHour) => {
    // Generate hours within the specified range
    return [...Array(endHour + 1).keys()].slice(startHour).map(hour => {
      const slots = [];

      // Display the hour heading
      slots.push(<div key={`heading-${hour}`} className="hourHeading clickable-hour" onClick={() => handleHourClick(hour)}><div className='ttetst123'><div>{`${hour}`}</div></div></div>);

      // Generate slots for each 15-minute interval in the hour
      for (let minute = 0; minute < 60; minute += 15) {
        const slot = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

        // Determine if the slot is selected for creation or deletion
        const selectedSlot = selectedSlots.includes(slot);

        // Retrieve the status of the slot (active, booked, free)
        const slotStatus = slotsStatus.hasOwnProperty(slot) ? slotsStatus[slot] : {};
        const isActive = slotStatus ? slotStatus.isActive : false;
        const isBooked = slotStatus ? slotStatus.isBooked : false;
        const isFree = slotStatus ? slotStatus.isFree : true;

        // Determine the class names for the slot based on its status
        let slotClassNames = ["slot"];
        if (isBooked && !isActive && !isFree) {
          slotClassNames.push("booked-slot")
        }
        else {
          if (isActive && !isBooked && !isFree) slotClassNames.push("active-slot");
          if (selectedSlot) slotClassNames.push("click-slot");
        }

        slotClassNames = slotClassNames.join(" ").trim();

        // Render the slot with appropriate styling and click handler
        slots.push(
          <div
            key={slot}
            className={slotClassNames}
            onClick={() => handleSlotClick(slot)}
          >
            {slot}
          </div>
        );
      }

      // Return a column of slots for the hour
      return (
        <div key={`column-${hour}`} className="hourColumn">
          {slots}
        </div>
      );
    });
  };

  // Render time slots for the entire day
  return (
    <div className="timeslots">
      {renderHourColumn(0, 23)}
    </div>
  );
};

export default TimeSlots;
