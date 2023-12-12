import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import Weather from "./Weather";
import "./App.css"; // Import CSS

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [searchCity, setSearchCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const getWeatherData = async (lat, lon) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=7b16a3bb0d4c6253ab56ca6a2a14f500&units=metric`
      );
      setWeatherData(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=7b16a3bb0d4c6253ab56ca6a2a14f500&units=metric`
      );
      setWeatherData(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        getWeatherData(latitude, longitude);
      });
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    // Lấy ngày và thời gian hiện tại mỗi giây
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Lấy vị trí hiện tại khi component được mount
    getCurrentLocation();

    // Hủy interval khi component bị hủy
    return () => clearInterval(intervalId);
  }, []);

  const getFormattedDate = () => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    return currentDateTime.toLocaleDateString('en-US', options);
  };

  return (
    <div className="App">
      <h1 className="title">
        Weather App
        <FontAwesomeIcon
          icon={faMapMarkerAlt}
          className="location-icon"
          onClick={getCurrentLocation}
        />
      </h1>
      <p>{getFormattedDate()} {currentDateTime.toLocaleTimeString()}</p>
      <div className="search-container">
        <input
          className="search_input"
          type="text"
          placeholder="Enter city name"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
        />
        <button className="search_button" onClick={handleSearch}>Search</button>
      </div>
      {loading && <p>Loading...</p>}
      {weatherData && <Weather data={weatherData} />}
    </div>
  );
}

export default App;
