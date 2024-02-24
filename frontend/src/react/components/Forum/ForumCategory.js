import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from "react-router-dom";
import BackButton from "./components/BackButton";
import SearchBar from "./components/SearchBar";
import "../../../layout/style/forum.css";
import "../../../layout/style/forumCategory.css";
import Post from './components/Post'
import SinglePost from './components/SinglePost'
// https://www.flaticon.com/
import img_sitting from "../../../layout/images/forum/sitting-dog.png"
import img_food from "../../../layout/images/forum/cat-food.png"
import img_missing from "../../../layout/images/forum/search.png"
import img_sick from "../../../layout/images/forum/sick.png"
import img_love from "../../../layout/images/forum/dog-love.png"
import img_meme from "../../../layout/images/forum/laughing-dog.png"
import img_first from "../../../layout/images/forum/first-steps.png"
import img_health from "../../../layout/images/forum/vet.png"


const ForumCategory = (props) => {
  const isPhone = useMediaQuery({ maxWidth: 767 });

  const { posts, logged_in, accessToken, update_post_success, userID, create_success, totalposts } = props;
  const [selectedCategory, setSelectedCategory] = useState()
  const [post1, setpost] = useState("")
  const [post_show, setPost_show] = useState(false)
  const [edit_click, setEdit_click] = useState(false)
  const [page, setPage] = useState(1);

  const dispatch = useDispatch()

  const totalPages = Math.ceil(totalposts / 10);


  /**
   * topicList
   */
  const topics = [
    {
      title: "Haustiersitting",
      selected: false,
      img: img_sitting
    },
    {
      title: "Futter",
      selected: false,
      img: img_food
    },
    {
      title: "Vermisst",
      selected: false,
      img: img_missing
    },
    {
      title: "Krankheit",
      selected: false,
      img: img_sick
    },
    {
      title: "Haustierliebe",
      selected: false,
      img: img_love
    },
    {
      title: "Memes",
      selected: false,
      img: img_meme
    },
    {
      title: "Erstes Haustier",
      selected: false,
      img: img_first
    },
    {
      title: "Gesundheit",
      selected: false,
      img: img_health
    },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [posts]);

  useEffect(() => {
    if (Array.isArray(posts) && posts.length > 0) {
      const updatedTopics = topics.map((topic) => ({
        ...topic,
        selected: topic.title === posts[0].category
      }));
      setSelectedCategory(updatedTopics);
    } else {
      setSelectedCategory(topics);
    }
  }, [posts]);

  const handleNextPage = () => {
    setPage(prevPage => {
      const nextPage = prevPage + 1;

      selectedCategory.forEach((topic) => {
        if (topic.selected) {
          handleCategoryClick(topic.title, nextPage);
        }
      });

      return nextPage;
    });
  };

  const handleLastPage = () => {
    setPage(prevPage => {
      const nextPage = prevPage - 1;

      selectedCategory.forEach((topic) => {
        if (topic.selected) {
          handleCategoryClick(topic.title, nextPage);
        }
      });

      return nextPage;
    });
  };

  const handleCategoryClick = async (category, page) => {
    try {
      const response = await fetch(process.env.REACT_APP_SERVER + "/forum/category/" + category + "?page=" + page)
      const data = await response.json()
      dispatch({ type: "POSTS_SUCCESS", payload: { posts: data.posts, totalposts: data.totalPosts } })
    } catch (error) {
      console.error('Error fetching posts by category:' + error)
    }
  }

  useEffect(() => {
    const timeoutDuration = 100;
    const timeoutId = setTimeout(() => { dispatch({ type: "CREATE_FALSE" }); }, timeoutDuration);
    return () => clearTimeout(timeoutId);
  }, [create_success]);

  useEffect(() => {
    if (create_success) {
      const timeoutDuration = 0;
      const timeoutId = setTimeout(() => {
        if (Array.isArray(selectedCategory)) {
          selectedCategory.forEach((topic) => {
            if (topic.selected) {
              handleCategoryClick(topic.title);
            }
          });
        }
      }, timeoutDuration);

      // Cleanup the timeout when the component unmounts or when the dependency changes
      return () => clearTimeout(timeoutId);
    }
  }, [create_success, selectedCategory]);



  const Topic = ({ topic, title, page, setPage }) => {
    const dispatch = useDispatch()

    useEffect(() => {
      if (topic.selected) {
        dispatch({ type: "TOPIC_CATEGORY", payload: topic.title });
      }
    }, [topic])

    const handleCategoryClick = async (category, page) => {
      setPage(1)
      setPost_show(false)
      dispatch({ type: "POST_EDIT_TRUE" });
      try {
        const response = await fetch(process.env.REACT_APP_SERVER + "/forum/category/" + category + "?page=" + page)
        const data = await response.json()
        dispatch({ type: "POSTS_SUCCESS", payload: { posts: data.posts, totalposts: data.totalPosts } })
      } catch (error) {
        console.error('Error fetching posts by category:' + error)
      }
    }
    return (
      <div className="category-previeww" onClick={() => handleCategoryClick(title, page)}>
        <img className="topic-icon" style={{ width: "2.5rem" }} src={topic.img} alt={topic.title} />
        <p className="topic-title" style={{ color: topic.selected ? '#fff' : '#000' }}>{topic.title}</p>
      </div>
    );
  }

  const CustomButton = (props) => {
    const navigate = useNavigate();

    const handleClick = () => {
      navigate("/forum/categories/create");
    };
    return (
      <>
        {logged_in && <button className="custom-create-button" title="click here" onClick={(e) => handleClick(e)}>
          Neuer Post
        </button>}
        {(!logged_in && !isPhone) && <><button className="custom-create-button" disabled>
          Neuer Post
        </button><span className="custom-create-button-msg">Einloggen ist nötig!</span></>}
      </>
    );
  };

  const handleClick = (post) => {
    setpost(post)
    setPost_show(true)
    dispatch({ type: "UPDATE_POST_FALSE" });
  };

  let same_userID
  if (post1.user && userID === post1.user.userID) {
    same_userID = true;
  } else {
    same_userID = false;
  }

  return (
    <div className="forum-startseite-body">
      <div className="forum-categories-container">


        <div className="header-forum">
          <BackButton />
        </div>

        <div className="header-forumcategory">
          <SearchBar />
          <CustomButton />
        </div>
        {isPhone && <h2 style={{ marginLeft: "1rem" }}>Kategorien:</h2>}
        {post_show && <button className="post-close-btn" onClick={() => { setPost_show(false); dispatch({ type: "POST_EDIT_TRUE" }); }}>&lt;</button>}
        <section className="posts-body">
          <div className="topics">
            {selectedCategory?.map((topic) => (
              <>
                <Topic title={topic.title} topic={topic} page={page} setPage={(page) => setPage(page)} />
                <hr className="topics-line" />
              </>
            ))}
          </div>

          {!post_show &&
            <div className="posts">
              {posts?.map((post) => <Post key={post._id} post={post} handleClick={() => handleClick(post)} />)}
              <div className="posts-pagination">
                <button className="posts-pagination-back" onClick={handleLastPage} disabled={page < 2}>&lt; Zurück</button>
                {posts &&
                  <button className="posts-pagination-next" onClick={handleNextPage} disabled={page === totalPages}>Weiter &gt;</button>
                }
              </div>
            </div>
          }
          {(post_show && post1) && <SinglePost post1={post1} accessToken={accessToken} logged_in={logged_in} update_post_success={update_post_success}
            setpost={(params) => setpost(params)} same_userID={same_userID}
            setEdit_click={(params) => setEdit_click(params)} edit_click={edit_click} />}
        </section>
      </div>
      <div className="credits-footer-forum">
        <a href="https://www.flaticon.com/free-icons/pet" target="_blank">Icons von Flaticon</a>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    logged_in: state.authenticationReducer.logged_in,
    posts: state.forumReducer.posts,
    totalposts: state.forumReducer.totalposts,
    create_success: state.forumReducer.create_success,
    accessToken: state.authenticationReducer.accessToken,
    update_post_success: state.forumReducer.update_post_success,
    userID: state.authenticationReducer.userID
  }
}

export default connect(mapStateToProps, null)(ForumCategory);