import React, { useEffect, useState } from 'react';
import uploadDog from "../../../../layout/images/upload-dog.png";
import uploadCat from "../../../../layout/images/upload-cat.png";


const CreatePetPass = ({ onCreate, onDirty, setPetPasses, setTempSelectedPetPasses, showToast, userID, accessToken }) => {

    const initialFormData = {
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
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isDirty, setIsDirty] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        setIsDirty(formHasChanged(formData, initialFormData));
    }, [formData]);

    useEffect(() => {
        onDirty(isDirty);
    }, [isDirty, onDirty]);

    const formHasChanged = () => {
        return JSON.stringify(formData) !== JSON.stringify(initialFormData) || previewImage !== null;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
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
        }
    };

    const handleChangeCheckbox = (e) => {
        const { name, checked } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: checked
        }));
    };

    const createPetPass = async (data) => {
        try {
          const formData = new FormData();
    
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              formData.append(key, data[key]);
              console.log(data[key])
            }
          }
          formData.append('creator', userID);
    
    
          const response = await fetch(process.env.REACT_APP_SERVER+ `/petpass`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            body: formData,
          });
    
          if (response.ok) {
            const newData = await response.json();
            setPetPasses(currentData => [newData, ...currentData]);
            setTempSelectedPetPasses(currentData => [newData, ...currentData])
            showToast("Tierpass erstellt");
            setFormData(initialFormData)
            setPreviewImage(null)
          } else {
            showToast("Ein Fehler ist aufgetreten");
          }
        } catch (error) {
          console.error('Netzwerkfehler', error);
        }
      };


    const handleSubmit = (e) => {
        e.preventDefault();
        createPetPass(formData);
        setIsDirty(false);
    };

    

    return (

        <form onSubmit={handleSubmit} id="petpass-form">

            <div className="lined-content-box">

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

                    </div>
                    <button className="create-btn create-petpass" type="submit" title='Tierpass erstellen'>+</button>
                </div>

            </div>
        </form>
    );

};

export default CreatePetPass;