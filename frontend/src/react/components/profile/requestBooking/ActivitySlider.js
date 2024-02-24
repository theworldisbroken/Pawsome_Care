import React, { useState, useEffect } from 'react';

/**
 * ActivitySlider component for adjusting the weight distribution between two activities.
 * 
 * Props:
 * - selectedActivities: An object containing the activities that have been selected.
 * - onWeightChange: Function to handle changes in the weight distribution of activities.
 */
function ActivitySlider({ selectedActivities, onWeightChange }) {
    const [weights, setWeights] = useState({});

    useEffect(() => {
        const selectedKeys = Object.keys(selectedActivities).filter(key => selectedActivities[key]);
        const equalWeight = 100 / selectedKeys.length;
        const newWeights = selectedKeys.reduce((acc, key) => {
            acc[key] = equalWeight;
            return acc;
        }, {});

        setWeights(newWeights);
    }, [selectedActivities]);

    const handleOnChange = (e) => {
        let value = parseInt(e.target.value, 10);
        if (value === 100) {
            e.target.value = 90;
            value = 90;
        }

        const selectedKeys = Object.keys(weights);
        if (selectedKeys.length === 2) {
            const [first, second] = selectedKeys;
            const newWeights = {
                ...weights,
                [first]: value,
                [second]: 100 - value,
            };

            setWeights(newWeights);
            onWeightChange(newWeights);
        }
    };

    const selectedKeys = Object.keys(weights);
    if (selectedKeys.length < 2) {
        return null; 
    }

    return (
        <div class="activity-slider-container">
            <datalist id="custom-list">
                <option value="0"></option>
                <option value="10"></option>
                <option value="20"></option>
                <option value="30"></option>
                <option value="40"></option>
                <option value="50"></option>
                <option value="60"></option>
                <option value="70"></option>
                <option value="80"></option>
                <option value="90"></option>
                <option value="100"></option>

            </datalist>
            <input
                type="range"
                min="10"
                max="100"
                step="10"
                list="custom-list"
                onChange={handleOnChange}
            />
            <div>
            <span>{weights[selectedKeys[0]]}% {selectedKeys[0]}</span>
            <span>{weights[selectedKeys[1]]}% {selectedKeys[1]}</span>
            </div>
        </div>
    );
}

export default ActivitySlider;