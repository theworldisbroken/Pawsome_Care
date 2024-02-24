import { connect, useDispatch } from "react-redux";
import "../../../layout/style/forum.css";
import { useNavigate } from "react-router-dom";
import SearchBar from './components/SearchBar';

/* Image Imports */
// https://www.ed2go.com/saddleback/online-courses/starting-a-pet-sitting-business/
import img_tiersitting from "../../../layout/images/forum/Tiersitting.jpg"
// https://www.yarrah.com/en/blog/help-my-pet-is-missing-lost-your-dog-or-cat-heres-what-to-do/
import img_vermisst from "../../../layout/images/forum/missing-pet.jpg"
import img_krank from "../../../layout/images/forum/FsickPet.jpg"
import img_liebe from "../../../layout/images/forum/FlovemyP.jpg"
// https://www.youtube.com/watch?v=E7HHOZY6MvI
import img_memes from "../../../layout/images/forum/funny-pet.jpg"
// https://www.phillydogrescue.com/category/%EB%82%98%EB%82%98%EC%95%8C%EB%B0%94/
import img_first_pet from "../../../layout/images/forum/first-pet.jpg"
import img_header from "../../../layout/images/forum/Forum_header.png"
// https://www.sgs.com/en-az/services/pet-food
import img_food from "../../../layout/images/forum/Pet-food.jpg"
// https://www.linkedin.com/pulse/pet-insurance-market-2023-offering-organization-end-user-sinha/
import img_vet from "../../../layout/images/forum/animal-vet.jpg"


const categoryPreviewData = [
  {
    title: "Haustiersitting",
    name: "haustiersitting",
    img: img_tiersitting
  },
  {
    title: "Vermisst",
    name: "vermisst",
    img: img_vermisst
  },
  {
    title: "Krankheit",
    name: "krankheit",
    img: img_krank
  },
  {
    title: "Haustierliebe",
    name: "haustierliebe",
    img: img_liebe
  },
  {
    title: "Memes",
    name: "memes",
    img: img_memes
  },
  {
    title: "Futter",
    name: "futter",
    img: img_food
  },
  {
    title: "Erstes Haustier",
    name: "ersteshaustier",
    img: img_first_pet
  },
  {
    title: "Gesundheit",
    name: "gesundheit",
    img: img_vet
  }
]

const CategoryPreview = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const handleCategoryClick = async (category) => {
    navigate(`/forum/categories/`);
    try {
      const response = await fetch(process.env.REACT_APP_SERVER + "/forum/category/" + category)
      const data = await response.json()
      dispatch({ type: "POSTS_SUCCESS", payload: { posts: data.posts, totalposts: data.totalPosts } })
    } catch (error) {
      console.error('Error fetching posts by category:' + error)
    }
  }
  return (
    <div>
      <div className="category-preview" onClick={() => handleCategoryClick(props.name)}>
        <div className="text">{props.title}</div>
        <img className="img" style={{ objectFit: "cover" }} alt="Img" src={props.img} />
      </div>
    </div>
  );
}



const ForumMain = () => {

  return (
    <div className='forum-startseite-body'>
      <div className="forum-startseite-container forum-startseite">

        <div className="kategorien-headline-legend">Haustier-Forum</div>

        <div className="header-forum">
          <div className='forummain-searchbar'>
            <SearchBar />
          </div>
          <img alt="headerpic"
            src={img_header} />
        </div>
        <hr className='forummain-hr' />

        <div className="kategorien-headline" >Kategorien:</div>
        <div className="kategorien">
          {
            categoryPreviewData.map(category => {
              return (
                <CategoryPreview
                  title={category.title}
                  name={category.name}
                  img={category.img}
                />
              )
            })
          }
        </div>
      </div>
      <div className="credits-footer-mainforum">
        <p>Bilder-Quellen:</p>
        <a href="https://www.ed2go.com/saddleback/online-courses/starting-a-pet-sitting-business/" target="_blank">Haustiersitting-Bild</a>
        <a href="https://www.yarrah.com/en/blog/help-my-pet-is-missing-lost-your-dog-or-cat-heres-what-to-do/" target="_blank">Vermisst-Bild</a>
        <a href="https://www.youtube.com/watch?v=E7HHOZY6MvI" target="_blank">Memes-Bild</a>
        <a href="https://www.sgs.com/en-az/services/pet-food" target="_blank">Futter-Bild</a>
        <a href="https://www.phillydogrescue.com/category/%EB%82%98%EB%82%98%EC%95%8C%EB%B0%94/" target="_blank">Erstes-Haustier-Bild</a>
        <a href="https://www.linkedin.com/pulse/pet-insurance-market-2023-offering-organization-end-user-sinha/" target="_blank">Gesundheit-Bild</a>
      </div>
    </div>
  );
};



export default connect(null, null)(ForumMain);