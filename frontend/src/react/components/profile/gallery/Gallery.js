import React from 'react';
import emptyGallery from "../../../../layout/images/empty-gallery.png";

const Gallery = ({ handleNewClick, isProfileOwner, accessToken }) => {

  return (

    <div className="gallery-wrapper">
      <div className="heading-with-line">
        <h2>Meine Galerie</h2>
        <div className="line"></div>
        {isProfileOwner && (
          <button className="create-btn" onClick={handleNewClick}>+</button>
        )}
      </div>
      <div className='no-content-img'>
        <img src={emptyGallery} alt="Katze" width={150} height={150} />
        <p>Noch keine Bilder</p>
      </div>

      {/* <div className='gallery-content'>
      <img src={cat} alt="Katze" height={250} width={250} />
      <img src={cat} alt="Katze" height={250} width={250} />
      <img src={cat} alt="Katze" height={250} width={250} />
      </div> */}

    </div>
  );
}

export default Gallery;