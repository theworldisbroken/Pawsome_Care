import dogIcon from "../../../../layout/images/icon-dog.png";
import catIcon from "../../../../layout/images/icon-cat.png";
import editIcon from "../../../../layout/images/icon-edit.png";

/**
 * Services Component
 *
 * This component displays the services offered by a user along with their prices on the user's profile page.
 *
 * Props:
 * - profileData: Object containing the user's profile information including the services they offer.
 * - isProfileOwner: Boolean indicating whether the current user viewing the profile is its owner.
 * - onEdit: Function to handle the editing of the services section.
 */
const Services = ({ profileData, isProfileOwner, onEdit }) => {

  if (!profileData) {
    return <div>Lädt...</div>;
  }

  const { cat, dog, hausbesuch, gassi, training, herberge, tierarzt } = profileData;

  const activities = [
    { name: "Hausbesuch", ...hausbesuch },
    { name: "Gassi gehen", ...gassi },
    { name: "Training", ...training },
    { name: "Herberge", ...herberge },
    { name: "Tierarzt", ...tierarzt }
  ];

  const isPetSelected = dog || cat;
  const isActivityOffered = activities.some(activity => activity.offered);

  return (
    <div className="services-prices-wrapper">

      <div className="heading-with-line">
        <h2> Services und Preise</h2>
        <div className="line"></div>
      </div>

      <div className="content-box">

        <div className="services-prices-content">
          {isPetSelected && isActivityOffered && (
            <>
              <div className="allowed-pets-icons">
                {dog ? <img src={dogIcon} alt="Hunde-Icon" width={40} /> : null}
                {cat ? <img src={catIcon} alt="Katzen-Icon" width={40} /> : null}
              </div>
              <div className="offered-services">
                <ul>
                  {activities.filter(activity => activity.offered).map(activity => (
                    <li key={activity.name} className="activity-item">
                      <span className="activity-name">{activity.name}</span>
                      <span className="activity-dots"></span>
                      <span className="activity-price">{activity.price} €</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
          <div className="edit-btn">
            {isProfileOwner && (
              <button onClick={onEdit}><img src={editIcon} alt="edit-Icon" width={25} title="Bearbeiten"/></button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

export default Services;