import React, { useState } from 'react';
import { useNavigate } from "react-router-dom"; // Make sure to import useNavigate from react-router-dom
import { connect, useDispatch } from "react-redux";
import { useMediaQuery } from 'react-responsive';
import "../../../layout/style/forum.css";
import "../../../layout/style/forumCreatePost.css";
import profilePictureDummy from '../../../layout/images/ProfilePictureDummy.png'
// https://storyset.com/illustration/mobile-ux/amico#utm_source=freepik&utm_medium=referall&utm_campaign=storiesdetail&utm_content=edit-button&utm_term=edit
import createPic from '../../../layout/images/forum/create-post.png'

const ForumCategory = (props) => {
  const { accessToken, public_user, topic_category } = props
  const isPhone = useMediaQuery({ maxWidth: 1281 });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [selectedOption, setSelectedOption] = useState(topic_category || "Haustiersitting");
  const [pic, setPic] = useState()

  const navigate = useNavigate();
  const dispatch = useDispatch()

  const topics = [
    {
      title: "Haustiersitting"
    },
    {
      title: "Futter"
    },
    {
      title: "Vermisst"
    },
    {
      title: "Krankheit"
    },
    {
      title: "Haustierliebe"
    },
    {
      title: "Memes"
    },
    {
      title: "Erstes Haustier"
    },
    {
      title: "Gesundheit"
    },
  ];

  const handleGoBack = () => {
    navigate(-1);
    dispatch({ type: "CREATE_TRUE" })
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title') {
      setTitle(value);
    } else if (name === 'content') {
      setContent(value);
    }
  };

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);
  };

  let postBody = {
    "title": title,
    "content": content,
    "category": selectedOption
  }

  const handleSubmit = async () => {
    if (content === '') {
      setContentError(true)
    } else if (title === '') {
      setTitleError(true)
    } else {
      try {
        const response = await fetch(process.env.REACT_APP_SERVER + "/forum", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": 'Bearer ' + accessToken
          },
          body: JSON.stringify(postBody)
        });
        if (response.ok) {
          handleGoBack()
        }
        const data = await response.json();
        if (data && data._id && pic) {
          try {
            const formData = new FormData();
            formData.append('postPic', pic)
            const uploadResponse = await fetch(process.env.REACT_APP_SERVER + '/pictures/uploadPostPicture/' + data._id, {
              method: "POST",
              headers: {
                'Authorization': 'Bearer ' + accessToken,
              },
              body: formData
            });
          } catch (uploadError) {
            console.error('Error uploading post picture:', uploadError);
          }
        }
        dispatch({ type: "CREATE_SUCCESS", payload: true });
      } catch (error) {
        console.error('Error creating post:', error);
      }
    }
  }

  return (
    <div className="forum-startseite-body">
      <div className="forum-createPost-container">

        <div className="createPost-kategorien-headline">
          <div style={{ marginBottom: "4.4rem" }}>Beitrag erstellen:</div>
          <img src={createPic} alt='create-pic' />
        </div>


        {/* Author */}
        <div className="author-section">
          <img style={{ objectFit: "cover" }} alt="Author-pfp" src={public_user.profilePicture ? process.env.REACT_APP_SERVER + "/pictures/" + public_user.profilePicture : profilePictureDummy} />
          <p style={{ marginLeft: "-1.5rem", fontSize: "18px", fontWeight: "bold" }}>@{public_user.userID}</p>
        </div>

        <div className="edit-section">
          {/* Save and Delete buttons */}

          {!isPhone &&
            <div className="button-section">
              <button className="save-button" onClick={() => { handleSubmit(); }}>Veröffentlichen</button>
              <button className="delete-button" onClick={handleGoBack}>Abbrechen</button>
            </div>
          }
          {isPhone &&
            <div className="button-section">
              <button className="delete-button" onClick={handleGoBack}>Abbrechen</button>
              <button className="save-button" onClick={() => { handleSubmit(); }}>Veröffentlichen</button>
            </div>
          }
          <div className="input-field">
            <label className="edit-label" htmlFor="title">Titel:</label>
            {!titleError && <input type="text" id="title" name="title" className="title-input" onChange={handleChange} />}
            {titleError && <input type="text" id="title" name="title" className="title-input" style={{ outline: "2px solid #ff0000" }} onChange={handleChange} />}
          </div>

          <div className="input-field">
            <label className="edit-label" htmlFor="content">Inhalt:</label>
            {!contentError && <textarea id="content" name="content" rows="4" className="content-input" onChange={handleChange} />}
            {contentError && <textarea id="content" name="content" rows="4" className="content-input" style={{ outline: "2px solid #ff0000" }} onChange={handleChange} />}
          </div>
          <div className="input-field-inputs">
            <div className='input-field-categories'>
              <label className='select-label' htmlFor="mySelect" >Kategorie:</label>
              <select className='select-options' id="mySelect" value={selectedOption} onChange={handleSelectChange} style={{}}>
                <option value="default" disabled></option>
                {topics.map((option) => (
                  <option key={option.title} value={option.title}>{option.title}</option>
                ))}
              </select>
            </div>
            <div className="input-field-img">
              <label className='select-label'>Bild:
              </label>
              <label className='file-input-createPost-label'>
                <input type="file" name="image" className='file-input-createPost' id="image" onChange={(e) => setPic(e.target.files[0])} style={{ marginBottom: "10rem", marginLeft: "0.5rem" }} required />
                Bild hochladen {pic ? `(${pic.name.substring(0, 7)}...)` : ''}
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="credits-footer-forum">
        <a href="https://storyset.com/illustration/mobile-ux/amico#utm_source=freepik&utm_medium=referall&utm_campaign=storiesdetail&utm_content=edit-button&utm_term=edit" target="_blank">Bild von Storyset</a>
      </div>
    </div>


  );
};
const mapStateToProps = state => {
  return {
    accessToken: state.authenticationReducer.accessToken,
    public_user: state.settingsReducer.public_user,
    topic_category: state.forumReducer.topic_category
  };
}

export default connect(mapStateToProps, null)(ForumCategory);