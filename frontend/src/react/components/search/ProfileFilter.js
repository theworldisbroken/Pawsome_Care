import React, { useState, useEffect, useRef } from 'react';
import 'react-day-picker/dist/style.css';
import "../../../layout/style/booking.css"
import CalendarModal from "./CalendarModal"
import CustomTimePicker from './CustomTimePicker';
import GooglePlacesAutocomplete, { geocodeByAddress } from 'react-google-places-autocomplete';
import { format, startOfDay } from 'date-fns';


/**
 * ProfileFilter component for filtering profiles based on various criteria.
 * 
 * Props:
 * - onSubmit: Function to handle the submission of filters.
 */
const ProfileFilter = ({ onSubmit, location, setLocation, handleReset, address }) => {
  const [services, setServices] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectedDates, setSelectedDates] = useState({ from: null, to: null });
  const [sortOption, setSortOption] = useState('active');
  const [calendarModal, setCalendarModal] = useState(false);

  useEffect(() => {
    submitFilters();
  }, [services, pets, selectedDates, location?.topLeft, sortOption]);


  const petNames = {
    dog: 'Hund',
    cat: 'Katze'
  };

  const activityNames = {
    hausbesuch: "Hausbesuch",
    gassi: "Gassi",
    training: "Training",
    tierarzt: "Tierarzt",
    herberge: "Herberge"
  }

  const submitFilters = () => {
    onSubmit({ services, pets, selectedDates, location }, sortOption);
  };

  const handleLocationChange = async (value) => {
    try {
      if (!value || !value.value || !value.value.place_id) {
        console.error('Keine gültige place_id gefunden');
        return;
      }
      const results = await geocodeByAddress(value.label);
      if (results.length > 0) {
        setLocation({
          ...location,
          center: [results[0].geometry.location.lat(), results[0].geometry.location.lng()],
          zoom: 11
        });
      }
    } catch (error) {
      console.error('Fehler beim Geocoding: ', error);
    }
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleServiceChange = (event) => {
    const { name, checked } = event.target;
    setServices(prevServices =>
      checked ? [...prevServices, name] : prevServices.filter(service => service !== name)
    );
  };

  const handlePetChange = (event) => {
    const { name, checked } = event.target;
    setPets(prevPets =>
      checked ? [...prevPets, name] : prevPets.filter(pet => pet !== name)
    );
  };

  const formatDateRange = () => {
    if (!selectedDates.from) return '';

    const from = format(selectedDates.from, 'dd.MM.yyyy');
    const to = selectedDates.to ? format(selectedDates.to, 'dd.MM.yyyy') : '';
    if (!to) return `${from}`
    return `${from} - ${to}`;
  };


  return (
    <div className="filter-wrapper">
      <h3>Filtern und Sortieren</h3>
      <div className='filter-input'>

        <div>

          <div className='sort-by'>
            <legend>Sortieren nach</legend>
            <div className="sort-option">
              <input type="radio" id="active" name="sort" value="active" onChange={handleSortChange} checked={sortOption === 'active'} />
              <label htmlFor="active">Zuletzt aktiv</label>
            </div>
            <div className="sort-option">
              <input type="radio" id="popularity" name="sort" value="popularity" onChange={handleSortChange} checked={sortOption === 'popularity'} />
              <label htmlFor="likes">Beliebtheit</label>
            </div>
            <div className="sort-option">
              <input type="radio" id="distance" name="sort" value="distance" onChange={handleSortChange} checked={sortOption === 'distance'} />
              <label htmlFor="distance">Entfernung</label>
            </div>
            <div className="sort-option">
              <input type="radio" id="rating" name="sort" value="rating" onChange={handleSortChange} checked={sortOption === 'rating'} />
              <label htmlFor="rating">Beste Bewertung</label>
            </div>
          </div>

          <div className='location'>
            <legend>Ort:</legend>
            <GooglePlacesAutocomplete

              apiOptions={{ language: 'de', region: 'de' }}
              autocompletionRequest={{
                componentRestrictions: {
                  country: ['de'],
                }
              }}
              selectProps={{
                value: "test",
                placeholder: address,
                onChange: handleLocationChange,
                onMenuOpen: handleReset,
                onFocus: handleReset,
                styles: {
                  indicatorsContainer: (provided) => ({
                    ...provided,
                    display: 'none',
                  }),
                  input: (provided) => ({
                    ...provided,
                    fontSize: '12px',
                  }),
                  option: (provided) => ({
                    ...provided,
                    fontSize: '12px',
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    fontSize: '12px',
                  }),
                  control: (provided) => ({
                    ...provided,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    minHeight: '0px'
                  }),
                  menu: (provided) => ({
                    ...provided,
                    fontSize: '12px',
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    fontSize: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }),
                  valueContainer: (provided) => ({
                    ...provided,
                    overflow: 'hidden',
                  }),
                },
              }}
              types={['postal_code']}
              styles={{
                textInput: {
                  borderColor: 'orange',
                  fontSize: 20
                }
              }}
            />
          </div>

          <div className='time-period'>
            <legend htmlFor="date-input">Zeitraum:</legend>
            <input
              type="text"
              id="date-input"
              name="date-input"
              value={formatDateRange()}
              onFocus={() => setCalendarModal(true)}
              readOnly
            />

          </div>

          <div className='pets'>
            <legend>Haustiere</legend>
            {Object.entries(petNames).map(([key, value]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  name={key}
                  checked={pets.includes(key)}
                  onChange={handlePetChange}
                />
                {value}
              </label>
            ))}
          </div>

          <div className='service'>
            <legend>Service</legend>
            {Object.entries(activityNames).map(([key, value]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  name={key}
                  checked={services.includes(key)}
                  onChange={handleServiceChange}
                />
                {value}
              </label>
            ))}
          </div>
        </div>
        {/* <div>
          <div>
            <CustomTimePicker />
          </div>
        </div> */}


      </div>
      {calendarModal && (
              <CalendarModal
                dates={selectedDates}
                setDates={setSelectedDates}
                onClose={() => setCalendarModal(false)}
              />

            )}
    </div>
  );
};

export default ProfileFilter;
