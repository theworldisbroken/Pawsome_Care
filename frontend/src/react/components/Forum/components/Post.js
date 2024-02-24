import Moment from "moment";
import profilePictureDummy from '../../../../layout/images/ProfilePictureDummy.png'

const Post = ({ post, handleClick, category }) => {
  return (
    <div className="post-container" onClick={handleClick} >
      <div className="post-image-container" >
        <img
          className="post-image"
          style={{ objectFit: "cover" }}
          src={
            post.user.profilePicture
              ? process.env.REACT_APP_SERVER + "/pictures/" + post.user.profilePicture
              : profilePictureDummy
          }
          alt="Post Image"
        />
      </div>
      <div className="post-details">
        <div className="post-title"><p>{post.title}</p></div>
        <div className="post-infos">
          <p className="post-infos-font" >@{post?.user.userID}</p>
          {category && <p className="post-category" > {category}</p>}
        </div>
        <p className="post-info text-dark">
          {Moment(post?.updatedAt).format("DD.MM.YYYY, HH:mm")}{post.edited && "- Bearbeitet"}
        </p>
        <p className="post-text" >{post.content}</p>
      </div>
    </div>
  );
};

export default Post