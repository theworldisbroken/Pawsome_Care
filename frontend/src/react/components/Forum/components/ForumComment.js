import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Moment from "moment";
import profilePictureDummy from '../../../../layout/images/ProfilePictureDummy.png'
//www.freepik.com/icon/show-more-button-with-three-dots_61140#fromView=search&term=options&page=2&position=50&track=ais&uuid=eba19ed4-2d97-40ef-b3c6-38ee1166b370
import options_icon from '../../../../layout/images/options-icon.png'
import edit_Icon from '../../../../layout/images/forum/edit-icon.png'
import delete_Icon from '../../../../layout/images/forum/delete-icon.png'
import report_Icon from '../../../../layout/images/forum/report-icon.png'


const ForumComment = ({ postID, comment, userID, accessToken }) => {
  const [new_comment, setNew_comment] = useState();
  const [edit_click, setEdit_click] = useState(false)
  const [show_modal, setShow_modal] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dispatch = useDispatch()

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'comment_update') {
      setNew_comment(value);
    }
  }
  const handleBodyClick = (event) => {
    const dropdowns = document.querySelectorAll('.comment-options-dropdown');
    const isClickInsideDropdown = Array.from(dropdowns).some(dropdown => dropdown.contains(event.target));

    if (!isClickInsideDropdown) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (comment) {
      setNew_comment(comment.content)
    };
  }, [comment]);
  
  useEffect(() => {
    document.body.addEventListener('click', handleBodyClick);
    return () => {
      document.body.removeEventListener('click', handleBodyClick);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER + "/forum/" + postID + "/comment/" + comment._id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": 'Bearer ' + accessToken
        },
        body: JSON.stringify({ "content": new_comment })
      });
      if (response.ok) {
        dispatch({ type: "UPDATE_POST_TRUE" });
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER + "/forum/" + postID + "/comment/" + comment._id, {
        method: "DELETE",
        headers: {
          "Authorization": 'Bearer ' + accessToken
        },
      });
      if (response.ok) {
        dispatch({ type: "UPDATE_POST_TRUE" });
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  }

  const same_userID = userID === comment.user.userID

  return (
    <div>
      <div className="comment-container" style={{ display: "flex", flexDirection: "column" }}>
        <div className={`modal ${show_modal ? 'show' : ''}`}>
          <div className="modal-content">
            <h2 className='modal-title'> Kommentar löschen ?</h2>
            <hr className='modal-hr' />
            <span className="close" onClick={() => setShow_modal(false)}>&times;</span>
            <div className="button-container">
              <button className="button-container-btn-cancel" onClick={() => setShow_modal(false)}>Abbrechen</button>
              <button className="button-container-btn-confirm" onClick={() => { handleDelete(); setShow_modal(false); }}>Bestätigen</button>
            </div>
          </div>
        </div>
        <div className="comment-details">
          <img
            className="post-image"
            style={{ objectFit: "cover" }}
            src={
              comment.user.profilePicture
                ? process.env.REACT_APP_SERVER + "/pictures/" + comment.user.profilePicture
                : profilePictureDummy
            }
            alt="comment Image"
          />
          <p className="comment-info" style={{ marginTop: "1.2rem" }}>
            <div className="comment-options-dropdown" id={`comment-options-dropdown-${comment._id}`}>
              <div className="comment-option-btn" onClick={toggleDropdown}><img alt="options_icon" src={options_icon} /></div>
              {isDropdownOpen && (
                <div className="dropdown-options">
                  {same_userID &&
                    <>
                      <button onClick={() => { setEdit_click(true); setIsDropdownOpen(false); dispatch({ type: "UPDATE_POST_FALSE" }); }}>
                        <img alt="options_icon" src={edit_Icon} style={{ width: "1.4rem", marginRight: "0.4rem", marginLeft: "0.2rem" }} />
                        Bearbeiten</button>
                      <button onClick={() => { setShow_modal(true); setIsDropdownOpen(false); dispatch({ type: "UPDATE_POST_FALSE" }); }}>
                        <img alt="options_icon" src={delete_Icon} style={{ width: "1.5rem", marginRight: "0.4rem", marginLeft: "0.2rem" }} />
                        Löschen</button>
                    </>}
                  {!same_userID && <button style={{ color: "red" }}><img alt="options_icon" src={report_Icon} style={{ width: "1.4rem", marginRight: "0.6rem", marginLeft: "0.6rem" }} />
                    Melden</button>}
                </div>
              )}
            </div>
            <p className='post-info-userID'> <Link to={`/profil/${comment?.user.userID}`}>@{comment?.user.userID} </Link></p>
          </p>
          <p className="date-comment" >
            {Moment(comment?.updatedAt).format("DD.MM.YYYY, HH:mm")} {comment.edited && "- Bearbeitet"}
          </p>
          {!edit_click &&
            <p className="comment-text" style={{ marginTop: "0.5rem", marginLeft: '11.3%' }}>{comment.content}</p>
          }
          {edit_click &&
            <>
              <textarea type="text" value={new_comment} id="comment" name="comment_update" className="comment-input" onChange={handleChange} />
              <button className="post-update-button" onClick={() => { handleUpdate(); setEdit_click(false) }}>Aktualisieren</button>
              <button className="comment-cancel-button" style={{ marginRight: "0.6rem", marginBottom: "5rem" }} onClick={() => setEdit_click(false)}>Abbrechen</button>
            </>}
        </div>
      </div>
    </div>
  );
};
const mapStateToProps = state => {
  return {
    accessToken: state.authenticationReducer.accessToken,
    userID: state.authenticationReducer.userID
  };
}

export default connect(mapStateToProps, null)(ForumComment);