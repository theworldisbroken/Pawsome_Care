import React, { useState, useEffect } from 'react';
import { format, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import RequestBookingTimeslots from './RequestBookingTimeslots';
import ActivitySlider from './ActivitySlider'
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import PetPassModalBooking from './PetPassModalBooking';
import RequestBookingMap from './RequestBookingMap';
import GoogleMapsWrapper from '../../../GoogleMapsWrapper';
import RequestBookingConfirmation from './RequestBookingConfirmation';

/**
 * RequestBooking is a component that allows users to request a booking for pet care services.
 * It includes features such as selecting a date, time slots, pet passes, and activities,
 * and also provides a field for additional notes and displays the total price for the requested services.
 *
 * Props:
 * - profileID: The ID of the profile offering the services.
 * - profileData: Data about the service provider, including available services and pricing.
 * - accessToken: Token for API authorization.
 * - userID: The ID of the user making the booking request.
 */
function RequestBooking({ profileID, profileData, accessToken, userID, showToast }) {
    // State for managing various aspects of the booking process
    const [bookedDays, setBookedDays] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [petPasses, setPetPasses] = useState([]);
    const [isPetPassModalOpen, setIsPetPassModalOpen] = useState(false);
    const [mapModal, setMapModal] = useState(false);

    const [selectedPetPasses, setSelectedPetPasses] = useState([]);
    const [selectedDate, setSelectedDate] = useState();
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [selectedActivities, setSelectedActivities] = useState({});
    const [notes, setNotes] = useState('');

    const [selectedLocation, setSelectedLocation] = useState(null);
    const [activityWeights, setActivityWeights] = useState({});
    const [userData, setUserData] = useState('');

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const [warnings, setWarnings] = useState({
        date: false,
        slots: false,
        activities: false,
        petPasses: false,
        location: false,
    });

    const { cat, dog } = profileData;

    // Fetch available days for booking and petpasses when the component mounts
    useEffect(() => {
        fetchBookedDays();
        fetchPetPasses()
        fetchUserData()
    }, []);

    // Function to fetch days with available slots from the API
    const fetchBookedDays = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_SERVER + `/slot?creator=${profileID}&status=active`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (response.ok) {
                const bookings = await response.json();
                const uniqueDays = new Set();

                // Iterate through each booking
                bookings.forEach(booking => {
                    // Extract just the date part from the booking date
                    const dateOnly = format(new Date(booking.date), 'yyyy-MM-dd');
                    // Add the date 
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

    // Function to fetch time slots for a selected date
    const fetchBookedSlots = async (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        try {
            const response = await fetch(process.env.REACT_APP_SERVER + `/slot?creator=${profileID}&date=${formattedDate}&status=active`);
            if (response.ok) {
                const bookings = await response.json();
                setBookedSlots(bookings);
                console.log(bookings)
            } else {
                console.error('Fehler beim Abrufen der gebuchten Zeitslots');
                return [];
            }
        } catch (error) {
            console.error('Netzwerkfehler', error);
        }
    };

    // Fetch pet passes associated with the user
    const fetchPetPasses = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_SERVER+`/petpass/${userID}`);
            if (response.ok) {
                const allPetPasses = await response.json();
                const filteredPetPasses = allPetPasses.filter(petPass => {
                    return (petPass.type === 'Katze' && cat) || (petPass.type === 'Hund' && dog);
                });
                setPetPasses(filteredPetPasses);
            } else {
                console.error('Fehler beim Abrufen der gebuchten Zeitslots');
                setPetPasses([]);
            }
        } catch (error) {
            console.error('Netzwerkfehler', error);
        }
    };

    // Fetch pet passes associated with the user
    const fetchUserData = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_SERVER + `/profile/${userID}`);
            if (response.ok) {
                const userData = await response.json();
                setUserData(userData);
            } else {
                console.error('Fehler beim Abrufen der gebuchten Zeitslots');
            }
        } catch (error) {
            console.error('Netzwerkfehler', error);
        }
    };

    // Function to toggle the selection of pet passes
    const handlePetPasses = (selectedPetPasses) => {
        setSelectedPetPasses(selectedPetPasses);
        setIsPetPassModalOpen(false)
        setWarnings(prev => ({ ...prev, petPasses: false }));
        showToast("Haustiere gespeichert")
    };


    const handleSaveLocation = async (newLocation) => {
        setSelectedLocation(newLocation);
        setMapModal(false);
        setWarnings(prev => ({ ...prev, location: false }));
        showToast("Treffpunkt gespeichert")
    };


    // Handle date selection change
    const handleDateChange = (selectedDate) => {
        setSelectedSlots([]);
        setBookedSlots([])
        if (selectedDate) {
            setSelectedDate(selectedDate);
            fetchBookedSlots(selectedDate);
            setWarnings(prev => ({ ...prev, date: false }));
        }
        else {
            setSelectedDate(undefined);
        }
    };

    // Handle time slot selection
    const handleSlotClick = (slot) => {
        setSelectedSlots(prev => {
            const updatedSlots = prev.includes(slot._id) ? prev.filter(s => s !== slot._id) : [...prev, slot._id];
            setWarnings(warn => ({ ...warn, slots: false }));
            return updatedSlots;
        });
    };

    const handleHourClick = (hour) => {
        const hourSlots = [];
        for (let minute = 0; minute < 60; minute += 15) {
            const slotTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            const slot = bookedSlots.find(s => s.time === slotTime);
            if (slot) hourSlots.push(slot._id);
        }
        const allSelected = hourSlots.every(slotId => selectedSlots.includes(slotId));

        setSelectedSlots(prev => {
            if (allSelected) {
                return prev.filter(slotId => !hourSlots.includes(slotId));
            } else {
                return Array.from(new Set([...prev, ...hourSlots]));
            }
        });
    };


    const areSlotsConsecutive = (selectedSlots) => {
        const convertTimeToMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const sortedTimeSlots = selectedSlots
            .map(id => bookedSlots.find(slot => slot._id === id))
            .sort((a, b) => convertTimeToMinutes(a.time) - convertTimeToMinutes(b.time));

        for (let i = 1; i < sortedTimeSlots.length; i++) {
            const timeDiff = convertTimeToMinutes(sortedTimeSlots[i].time) - convertTimeToMinutes(sortedTimeSlots[i - 1].time);
            if (timeDiff !== 15) {
                setWarnings(warn => ({ ...warn, slots: true }));
                return false;
            }
        }
        return true;
    };

    const handleOpenConfirmModal = () => {
        const isBookingValid = validateBooking();
        const areSlotsInOrder = areSlotsConsecutive(selectedSlots);

        if (isBookingValid && areSlotsInOrder) {
            setIsConfirmModalOpen(true);
        } else {
            let toastMessage = "";
            if (!areSlotsInOrder && !isBookingValid) {
                toastMessage = "Fehlende Angaben und Zeitslots sind nicht aufeinanderfolgend";
            } else if (!isBookingValid) {
                toastMessage = "Fehlende Angaben";
            } else if (!areSlotsInOrder) {
                toastMessage = "Du kannst nur aufeinanderfolgende Zeitslots wählen!";
            }
            showToast(toastMessage);
        }
    };
    // Handle changes in selected activities
    /*     const handleActivityChange = (activity) => {
            // Update the selected activities based on user interaction
            setSelectedActivities(prevActivities => {
                // Toggle the activity's selected status
                const updatedActivities = { ...prevActivities, [activity]: !prevActivities[activity] };
                // Get keys of activities that are selected
                const selectedActivityKeys = Object.keys(updatedActivities).filter(key => updatedActivities[key]);
                // Count the number of selected activities
                const selectedActivityCount = selectedActivityKeys.length;
    
                // If more than 2 activities are selected, revert to previous state
                if (selectedActivityCount > 2) {
                    return prevActivities;
                }
    
                // If only one activity is selected, set its weight to 100%
                if (selectedActivityCount === 1) {
                    setActivityWeights({ [selectedActivityKeys[0]]: 100 });
                }
                // If two activities are selected, split their weights equally
                else if (selectedActivityCount === 2) {
                    const equalWeight = 50;
                    const newWeights = {};
                    selectedActivityKeys.forEach(key => {
                        newWeights[key] = equalWeight;
                    });
                    setActivityWeights(newWeights);
                }
                // If no activities are selected, reset the weights
                else {
                    setActivityWeights({});
                }
                return updatedActivities;
            });
        }; */

    const handleActivityChange = (activity) => {
        // Set the selected activity
        setSelectedActivities({ [activity]: true });

        // Set the weight of the selected activity to 100%
        setActivityWeights({ [activity]: 100 });

        setWarnings(prev => ({ ...prev, activities: false }));
    };

    // Calculate the total price for the selected services
    const calculateTotalPrice = () => {
        // Calculate total minutes of all selected slots (each slot is 15 minutes)
        const totalMinutes = selectedSlots.length * 15;
        let totalPrice = 0;

        // Iterate through each selected activity
        Object.entries(selectedActivities).forEach(([activity, isSelected]) => {
            if (isSelected) {
                // Calculate the weight for this activity
                const weight = activityWeights[activity] / 100;
                // Retrieve the price per hour for this activity from profile data
                const activityPricePerHour = profileData[activity].price;
                // Calculate the price for this activity based on total minutes and weight
                const priceForActivity = totalMinutes * weight * (activityPricePerHour / 60);
                // Add the price for this activity to the total price
                totalPrice += priceForActivity;
            }
        });

        // Return the total price rounded to two decimal places
        return totalPrice.toFixed(2);
    };
    // Execute the function to calculate the total price
    const totalPrice = calculateTotalPrice();


    const validateBooking = () => {
        let isValid = true;
        setWarnings({
            date: !selectedDate,
            slots: selectedSlots.length === 0,
            activities: Object.keys(selectedActivities).length === 0,
            petPasses: selectedPetPasses.length === 0,
            location: !selectedLocation,
        });

        if (!selectedDate || selectedSlots.length === 0 ||
            Object.keys(selectedActivities).length === 0 ||
            selectedPetPasses.length === 0 || !selectedLocation) {
            isValid = false;
        }

        return isValid;
    };

    const calculateBookingDuration = (selectedSlots) => {
        const convertTimeToDate = (slot) => {
            const [hours, minutes] = slot.time.split(':').map(Number);
            const slotDate = new Date(slot.date);
            slotDate.setHours(hours, minutes);
            return slotDate;
        };

        const sortedTimeSlots = selectedSlots
            .map(id => bookedSlots.find(slot => slot._id === id))
            .map(convertTimeToDate)
            .sort((a, b) => a - b);

        if (sortedTimeSlots.length === 0) {
            return { start: null, end: null };
        }

        const startDate = sortedTimeSlots[0];
        const endDate = new Date(sortedTimeSlots[sortedTimeSlots.length - 1]);

        // Add 15 minutes to the end date for the last slot
        endDate.setMinutes(endDate.getMinutes() + 15);

        return {
            start: startDate,
            end: endDate
        };
    };

    // Handle sending the booking request to the server
    const handleSendBooking = async () => {
        const bookingData = {
            bookedBy: userID,
            slots: selectedSlots,
            activities: Object.entries(selectedActivities)
                .filter(([_, isSelected]) => isSelected)
                .map(([activity]) => ({
                    activity,
                    weight: activityWeights[activity],
                })),
            petPasses: selectedPetPasses.map(petPass => petPass._id),
            notes: notes,
            location: selectedLocation,
        };

        try {
            const response = await fetch(process.env.REACT_APP_SERVER+ "/booking", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(bookingData),
            });

            if (response.ok) {
                const result = await response.json();
                resetBookingForm();
                showToast("Angefragt")
            }
            else {
                showToast("Ein Fehler ist aufgetreten")
            }


        } catch (error) {
            console.error('Es gab einen Fehler beim Senden der Bestellung:', error);
        }
    };

    const resetBookingForm = () => {
        setIsConfirmModalOpen(false);
        setBookedSlots([]);
        setIsPetPassModalOpen(false);
        setMapModal(false);
        setSelectedPetPasses([]);
        setSelectedDate(undefined);
        setSelectedSlots([]);
        setSelectedActivities({});
        setNotes('');
        setSelectedLocation(null);
        setActivityWeights({});
        setWarnings({
            date: false,
            slots: false,
            activities: false,
            petPasses: false,
            location: false,
        });
    };

    return (

        <div className='request-service-wrapper'>

            <div className="heading-with-line">
                <h2>Service anfragen</h2>
                <div className="line"></div>
            </div>

            <div className='request-service-content'>

                <div className={`content-box calendar-container ${warnings.date ? 'red-border' : ''}`}>
                    <DayPicker
                        className='booking-rdp'
                        modifiers={{
                            booked: bookedDays,
                            disabled: [
                                { before: startOfDay(new Date()) },
                                day => !bookedDays.some(bookedDay =>
                                    format(bookedDay, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                                )
                            ],
                            today: new Date(),
                        }}
                        locale={de}
                        weekStartsOn={1}
                        mode="single"
                        onSelect={handleDateChange}
                        selected={selectedDate}
                    />
                </div>

                <div className='selection-container'>
                    <div className='location-selection'>
                        <h3>Treffpunkt auswählen</h3>
                        <div className='location-field'>
                            <button className={`add-btn ${warnings.location ? 'red-border' : ''}`} onClick={() => setMapModal(true)}>+</button>
                            {selectedLocation && (
                                <p>{selectedLocation.address}</p>
                            )}
                            {mapModal && (
                                <GoogleMapsWrapper>
                                    <RequestBookingMap
                                        profileData={profileData}
                                        userData={userData}
                                        onSave={handleSaveLocation}
                                        onClose={() => setMapModal(false)}
                                        location={selectedLocation}
                                    />
                                </GoogleMapsWrapper>
                            )}
                        </div>
                    </div>
                    <div className='petpass-selection'>
                        <h3>Haustier/e auswählen</h3>
                        <div className="petpass-names-container">
                            <button className={`add-btn ${warnings.petPasses ? 'red-border' : ''}`} onClick={() => setIsPetPassModalOpen(true)}>+</button>
                            {selectedPetPasses.map(petPass => petPass.name).join(', ')}
                        </div>

                        {isPetPassModalOpen && (
                            <PetPassModalBooking
                                onClose={() => setIsPetPassModalOpen(false)}
                                petPasses={petPasses}
                                setPetPasses={setPetPasses}
                                selectedPetPasses={selectedPetPasses}
                                setSelectedPetPasses={handlePetPasses}
                                userID={userID}
                                accessToken={accessToken}
                                showToast={showToast}
                            />
                        )}
                    </div>
                    <div className='service-selection'>
                        <h3>Service auswählen</h3>
                        <div className='service-selection-selection'>
                            {profileData.hausbesuch.offered && (
                                <>
                                    <input
                                        id="hausbesuch"
                                        type="checkbox"
                                        checked={selectedActivities['hausbesuch'] || false}
                                        onChange={() => handleActivityChange('hausbesuch')}
                                    />
                                    <label htmlFor="hausbesuch" className={`${warnings.activities ? 'red-border' : ''}`}>Hausbesuch</label>
                                </>
                            )}
                            {profileData.gassi.offered && (
                                <>
                                    <input
                                        id="gassi"
                                        type="checkbox"
                                        checked={selectedActivities['gassi'] || false}
                                        onChange={() => handleActivityChange('gassi')}
                                    />
                                    <label htmlFor="gassi" className={`${warnings.activities ? 'red-border' : ''}`}>Gassi</label>
                                </>
                            )}
                            {profileData.training.offered && (
                                <>
                                    <input
                                        id="training"
                                        type="checkbox"
                                        checked={selectedActivities['training'] || false}
                                        onChange={() => handleActivityChange('training')}
                                    />
                                    <label htmlFor="training" className={`${warnings.activities ? 'red-border' : ''}`}>Training</label>
                                </>
                            )}

                            {profileData.herberge.offered && (
                                <>
                                    <input
                                        id="herberge"
                                        type="checkbox"
                                        checked={selectedActivities['herberge'] || false}
                                        onChange={() => handleActivityChange('herberge')}
                                    />
                                    <label htmlFor="herberge" className={`${warnings.activities ? 'red-border' : ''}`}>Herberge</label>
                                </>

                            )}
                            {profileData.tierarzt.offered && (
                                <>
                                    <input
                                        id="tierarzt"
                                        type="checkbox"
                                        checked={selectedActivities['tierarzt'] || false}
                                        onChange={() => handleActivityChange('tierarzt')}
                                    />
                                    <label htmlFor="tierarzt" className={`${warnings.activities ? 'red-border' : ''}`}>Tierarzt</label>
                                </>

                            )}
                        </div>
                    </div>
                    <ActivitySlider
                        selectedActivities={selectedActivities}
                        onWeightChange={setActivityWeights}
                    />
                    <div className='notes-field'>
                        <h3 htmlFor="notes">Sonstiges</h3>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Füge Details hinzu... (z.B. Krankheit, besondere Pflege, usw.)"
                        />
                    </div>
                </div>

                <div className={`content-box timeslots-container ${warnings.slots ? 'red-border' : ''}`}>
                    {<RequestBookingTimeslots
                        selectedSlots={selectedSlots}
                        handleSlotClick={handleSlotClick}
                        handleHourClick={handleHourClick}
                        bookedSlots={bookedSlots}
                    />}
                </div>

            </div>
            <div className='total-price'>
                <p>Gesamtpreis: {totalPrice}€</p>

                <button
                    className={`save-btn`}
                    onClick={handleOpenConfirmModal}>
                    Auftrag senden
                </button>
                {isConfirmModalOpen &&
                    <RequestBookingConfirmation
                        onClose={() => setIsConfirmModalOpen(false)}
                        onSave={handleSendBooking}
                        slots={calculateBookingDuration(selectedSlots)}
                        date={selectedDate}
                        activities={selectedActivities}
                        petPasses={selectedPetPasses}
                        notes={notes}
                        location={selectedLocation}
                        profileData={profileData}
                        totalPrice={totalPrice}
                    />}
            </div>
        </div>
    )
}

export default RequestBooking;
