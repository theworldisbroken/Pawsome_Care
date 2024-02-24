import React, { useState } from 'react';

function CustomTimePicker() {
    const [startHour, setStartHour] = useState(0);
    const [startMinute, setStartMinute] = useState(0);
    const [endHour, setEndHour] = useState(23);
    const [endMinute, setEndMinute] = useState(45);

    const handleHourChange = (value, setter, min, max) => {
        if (value > max) {
            setter(min);
        } else if (value < min) {
            setter(max);
        } else {
            setter(value);
        }
    };

    const handleMinuteChange = (value, setter, min, max, step) => {
        if (value > max) {
            setter(min);
        } else if (value < min) {
            setter(max);
        } else {
            setter(((Math.round(value / step) * step) % (max + step)));
        }
    };

    return (
        <div>
            <div>
                <label>
                    Von: 
                    <input
                        type="number"
                        value={startHour}
                        onChange={(e) => handleHourChange(parseInt(e.target.value), setStartHour, 0, 23)}
                        min="-1"
                        max="24"
                        step="1"
                    />
                </label>
                <label>
                    <input
                        type="number"
                        value={startMinute}
                        onChange={(e) => handleMinuteChange(parseInt(e.target.value), setStartMinute, 0, 45, 15)}
                        min="-1"
                        max="60"
                        step="15"
                    />
                </label>
            </div>
            <div>
                <label>
                    Bis:
                    <input
                        type="number"
                        value={endHour}
                        onChange={(e) => handleHourChange(parseInt(e.target.value), setEndHour, 0, 23)}
                        min="-1"
                        max="24"
                        step="1"
                    />
                </label>
                <label>
                    <input
                        type="number"
                        value={endMinute}
                        onChange={(e) => handleMinuteChange(parseInt(e.target.value), setEndMinute, 0, 45, 15)}
                        min="-1"
                        max="60"
                        step="15"
                    />
                </label>
            </div>
        </div>
    );
}

export default CustomTimePicker;
