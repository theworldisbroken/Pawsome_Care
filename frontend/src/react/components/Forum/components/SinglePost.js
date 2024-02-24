import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { connect, useDispatch } from "react-redux";
import Moment from 'moment';
import profilePictureDummy from '../../../../layout/images/ProfilePictureDummy.png'
import edit_Icon from '../../../../layout/images/forum/edit-icon.png'
import delete_Icon from '../../../../layout/images/forum/delete-icon.png'
import report_Icon from '../../../../layout/images/forum/report-icon.png'
import options_icon from '../../../../layout/images/options-icon.png'
import ForumComment from "./ForumComment"

const SinglePost = ({ post1, accessToken, logged_in, update_post_success, setpost, same_userID
    , setEdit_click, edit_click, navigateLink, post_edit, topic_category, isAdministrator }) => {
    const [new_post_title, setNew_post_title] = useState('');
    const [new_post_content, setNew_post_content] = useState('')
    const [comment_input, setComment_input] = useState(false);
    const [show_modal, setShow_modal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [commentBody, setCommentBody] = useState('')
    const [comments, setComments] = useState()
    const [selectedOption, setSelectedOption] = useState(topic_category || "Haustiersitting");

    const dispatch = useDispatch()
    const navigate = useNavigate();

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

    useEffect(() => {
        handlePostUpdate(post1._id)
    }, [comment_input, update_post_success]);

    useEffect(() => {
        if (post1) {
            setNew_post_content(post1.content);
            setNew_post_title(post1.title);
        }
    }, [post1]);

    const handleBodyClick = (event) => {
        const dropdown = document.querySelector('.post-options-dropdown');
        if (dropdown && !dropdown.contains(event.target)) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.body.addEventListener('click', handleBodyClick);
        return () => {
            document.body.removeEventListener('click', handleBodyClick);
        };
    }, []);

    useEffect(() => {
        if (post1) {
            const sortedComments = post1.comment.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            setComments(sortedComments);
        }
    }, [post1])

    useEffect(() => {
        if (post_edit) {
            setEdit_click(false)
        }
    }, [post_edit])

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleSelectChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedOption(selectedValue);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'comment') {
            setCommentBody(value);
        } else if (name === 'new_post_content') {
            setNew_post_content(value)
        } else if (name === 'new_post_title') {
            setNew_post_title(value)
        }
    }

    const handlecomment = async (id) => {
        try {
            const response = await fetch(process.env.REACT_APP_SERVER + "/forum/" + id + "/comment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer ' + accessToken
                },
                body: JSON.stringify({ "content": commentBody })
            });
            if (response.ok) {
                dispatch({ type: "UPDATE_POST_TRUE" })
            }
        } catch (error) {
            console.error('Error fetching posts by category:' + error)
        }
    }

    const handlePostUpdate = async (id) => {
        try {
            const response = await fetch(process.env.REACT_APP_SERVER + "/forum/" + id, {
                method: "GET"
            });
            const data = await response.json()
            setpost(data)
        } catch (error) {
            console.error('Error fetching posts by category:' + error)
        }
    }

    const handleEdit = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_SERVER + "/forum/" + post1._id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer ' + accessToken
                },
                body: JSON.stringify({
                    "content": new_post_content,
                    "title": new_post_title,
                    "category": selectedOption
                })
            });

            if (response.ok) {
                dispatch({ type: "UPDATE_POST_TRUE" });
                setEdit_click(false)
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    }

    const handleDelete = async () => {
        if (post1 && post1.postPicture) {
            try {
                const response = await fetch(process.env.REACT_APP_SERVER + "/pictures/postPicture/" + post1._id, {
                    method: "DELETE",
                    headers: {
                        "Authorization": 'Bearer ' + accessToken
                    },
                });
                if (response.ok) {
                    try {
                        const response = await fetch(process.env.REACT_APP_SERVER + "/forum/" + post1._id, {
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
            } catch (error) {
                console.error('Error creating post:', error);
            }
        } else {
            try {
                const response = await fetch(process.env.REACT_APP_SERVER + "/forum/" + post1._id, {
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
    }

    return (
        <>
            <div className="post-container-single">
                <div className='post-second-container'>
                    <div className="post-image-container" >
                        <Link to={`/profil/${post1?.user.userID}`} >
                            <img
                                className="post-image"
                                style={{ objectFit: "cover" }}
                                src={
                                    post1.user.profilePicture
                                        ? process.env.REACT_APP_SERVER + "/pictures/" + post1.user.profilePicture
                                        : profilePictureDummy
                                }
                                alt="Post Image"
                            />
                        </Link>
                    </div>
                    <div className="post-details-single">
                        <p className="post-title" >{post1.title}</p>
                        <div className="post-options-dropdown">
                            <div className="comment-option-btn" onClick={toggleDropdown}><img alt="options_icon" src={options_icon} /></div>
                            {isDropdownOpen && (
                                <div className="dropdown-options">
                                    {(same_userID || isAdministrator) &&
                                        <>
                                            <button onClick={() => { setEdit_click(true); setIsDropdownOpen(false); dispatch({ type: "UPDATE_POST_FALSE" }); dispatch({ type: "POST_EDIT_FALSE" }); }}>
                                                <img alt="options_icon" src={edit_Icon} style={{ width: "1.4rem", marginRight: "0.4rem", marginLeft: "0.2rem" }} />Bearbeiten</button>
                                            <button onClick={() => { dispatch({ type: "UPDATE_POST_FALSE" }); dispatch({ type: "DELETED_POST_FALSE" }); setShow_modal(true); }}>
                                                <img alt="options_icon" src={delete_Icon} style={{ width: "1.5rem", marginRight: "0.4rem", marginLeft: "0.2rem" }} />Löschen</button>
                                        </>}
                                    {(!same_userID && !isAdministrator) &&
                                        <button style={{ color: "red" }}><img alt="options_icon" src={report_Icon} style={{ width: "1.4rem", marginRight: "0.6rem", marginLeft: "0.6rem" }} />Melden</button>}
                                </div>
                            )}
                        </div>
                        <p className='post-info-userID' > <Link to={`/profil/${post1?.user.userID}`} > @{post1?.user.userID} </Link></p>
                        <p className="post-info text-dark">
                            {Moment(post1?.updatedAt).format("DD.MM.YYYY, HH:mm")}{post1.edited && "- Bearbeitet"}
                        </p>
                        {edit_click &&
                            <>
                                <div style={{ marginTop: "2rem" }}>
                                    <label className="new-post-label">Titel:</label>
                                    <input type="text" value={new_post_title} id="comment" name="new_post_title" className="new-post-title-input" onChange={handleChange} />
                                </div>
                                <label className="new-post-label">Inhalt:</label>
                                <textarea rows={4} value={new_post_content} id="comment" name="new_post_content" className="new-post-content-input" onChange={handleChange} />
                                <div className='input-field'>
                                    <label className='select-label' htmlFor="mySelect">Kategorie:</label>
                                    <select id="mySelect" value={selectedOption} onChange={handleSelectChange} style={{ marginTop: "2rem", marginBottom: "2rem" }}>
                                        <option value="default" disabled></option>
                                        {topics.map((option) => (
                                            <option key={option.title} value={option.title}>{option.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <button className="post-update-button" onClick={() => { setEdit_click(false); handleEdit(); dispatch({ type: "CREATE_TRUE" }) }}>Aktualisieren</button>
                                <button className="post-cancel-button" style={{ marginRight: "0.6rem", marginBottom: "5rem" }} onClick={() => setEdit_click(false)}>Abbrechen</button>
                            </>}
                        {!edit_click && <p className="post-text" >{post1.content}</p>}
                    </div>
                    <div className={`modal ${show_modal ? 'show' : ''}`}>
                        <div className="modal-content">
                            <h2 className='modal-title'> Beitrag löschen ?</h2>
                            <hr className='modal-hr' />
                            <span className="close" onClick={() => setShow_modal(false)}>&times;</span>
                            <div className="button-container">
                                <button className="button-container-btn-cancel" onClick={() => setShow_modal(false)}>Abbrechen</button>
                                <button className="button-container-btn-confirm" onClick={() => {
                                    handleDelete(); setShow_modal(false); navigateLink ? navigate(navigateLink) : navigate(-1);
                                    dispatch({ type: "DELETED_POST_TRUE" });
                                }}>Bestätigen</button>
                            </div>
                        </div>
                    </div>
                    {(post1.postPicture && !edit_click) && <img className='single-post-img' style={{}} alt="post-Pic" src={process.env.REACT_APP_SERVER + "/pictures/" + post1.postPicture} />}
                    <hr className='singlepost-hr' />
                    <div>
                        {(!comment_input && logged_in) && <button className="comment-button" onClick={() => { setComment_input(true); dispatch({ type: "UPDATE_POST_FALSE" }); }}>Kommentieren</button>}
                        {(!comment_input && !logged_in) && <> <button className="comment-button" disabled>Kommentieren</button></>}
                    </div>
                    {comment_input &&
                        <div>
                            <p for="comment" style={{ fontSize: "16px", fontFamily: "Arial", paddingTop: "3rem", fontWeight: "bold" }}>Neuer Kommentar:</p>
                            <textarea id="comment" name="comment" className="comment-input" onChange={handleChange} />
                            <div className='comment-publish-button-container'>
                                <button className="comment-cancel-button" style={{ marginRight: "0.6rem", marginBottom: "5rem" }} onClick={() => setComment_input(false)}>Abbrechen</button>
                                <button className="comment-publish-button" onClick={() => { handlecomment(post1._id); setComment_input(false); handlePostUpdate(post1._id); }}>Veröffentlichen</button>
                            </div>
                        </div>}
                    {(comments && Array.isArray(comments)) &&
                        comments?.map((comment) => <ForumComment postID={post1._id} comment={comment} />)
                    }
                </div>
            </div>
        </>
    );
};

const mapStateToProps = state => {
    return {
        isAdministrator: state.authenticationReducer.isAdministrator,
        post_edit: state.forumReducer.post_edit,
        topic_category: state.forumReducer.topic_category,
    }
}

export default connect(mapStateToProps, null)(SinglePost);
