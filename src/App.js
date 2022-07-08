import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import Photo from "./Photo";

const client_id = `?client_id=${process.env.REACT_APP_ACCESS_KEY}`;
const mainUrl = `https://api.unsplash.com/photos/`;
const searchUrl = `https://api.unsplash.com/search/photos/`;

function App() {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const mounted = useRef(false);
  const [newImages, setNewImages] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    let url;
    const urlPage = `&page=${page}`;
    const urlQuery = `&query=${query}`;
    if (query) {
      url = `${searchUrl}${client_id}${urlPage}${urlQuery}`;
    } else {
      url = `${mainUrl}${client_id}${urlPage}`;
    }
    try {
      const response = await fetch(url);
      const data = await response.json();
      // important to add new data to curret data array not overwriting old data
      setPhotos((oldPhotos) => {
        if (query && page === 1) {
          return data.results;
        }
        if (query) {
          return [...oldPhotos, ...data.results];
        } else {
          return [...oldPhotos, ...data];
        }
      });
      setNewImages(false);
      setLoading(false);
    } catch (error) {
      setNewImages(false);
      setLoading(false);
      console.log(error);
    }
  };
  useEffect(() => {
    fetchImages();
    // eslint-disable-next-line
  }, [page]);

  const event = () => {
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
      // when reaches the bottom of the page, this value will be true
      setNewImages(true);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", event);
    return () => {
      window.removeEventListener("scroll", event);
    };
  }, []);

  // useRef to avoid initial rendering
  // set page only when not loading and new images is true
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    // don't trigger when not at the bottom of the page
    if (!newImages) return;
    // don't trigger multiple fetch
    if (loading) return;
    setPage((oldpage) => oldpage + 1);
    // eslint-disable-next-line
  }, [newImages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // do nothing if no input
    if (!query) return;
    // if page is one, just fetch images
    if (page === 1) {
      fetchImages();
      // console.log("second time");
      return;
    }
    // if page !== 1, set page to 1 and trigger useEffect fetch images
    setPage(1);
    // console.log("first time");
  };

  return (
    <main>
      <section className="search">
        <form className="search-form">
          <input
            type="text"
            className="form-input"
            placeholder="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
          <button className="submit-btn" onClick={handleSubmit}>
            <FaSearch />
          </button>
        </form>
      </section>
      <section className="photos">
        <div className="photos-center">
          {photos.map((image) => {
            return <Photo key={image.id} {...image} />;
          })}
        </div>
        {loading && <h2 className="loading">Loading...</h2>}
      </section>
    </main>
  );
}

export default App;
