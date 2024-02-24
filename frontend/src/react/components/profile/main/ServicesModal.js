import React, { useState, useEffect } from 'react';
import "../../../../layout/style/userProfile.css"
import dogIcon from "../../../../layout/images/icon-dog.png";
import catIcon from "../../../../layout/images/icon-cat.png";

/**
 * ServicesModal Component
 *
 * This component renders a modal window for editing the services and their prices offered by a user on their profile.
 * It provides checkboxes for each service along with inputs for setting the price for each offered service.
 *
 * Props:
 * - services: Object containing information about the services offered by the user, including types of animals (dog, cat) 
 *   and a list of individual services with their offered status and prices.
 * - onSave: Function that is called when the 'Save' button is clicked to save the updated services data.
 * - onClose: Function to close the modal, triggered when the 'Close' button is clicked.
 * - onServiceChange: Function to update the state when there's a change in the service offered status or price.
 * - onAnimalTypeChange: Function to update the state when there's a change in the animal type (dog/cat) service status.
 */
const ServicesModal = ({ services, onSave, onClose }) => {

    const [selectedServices, setSelectedServices] = useState(services);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setIsDirty(false);
    }, [services]);

    const servicesHaveChanged = () => {
        console.log(selectedServices)
        console.log(services)
        if (services.dog !== selectedServices.dog || services.cat !== selectedServices.cat) {
            return true;
        }
        for (const [service, { offered, price }] of Object.entries(services.serviceList)) {
            const updatedService = selectedServices.serviceList[service];
            if (updatedService.offered !== offered) {
                return true;
            }
            if (updatedService.price !== price) {
                return true;
            }
        }
        return false;
    }

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty && servicesHaveChanged()) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty, services, selectedServices]);

    const handleClose = () => {
        if (isDirty && servicesHaveChanged()) {
            const confirmClose = window.confirm("Du hast ungespeicherte Änderungen. Bist du sicher, dass du schließen möchtest?");
            if (confirmClose) {
                onClose();
            }
        } else {
            onClose();
        }
    };


    const handleSave = () => {
        console.log(selectedServices)
        onSave(selectedServices);
        setIsDirty(false);
    };

    const handleServiceChange = (service, offered, price) => {
        setSelectedServices(prev => ({
            ...prev,
            serviceList: {
                ...prev.serviceList,
                [service]: { offered, price }
            }
        }));
        setIsDirty(true);
    };

    const handleAnimalTypeChange = (animalType, value) => {
        setSelectedServices(prevServices => ({
            ...prevServices,
            [animalType]: value
        }));
        setIsDirty(true);
    };

    return (
        <div className="modal-overlay">

            <div className='modal-container'>
                <h2>Services und Preise bearbeiten</h2>
                <div className="modal-box">
                    <p className='inbox-heading'>Ich biete:</p>

                    <form className="edit-services-wrapper">
                        <div className="animal-icons">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedServices.dog}
                                    onChange={(e) => handleAnimalTypeChange('dog', e.target.checked)}
                                />
                                <img src={dogIcon} alt="dog-service-Icon" width={30} />Hundeservice
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedServices.cat}
                                    onChange={(e) => handleAnimalTypeChange('cat', e.target.checked)}
                                />
                                <img src={catIcon} alt="cat-service-Icon" width={30} />Katzenservice
                            </label>
                        </div>
                        <div className='services-prices-header'>
                            <p>Dienst</p>
                            <p>Preis in €</p>
                        </div>
                        {Object.entries(selectedServices.serviceList).map(([service, { offered, price }]) => (
                            <div className="service-row" key={service}>
                                <label className={`service-name ${!(selectedServices.dog || selectedServices.cat) ? 'disabled-service' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={offered}
                                        onChange={(e) => handleServiceChange(service, e.target.checked, price)}
                                        disabled={!(selectedServices.dog || selectedServices.cat)}
                                    />
                                    {service}
                                </label>
                                <input
                                    className="service-price"
                                    type="number"
                                    placeholder="Preis"
                                    value={price}
                                    onChange={(e) => {
                                        const roundedValue = Math.round(Number(e.target.value));
                                        handleServiceChange(service, offered, roundedValue);
                                    }}
                                    disabled={!(selectedServices.dog || selectedServices.cat)}
                                    min="0"
                                    max="99"
                                    step="1"
                                    required
                                />
                            </div>
                        ))}
                    </form>
                </div>
                <div>
                    <button className="reset-btn" onClick={handleClose}>Zurück</button>
                    <button className="save-btn" onClick={handleSave}>Speichern</button>
                </div>
            </div>
        </div>
    );
};

export default ServicesModal;
