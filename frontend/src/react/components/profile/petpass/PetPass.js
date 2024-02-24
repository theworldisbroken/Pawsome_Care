import React, { useState, useEffect } from 'react';
import PetPassCard from "./PetPassCard";
import PetPassModal from "./PetPassModal";
import emptyPetpass from "../../../../layout/images/empty-petpass.png";


/**
 * PetPass Component
 *
 * This component is designed to manage and display pet passes associated with a user's profile.
 * It allows users to view, create, edit, and delete pet passes. Each pet pass contains details 
 * about a pet.
 *
 * Props:
 * - profileID: The unique identifier of the user profile associated with the pet passes.
 * - accessToken: Token for authenticated API requests.
 */
function PetPass({ profileID, isProfileOwner, accessToken, petPasses, setPetPasses, showToast }) {
  // State to manage the array of pet passes and modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPetPass, setCurrentPetPass] = useState(null);

  // Function to handle edit button click on a pet pass
  const handleEditClick = (petPass) => {
    setCurrentPetPass(petPass);
    setIsModalOpen(true);
  };

  // Function to handle click for creating a new pet pass
  const handleNewClick = () => {
    setCurrentPetPass(null);
    setIsModalOpen(true);
  };

  // Functions for creating, updating, and deleting pet passes
  const createPetPass = async (data) => {
    try {
      const formData = new FormData();

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          formData.append(key, data[key]);
          console.log(data[key])
        }
      }
      formData.append('creator', profileID);


      console.log(formData)
      const response = await fetch(process.env.REACT_APP_SERVER + `/petpass`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData,
      });

      if (response.ok) {
        const newData = await response.json();
        setPetPasses(currentData => [newData, ...currentData]);
        setIsModalOpen(false);
        showToast("Tierpass erstellt");
      } else {
        showToast("Ein Fehler ist aufgetreten");
      }
    } catch (error) {
      console.error('Netzwerkfehler', error);
    }
  };

  const updatePetPass = async (id, data) => {
    try {
      const formData = new FormData();
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          formData.append(key, data[key]);
        }
      }
      const response = await fetch(process.env.REACT_APP_SERVER + `/petpass/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData,
      });

      if (response.ok) {
        const updatedData = await response.json();
        setPetPasses(currentData => currentData.map(petPass => petPass._id === id ? updatedData : petPass));
        setIsModalOpen(false);
        showToast("Tierpass bearbeitet");
      } else {
        showToast("Ein Fehler ist aufgetreten");
      }
    } catch (error) {
      console.error('Netzwerkfehler', error);
    }
  };

  const deletePetPass = async (id) => {
    if (!window.confirm("Sind Sie sicher, dass Sie diesen Tierpass löschen möchten?")) {
      return;
    }
    try {
      const response = await fetch(process.env.REACT_APP_SERVER+ `/petpass/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
      });

      if (response.ok) {
        setPetPasses(currentData => currentData.filter(petPass => petPass._id !== id));
        setIsModalOpen(false);
        showToast("Tierpass gelöscht")
      } else {
        showToast("Ein Fehler ist aufgetreten")
      }
    }
    catch (error) {
      console.error('Netzwerkfehler', error);
    }

  };

  return (

    <div className="petpass-wrapper">
      {isModalOpen && (
        <PetPassModal
          onClose={() => setIsModalOpen(false)}
          petPass={currentPetPass}
          onCreate={createPetPass}
          onUpdate={updatePetPass}
          onDelete={deletePetPass}
        />
      )}
      <div className="heading-with-line">
        <h2>Meine Haustiere</h2>
        <div className="line"></div>
        {isProfileOwner && (
          <button className="create-btn" onClick={handleNewClick}>+</button>
        )}

      </div>
      {petPasses.length === 0 ? (
        <div className="no-petpasses">
          <div className='no-content-img'>
            <img src={emptyPetpass} alt="Keine Haustiere gefunden" width={150} height={150} />
            <p>Noch keine Haustierpässe</p>
          </div>
        </div>
      ) : (

        petPasses.map((petPass) => (
          <div key={petPass._id} className="content-box">
            <PetPassCard
              petPass={petPass}
              onEdit={() => handleEditClick(petPass)}
              isProfileOwner={isProfileOwner}
            />
          </div>
        ))
      )}
    </div>
  );
}

export default PetPass;