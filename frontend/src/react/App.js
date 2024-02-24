import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from "react-router-dom";
import { connect } from "react-redux"
import LandingPage from "./components/components/LandingPage";
import ForumMain from "./components/Forum/ForumMain";
import ForumCategory from "./components/Forum/ForumCategory";
import ForumSearch from "./components/Forum/ForumSearch";
import ForumEditPost from "./components/Forum/ForumCreatePost";
import ForumPersonalPosts from "./components/Forum/ForumPersonalPosts";
import Login from "./components/authentication/Login";
import SignUp from "./components/authentication/SignUp";
import VerificationLink from "./components/authentication/verificationLink";
import FindBookings from "./components/bookings/FindBookings"
import FindProfiles from "./components/search/FindProfiles"
import Profile from "./components/profile/Profile"
import Navbar from './components/components/Navbar'
import Footer from './components/components/Footer'
import Quiz from './components/components/Quiz'
import Settings from './components/components/Settings'
import "../layout/style/navbar.css";
import 'react-day-picker/dist/style.css';
import '../layout/style/day-picker.css';
import "../layout/style/mediaQueries.css"
import "../layout/style/global.css"
import Reviews from './components/profile/review/Reviews';
import PetPass from './components/profile/petpass/PetPass';
import Gallery from './components/profile/gallery/Gallery';
import Booking from './components/profile/setAvailability/Booking';


// Router-Konfiguration
const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      {/* <Footer /> */}
    </>
  );
};

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/forum/categories",
        element: <ForumCategory />,
      },
      {

        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/forum",
        element: <ForumMain />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/activation/:linkEnding",
        element: <VerificationLink />,
      },
      {
        path: "/profil/:id",
        element: <Profile />,
        children: [
          {
            path: "pinnwand",
            element: <Reviews />
          },
          {
            path: "haustierpaesse",
            element: <PetPass />
          },
          {
            path: "galerie",
            element: <Gallery/>
          },
          {
            path: "termin",
            element: <Booking/>
          }
        ]
      },
      {
        path: "/suche",
        element: <FindProfiles />,
      },
      {
        path: "/quiz",
        element: <Quiz />,
      },
      {
        path: "/forum/search",
        element: <ForumSearch />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />
      }
    ],
  }
]);

const loggedinRouter = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/forum",
        element: <ForumMain />,
      },
      {
        path: "/forum/categories",
        element: <ForumCategory />,
      },
      {
        path: "/forum/categories/create",
        element: <ForumEditPost />,
      },
      {
        path: "/profil/:id",
        element: <Profile />,
        children: [
          {
            path: "pinnwand",
            element: <Reviews />
          },
          {
            path: "haustierpaesse",
            element: <PetPass />
          },
          {
            path: "galerie",
            element: <Gallery/>
          },
          {
            path: "termin",
            element: <Booking/>
          }
        ]
      },
      {
        path: "/activation/:linkEnding",
        element: <VerificationLink />,
      },
      {
        path: "/buchungen",
        element: <FindBookings />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />
      },
      {
        path: "/quiz",
        element: <Quiz />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/forum/search",
        element: <ForumSearch />,
      },
      {
        path: "/suche",
        element: <FindProfiles />,
      },
      {
        path: "/myPosts",
        element: <ForumPersonalPosts />,
      },
    ],
  }
]);


// App-Komponente enthält Router-Konfiguration
const App = (props) => {
  const { logged_in } = props;

  if (logged_in) {
    return (
      <RouterProvider router={loggedinRouter} />
    );
  } else {
    return (
      <RouterProvider router={router} />
    );
  }
};

const mapStateToProps = state => {
  return state.authenticationReducer
}

export default connect(mapStateToProps, null)(App);
