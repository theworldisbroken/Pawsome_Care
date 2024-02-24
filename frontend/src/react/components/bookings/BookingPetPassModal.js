import React from 'react';
import PetPassCard from '../profile/petpass/PetPassCard';
/**
 * PetPassModalBooking is a React component that renders a modal for selecting pet passes in a booking system.
 *
 * Props:
 * - isOpen: A boolean indicating whether the modal is open.
 * - onClose: Function to close the modal.
 * - petPasses: Array of pet pass objects available for selection.
 * - selectedPetPasses: Array of IDs of currently selected pet passes.
 * - onPetPassChange: Function to handle the selection and deselection of pet passes.
 */
const BookingPetPassModal = ({ onClose, petPasses }) => {
    return (
        <div className='add-petpass-wrapper'>
            <div className="modal-overlay">
                <div className='modal-container'>

                    <div className='h2-close-btn'>
                        <h2>Haustierpass auswählen</h2>
                    </div>

                    <div className="modal-box" >
                        <div className='scrollbox'>
                            <div className='petpasses-container'>
                                {petPasses.map((petPass) => (
                                    <div
                                        key={petPass._id}
                                        className={`lined-content-box`}                                    >
                                        <div className="petpass-item" data-id={petPass._id}>
                                            <PetPassCard petPass={petPass} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <button className="reset-btn" onClick={onClose}>Zurück</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPetPassModal;