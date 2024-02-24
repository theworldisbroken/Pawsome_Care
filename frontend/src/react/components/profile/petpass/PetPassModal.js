import React, { useEffect, useState } from 'react';
import deleteIcon from "../../../../layout/images/icon-trashcan.png";
import uploadDog from "../../../../layout/images/upload-dog.png";
import uploadCat from "../../../../layout/images/upload-cat.png";

/**
 * PetPassModal Component
 *
 * This component presents a modal dialog for creating or editing pet pass information. It includes
 * form fields for various pet attributes like name, race, gender, age, size, fur, and others. 
 * The component can be used to add new pet passes or edit existing ones.
 *
 * Props:
 * - isOpen: Boolean to control the visibility of the modal.
 * - onClose: Function to close the modal.
 * - petPass: The pet pass object to be edited; null for creating a new pet pass.
 * - onCreate: Function to handle the creation of a new pet pass.
 * - onUpdate: Function to handle the updating of an existing pet pass.
 * - onDelete: Function to handle the deletion of a pet pass.
 */
const PetPassModal = ({ onClose, petPass, onCreate, onUpdate, onDelete }) => {

    const [formData, setFormData] = useState({
        type: 'Hund',
        name: '',
        race: '',
        gender: '',
        age: '',
        size: '',
        fur: '',
        personalities: '',
        diseases: '',
        allergies: '',
        houseTrained: false,
        vaccinated: false,
        sterilized: false,
        chipped: false,
        picture: null,
    });

    const [isDirty, setIsDirty] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);



    useEffect(() => {
        if (petPass) {
            setFormData(petPass);
        }
        setIsDirty(false);
    }, [petPass]);

    const formHasChanged = () => {
        return JSON.stringify(formData) !== JSON.stringify(petPass) || previewImage !== null;
    };

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty && formHasChanged()) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty, formData, petPass]);

    const handleClose = () => {
        if (isDirty && formHasChanged()) {
            const confirmClose = window.confirm("Du hast ungespeicherte Änderungen. Bist du sicher, dass du schließen möchtest?");
            if (confirmClose) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
        setIsDirty(true);
    };

    const handleChangeCheckbox = (e) => {
        const { name, checked } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: checked
        }));
        setIsDirty(true);
    };

    const handleImageChange = e => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = loadEvent => {
                setFormData(prevFormData => ({
                    ...prevFormData,
                    picture: file,
                }));
                setPreviewImage(loadEvent.target.result)
            };
            reader.readAsDataURL(file);
            setIsDirty(true);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData._id) {
            onUpdate(formData._id, formData);
        } else {
            console.log(formData)
            onCreate(formData);
        }
        setIsDirty(false);
    };

    const handleDelete = (id) => (e) => {
        e.preventDefault();
        onDelete(id);
        setIsDirty(false);
    };

    return (

        <div className="modal-overlay">

            <div className='modal-container'>

                <h2>{petPass ? 'Haustierpass bearbeiten' : 'Haustierpass erstellen'}</h2>

                <form onSubmit={handleSubmit} id="petpass-form" className='petpass-form-container'>

                    <div className="modal-box">

                        <div className='edit-petpass-container'>

                            <div className="upload-petpass-img">
                                <div className="image-upload">
                                    <label htmlFor="file-input">
                                        <img
                                            id="pet-image"
                                            src={
                                                previewImage ? previewImage :
                                                    formData.picture ? `${process.env.REACT_APP_SERVER}/pictures/${formData.picture}` :
                                                        formData.type === "Hund" ? uploadDog : uploadCat
                                            }
                                            alt={formData.type === "Hund" ? "Hund" : "Katze"}
                                            height={200}
                                            width={200}
                                            className="petpass-image"
                                        />
                                    </label>
                                    <input id="file-input" type="file" style={{ display: 'none' }} onChange={handleImageChange} />
                                </div>

                                <div>
                                    <label htmlFor="dog">Hund</label>
                                    <input type="radio" id="dog" name="type" value="Hund" checked={formData.type === "Hund"} onChange={handleChange} required />
                                    <label htmlFor="cat">Katze</label>
                                    <input type="radio" id="cat" name="type" value="Katze" checked={formData.type === "Katze"} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className='edit-petpass-details'>
                                <div>
                                    <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                                    <input type="text" name="race" placeholder="Rasse" value={formData.race} onChange={handleChange} required />
                                    <select name="gender" value={formData.gender} onChange={handleChange} required>
                                        <option value="" disabled hidden>Geschlecht</option>
                                        <option value="männlich">männlich</option>
                                        <option value="weiblich">weiblich</option>
                                    </select>
                                    <input type="number" name="age" placeholder="Alter" value={formData.age} onChange={handleChange} required />
                                    <select name="size" value={formData.size} onChange={handleChange} required>
                                        <option value="" disabled hidden>Größe</option>
                                        <option value="klein">klein (bis 10 kg)</option>
                                        <option value="mittel">mittel (10 - 20 kg) </option>
                                        <option value="groß">groß (ab 20 kg) </option>
                                    </select>
                                    <select name="fur" value={formData.fur} onChange={handleChange} required>
                                        <option value="" disabled hidden>Fell</option>
                                        <option value="Langhaar">Langhaar</option>
                                        <option value="Kurzhaar">Kurzhaar</option>
                                        <option value="haarlos">Haarlos</option>
                                    </select>
                                    <select name="personalities" value={formData.personalities} onChange={handleChange} required>
                                        <option value="" disabled hidden>Persönlichkeit</option>
                                        <option value="Verspielt">Verspielt</option>
                                        <option value="Unabhängig">Unabhängig</option>
                                        <option value="Neugierig">Neugierig</option>
                                        <option value="Ruhig">Ruhig</option>
                                        <option value="Schüchtern">Schüchtern</option>
                                        <option value="Hitzig">Hitzig</option>
                                    </select>
                                </div>
                                <div>
                                    <input type="text" name="diseases" placeholder="Erkrankungen" value={formData.diseases} onChange={handleChange} />
                                    <input type="text" name="allergies" placeholder="Allergien" value={formData.allergies} onChange={handleChange} />

                                    <label className='checkbox-name'>
                                        <input type="checkbox" name="houseTrained" checked={formData.houseTrained} onChange={handleChangeCheckbox}
                                        />Stubenrein
                                    </label>
                                    <label className='checkbox-name'>
                                        <input type="checkbox" name="sterilized" checked={formData.sterilized} onChange={handleChangeCheckbox}
                                        />Sterilisiert
                                    </label>
                                    <label className='checkbox-name'>
                                        <input type="checkbox" name="vaccinated" checked={formData.vaccinated} onChange={handleChangeCheckbox}
                                        />Geimpft
                                    </label>
                                    <label className='checkbox-name'>
                                        <input type="checkbox" name="chipped" checked={formData.chipped} onChange={handleChangeCheckbox}
                                        />Gechipt
                                    </label>
                                </div>
                                {petPass &&
                                    <button className="delete-btn" type="button" onClick={handleDelete(formData._id)}>
                                        <img src={deleteIcon} alt="delete-icon" width={30} />
                                    </button>}

                            </div>

                        </div>

                    </div>
                    <div>
                        <button className="reset-btn" onClick={handleClose}>Zurück</button>
                        <button className='save-btn' type='submit'>Speichern</button>
                    </div>
                </form>
            </div >
        </div >

    );
};

export default PetPassModal;
