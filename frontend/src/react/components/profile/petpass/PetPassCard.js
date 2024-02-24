import React from 'react';
import editIcon from "../../../../layout/images/icon-edit.png";
import dogIcon from "../../../../layout/images/icon-dog.png";
import catIcon from "../../../../layout/images/icon-cat.png";
import uploadDog from "../../../../layout/images/upload-dog.png";
import uploadCat from "../../../../layout/images/upload-cat.png";

/**
 * PetPassCard Component
 *
 * This component is used to display a single pet pass card within the user's profile. 
 * The component also provides an edit button for the profile owner to modify pet pass details.
 *
 * Props:
 * - petPass: The pet pass object containing details about the pet.
 * - onEdit: Function to be called when the edit button is clicked.
 * - isProfileOwner: Boolean indicating whether the current user is the owner of the profile.
 */
function PetPassCard({ petPass, onEdit, isProfileOwner }) {

  return (
    <div className="petpass-content">
      <img
        id="pet-image"
        src={
          petPass.picture ? `${process.env.REACT_APP_SERVER}/pictures/${petPass.picture}` :
            petPass.type === "Hund" ? uploadDog : uploadCat
        }
        alt={petPass.type === "Hund" ? "Hund" : "Katze"}
        height={200}
        width={200}
        className="petpass-image"
      />
      <div className="petpass-details">

        <div className='peticon-name'>
          {petPass.type === "Katze" ?
            <img src={catIcon} alt="cat-service-Icon" width="30" /> :
            <img src={dogIcon} alt="dog-service-Icon" width="30" />
          }
          <h2>{petPass.name}</h2>
        </div>

        <div className="petpass-input">

          <div>
            <p><strong>Rasse:</strong> {petPass.race}</p>
            <p><strong>Geschlecht:</strong> {petPass.gender}</p>
            <p><strong>Alter:</strong> {petPass.age}</p>
            <p><strong>Größe:</strong> {petPass.size}</p>
            <p><strong>Fell:</strong> {petPass.fur}</p>
            <p><strong>Persönlichkeit:</strong> {petPass.personalities}</p>
          </div>
          <div>
            <p><strong>Erkrankungen:</strong> {petPass.diseases}</p>
            <p><strong>Allergien:</strong> {petPass.allergies}</p>
            <p><strong>Stubenrein:</strong> {petPass.houseTrained ? 'Ja' : 'Nein'}</p>
            <p><strong>Geimpft:</strong> {petPass.vaccinated ? 'Ja' : 'Nein'}</p>
            <p><strong>Sterilisiert:</strong> {petPass.sterilized ? 'Ja' : 'Nein'}</p>
            <p><strong>Gechipt:</strong> {petPass.chipped ? 'Ja' : 'Nein'}</p>
          </div>
        </div>

      </div>

      <div className="edit-btn">
        {isProfileOwner && (
          <button onClick={onEdit}><img src={editIcon} alt="edit-icon" width={25} /></button>
        )}
      </div>
    </div>
  );
}

export default PetPassCard;