import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const SearchBar = ({ SearchWords }) => {
  const [searchQuery, setsearchQuery] = useState('');


  useEffect(() => {
    if (SearchWords) {
      setsearchQuery(SearchWords)
    }
  }, [SearchWords]);


  const handleInputChange = (event) => {
    setsearchQuery(event.target.value);
  };


  return (
    <div className="forum-searchbar">
      <form>
        <input className="searchbar-input"
          type="text"
          placeholder="Suche..."
          value={searchQuery}
          onChange={handleInputChange}
        />
        <Link to={`/forum/search?search_query=${encodeURIComponent(searchQuery)}`}>
          <button className="searchbar-button" >Suche</button>
        </Link>
      </form>
    </div>
  );
};

export default SearchBar;