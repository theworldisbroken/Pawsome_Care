import React, { useEffect, useState } from 'react';
import { connect } from "react-redux";
import Post from './components/Post'
import SinglePost from './components/SinglePost'
import myPost_pic from '../../../layout/images/forum/my-posts.png'
import '../../../layout/style/forumPersonalPosts.css'

const ForumPersonalPosts = (props) => {
    const { logged_in, accessToken, update_post_success, post_deleted, userID } = props;

    const [results, setResults] = useState('');
    const [categoryResults, setCategoryResults] = useState()
    const [post1, setpost] = useState("")
    const [post_show, setPost_show] = useState(false)
    const [edit_click, setEdit_click] = useState(false)


    const handleClick = (post) => {
        setpost(post)
        setPost_show(true)
    };

    useEffect(() => {
        fetchPosts();
    }, [post_show, update_post_success, post_deleted]);

    useEffect(() => {
        if (post_deleted) {
            setPost_show(false)
        }
    }, [post_deleted]);

    useEffect(() => {
        if (results) {
            const postsByCategory = results.reduce((acc, post) => {
                const category = post.category;
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(post);
                return acc;
            }, {});
            setCategoryResults(postsByCategory)
        }
    }, [results]);

    let same_userID
    if (post1.user && userID === post1.user.userID) {
        same_userID = true;
    } else {
        same_userID = false;
    }

    const fetchPosts = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_SERVER + "/forum/myPosts", {
                method: "GET",
                headers: {
                    "Authorization": 'Bearer ' + accessToken
                }
            });
            const data = await response.json();
            const sortedPosts = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            if (response.ok) {
                setResults(sortedPosts)
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    return (
        <div>
            <div className='search-body'>
                <div className="search-container">
                    <div className='personal-posts-header'>
                        <h1 className='personal-posts-legend'>Persönliche Beiträge</h1>
                        <img className='personal-posts-img' src={myPost_pic} alt='create-pic' />
                    </div>
                    <h2 className='personal-posts-count'>{results ? results.length : 0} Beiträge identifiziert:</h2>
                    {post_show && <button className="search-post-close-btn" onClick={() => setPost_show(false)}>&lt;</button>}
                    {(!post_show && categoryResults) &&
                        Object.entries(categoryResults).map(([category, categoryPosts]) => (
                            <div className='personal-posts' style={{ marginBottom: "2.3rem" }} key={category}>
                                <h2 >{category}</h2>
                                {categoryPosts.map((post) => (
                                    <Post key={post._id} post={post} handleClick={() => handleClick(post)} />))}
                            </div>
                        ))
                    }
                    {(post_show && post1) && <SinglePost post1={post1} setpost={(params) => setpost(params)} accessToken={accessToken} logged_in={logged_in} update_post_success={update_post_success}
                        same_userID={same_userID} setEdit_click={(params) => setEdit_click(params)} edit_click={edit_click} navigateLink={'/myPosts'} />}
                </div>
            </div>
            <div className="credits-footer-forum">
                <a href="https://www.flaticon.com/free-icons/posts" target='_blank'>Bild von Flaticon</a>
            </div>
        </div>
    );
};

const mapStateToProps = state => {
    return {
        logged_in: state.authenticationReducer.logged_in,
        accessToken: state.authenticationReducer.accessToken,
        update_post_success: state.forumReducer.update_post_success,
        post_deleted: state.forumReducer.post_deleted,
        userID: state.authenticationReducer.userID
    }
}

export default connect(mapStateToProps, null)(ForumPersonalPosts);
