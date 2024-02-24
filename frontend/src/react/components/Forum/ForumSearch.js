import React, { useEffect, useState } from 'react';
import { connect } from "react-redux";
import { useLocation } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import Post from './components/Post'
import SinglePost from './components/SinglePost'
import BackButton from "./components/BackButton";
import '../../../layout/style/forumSearch.css'
// https://storyset.com/illustration/search/rafiki
import search_pic from '../../../layout/images/forum/search-pic.png'

const SearchPosts = (props) => {
    const { logged_in, accessToken, update_post_success, userID } = props;

    const location = useLocation();
    const [results, setResults] = useState('');
    const [categoryResults, setCategoryResults] = useState()
    const [post1, setpost] = useState("")
    const [post_show, setPost_show] = useState(false)
    const [edit_click, setEdit_click] = useState(false)


    const handleClick = (post) => {
        setpost(post)
        setPost_show(true)
    };

    let same_userID
    if (post1.user && userID === post1.user.userID) {
        same_userID = true;
    } else {
        same_userID = false;
    }

    const params = new URLSearchParams(location.search);
    const query = params.get('search_query');
    useEffect(() => {
        if (query) {
            fetchPosts(query);
        }
    }, [location.search]);

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

    const fetchPosts = async (query) => {
        try {
            const response = await fetch(process.env.REACT_APP_SERVER + `/forum/search?search_query=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (response.ok) {
                const sortedPosts = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
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
                    <div className='search-header'>
                        <div className="search-header-forum">
                            <BackButton />
                        </div>
                        <div className='search-header-container'>
                            <h1 className='search-legend'> Suchergebnisse: {results ? results.length : 0} Ergebnisse</h1>
                            <img className='search-page-img' src={search_pic} alt='create-pic' style={{ width: "22rem" }} />
                        </div>
                        <div className='search-searchbar'>
                            <SearchBar className="searchbar-searchpage" SearchWords={query} />
                        </div>
                    </div>
                    {post_show && <button className="search-post-close-btn" onClick={() => setPost_show(false)}>&lt;</button>}
                    {(!post_show && categoryResults) &&
                        Object.entries(categoryResults).map(([category, categoryPosts]) => (
                            <div className='search-posts-container' key={category}>
                                <h2>{category}</h2>
                                {categoryPosts.map((post) => (
                                    <Post key={post._id} post={post} handleClick={() => handleClick(post)} />))}
                            </div>
                        ))
                    }
                    {(post_show && post1) && <SinglePost post1={post1} setpost={(params) => setpost(params)} accessToken={accessToken} logged_in={logged_in} update_post_success={update_post_success}
                        same_userID={same_userID} setEdit_click={(params) => setEdit_click(params)} edit_click={edit_click} />}
                </div>
            </div>
            <div className="credits-footer-forum">
                <a href="https://storyset.com/illustration/search/rafiki" target='_blank'>Bild von Storyset</a>
            </div>
        </div>
    );
};

const mapStateToProps = state => {
    return {
        logged_in: state.authenticationReducer.logged_in,
        accessToken: state.authenticationReducer.accessToken,
        update_post_success: state.forumReducer.update_post_success,
        userID: state.authenticationReducer.userID
    }
}

export default connect(mapStateToProps, null)(SearchPosts);
