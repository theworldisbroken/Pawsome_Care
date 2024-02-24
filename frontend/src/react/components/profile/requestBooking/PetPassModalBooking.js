import React, { useState, useEffect } from 'react';
import PetPassCard from '../petpass/PetPassCard';
import PetPassModal from '../petpass/PetPassModal';
import CreatePetPass from './CreatePetPass';
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
const PetPassModalBooking = ({ onClose, petPasses, setSelectedPetPasses, selectedPetPasses, userID, setPetPasses, accessToken, showToast }) => {

    const [tempSelectedPetPasses, setTempSelectedPetPasses] = useState(selectedPetPasses);
    const [isDirty, setIsDirty] = useState(false);
    const [createPetPassDirty, setCreatePetPassDirty] = useState(false);

    const handleCreatePetPassDirty = (dirty) => {
        setCreatePetPassDirty(dirty);
    };

    const petPassesEqual = (a, b) => {
        const aIds = new Set(a.map(pp => pp._id));
        const bIds = new Set(b.map(pp => pp._id));
        if (aIds.size !== bIds.size) return false;
        for (let id of aIds) {
            if (!bIds.has(id)) {
                return false;
            }
        }

        return true;
    };

    const handleClose = () => {
        if ((isDirty && !petPassesEqual(tempSelectedPetPasses, selectedPetPasses)) || createPetPassDirty) {
            const confirmClose = window.confirm("Du hast ungespeicherte Änderungen. Bist du sicher, dass du schließen möchtest?");
            if (confirmClose) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const handleSave = () => {
        if (createPetPassDirty) {
            const confirmClose = window.confirm("Du hast ungespeicherte Änderungen. Bist du sicher, dass du schließen möchtest?");
            if (confirmClose) {
                setSelectedPetPasses(tempSelectedPetPasses);
                setIsDirty(false);
            }
        } else {
            setSelectedPetPasses(tempSelectedPetPasses);
            setIsDirty(false);
        }
    };

    const handlePetPassClick = (petPass) => {
        const isSelected = tempSelectedPetPasses.some(pp => pp._id === petPass._id);
        if (isSelected) {
            setTempSelectedPetPasses(tempSelectedPetPasses.filter(pp => pp._id !== petPass._id));
        }
        else {
            setTempSelectedPetPasses([...tempSelectedPetPasses, petPass]);
        }
        setIsDirty(true);
    };


    return (
        <div className='add-petpass-wrapper'>
            <div className="modal-overlay">
                <div className='modal-container'>

                    <div className='h2-close-btn'>
                        <h2>Haustierpass auswählen</h2>
                    </div>

                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>

                        <div className='create-new-petpass'>
                            <h3>Wähle deine Tierpässe oder erstelle einen neuen Pass</h3>
                        </div>
                        <div className='scrollbox'>
                            <div className='petpasses-container'>
                                <div>
                                    <CreatePetPass
                                        onDirty={handleCreatePetPassDirty} 
                                        showToast={showToast}
                                        setTempSelectedPetPasses={setTempSelectedPetPasses}
                                        setPetPasses={setPetPasses}
                                        userID={userID}
                                        accessToken={accessToken}

                                        />
                                </div>
                                {petPasses.map((petPass) => (
                                    <div
                                        key={petPass._id}
                                        className={`lined-content-box ${tempSelectedPetPasses.includes(petPass) ? 'selected-petpass' : ''}`}
                                        onClick={() => handlePetPassClick(petPass)}
                                    >
                                        <div className="petpass-item" data-id={petPass._id}>
                                            <PetPassCard petPass={petPass} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <button className="reset-btn" onClick={handleClose}>Zurück</button>
                        <button className="save-btn" onClick={handleSave}>Speichern</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetPassModalBooking;