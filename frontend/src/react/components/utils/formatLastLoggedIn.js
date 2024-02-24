import { formatDistanceToNow, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import emptyStar from '../../../layout/images/icon-paw-empty.png';
import filledStar from '../../../layout/images/icon-paw.png';


export function formatLastLoggedIn(lastLoggedInDate) {
  if (!lastLoggedInDate) {
      return "Datum nicht verfügbar";
  }

  const lastLogin = parseISO(lastLoggedInDate);
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;

  const correctedLastLogin = new Date(lastLogin.getTime() - timezoneOffset);

  const differenceInDays = Math.ceil((now - correctedLastLogin) / (1000 * 60 * 60 * 24));

  if (differenceInDays === 0) {
      return "heute";
  } else if (differenceInDays === 1) {
      return `vor ${differenceInDays} Tag`;
  } else if (differenceInDays <= 3) {
      return `vor ${differenceInDays} Tagen`;
  } else {
      return formatDistanceToNow(correctedLastLogin, { addSuffix: true, locale: de });
  }
}

export function renderStars(rating) {
    let stars = [];
    // Fügen Sie gefüllte Sterne hinzu basierend auf der Bewertung
    for (let i = 1; i <= rating; i++) {
      stars.push(<img src={filledStar} height={20} width={20} alt={`${i} Stern`} key={i} />);
    }
    // Fügen Sie leere Sterne hinzu für den Rest bis 5
    for (let i = rating + 1; i <= 5; i++) {
      stars.push(<img src={emptyStar} height={20} width={20} alt={`${i} Stern`} key={i} />);
    }
    return <div>{stars}</div>;
  }