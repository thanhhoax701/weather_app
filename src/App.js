// App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import Weather from "./Weather";
import Navbar from "./Navbar";
import "./App.css";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyWeatherData, setHourlyWeatherData] = useState(null);
  const [searchCity, setSearchCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showHourlyWeather, setShowHourlyWeather] = useState(false);
  const [currentHourIndex, setCurrentHourIndex] = useState(0);

  const handleNextHour = () => {
    const newIndex = currentHourIndex + 6;
    if (newIndex < hourlyWeatherData.length) {
      setCurrentHourIndex(newIndex);
    }
  };

  const handlePrevHour = () => {
    const newIndex = currentHourIndex - 6;
    if (newIndex >= 0) {
      setCurrentHourIndex(newIndex);
    }
  };


  const getWeatherData = async (lat, lon) => {
    try {
      setLoading(true);

      // Lấy thông tin thời tiết hiện tại
      const currentWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=7b16a3bb0d4c6253ab56ca6a2a14f500&units=metric`
      );
      setWeatherData(currentWeatherResponse.data);

      // Lấy thông tin thời tiết theo từng giờ
      const hourlyWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=7b16a3bb0d4c6253ab56ca6a2a14f500&units=metric`
      );

      // console.log("Hourly Weather Response:", hourlyWeatherResponse.data);

      // Lọc dữ liệu thời tiết theo từng giờ từ dữ liệu forecast
      const currentHour = currentDateTime.getHours();
      const filteredHourlyData = hourlyWeatherResponse.data.list.filter((item) => {
        const itemDate = new Date(item.dt * 1000);
        const itemHour = itemDate.getHours();

        // Xác định giờ hiện tại và giờ tiếp theo 24 giờ
        const next24Hours = (currentHour + 24) % 24;

        // Lọc dữ liệu từ giờ hiện tại đến giờ tiếp theo 24 giờ
        return (itemHour >= currentHour && itemHour <= 23) || (itemHour >= 0 && itemHour < next24Hours);
      });

      setHourlyWeatherData(filteredHourlyData);
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
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const [weatherResponse, hourlyWeatherResponse] = await Promise.all([
        axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=7b16a3bb0d4c6253ab56ca6a2a14f500&units=metric`
        ),
        axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&appid=7b16a3bb0d4c6253ab56ca6a2a14f500&units=metric`
        ),
      ]);

      setWeatherData(weatherResponse.data);

      // Lọc dữ liệu thời tiết theo từng giờ từ dữ liệu forecast
      const filteredHourlyData = hourlyWeatherResponse.data.list.filter((item) => {
        const itemDate = new Date(item.dt * 1000);
        const currentDate = new Date();
        const next24Hours = new Date(currentDate);
        next24Hours.setHours(currentDate.getHours() + 24);

        return itemDate >= currentDate && itemDate < next24Hours;
      });

      setHourlyWeatherData(filteredHourlyData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseHourlyWeather = () => {
    setShowHourlyWeather(false);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    getCurrentLocation();

    return () => clearInterval(intervalId);
  }, []);

  const getFormattedDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return currentDateTime.toLocaleDateString("en-US", options);
  };

  return (
    <div className="App">
      <div className="weather_header">
        <div className="Navbar-container">
          <Navbar setShowHourlyWeather={setShowHourlyWeather} />
        </div>

        <div className="weather_intro">
          <h1 className="title">Weather App</h1>
          <p>
            {getFormattedDate()} {currentDateTime.toLocaleTimeString()}
          </p>
        </div>
      </div>
      <div className="weather_data">
        <div className="search-container">
          <input
            className="search_input"
            type="text"
            placeholder="Enter city name"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
          />
          <button className="search_button" onClick={handleSearch}>
            Search
          </button>
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            className="location-icon"
            onClick={getCurrentLocation}
          />
        </div>
        {loading && <p className="loading">Loading...</p>}
        {weatherData && <Weather data={weatherData} />}
      </div>

      <div className="weather_content">
        {showHourlyWeather && hourlyWeatherData && (
          <div className="hourly-weather">
            <div className="hourly-weather-title">
              <h2>Hourly Weather</h2>
              <button className="close-button" onClick={handleCloseHourlyWeather}>
                Close
              </button>
            </div>
            <div className="hourly-weather-list">
              <button className="hourly-weather-button" onClick={handlePrevHour}>
                Previous
              </button>
              {hourlyWeatherData.slice(currentHourIndex, currentHourIndex + 6).map((hourlyData) => (
                <div key={hourlyData.dt} className="hourly-weather-item">
                  <p>
                    {new Date(hourlyData.dt * 1000).getHours()}:00 -{" "}
                    {Math.round(hourlyData.main.temp)}°C
                  </p>
                  <img
                    src={`http://openweathermap.org/img/wn/${hourlyData.weather[0].icon}.png`}
                    alt={hourlyData.weather[0].description}
                  />
                  <p>Humidity: {hourlyData.main.humidity}%</p>
                  <p>Wind Speed: {hourlyData.wind.speed} m/s</p>
                  <p>Status: {hourlyData.weather[0].description}</p>
                </div>
              ))}
              <button className="hourly-weather-button" onClick={handleNextHour}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;