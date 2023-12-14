// App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import Weather from "./Weather";
import Navbar from "./Navbar";

// CSS
import "./App.css";
import "./assets/DailyWeather.css"
import "./assets/Weather5DaysAgo.css";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyWeatherData, setHourlyWeatherData] = useState(null);
  const [dailyWeatherData, setDailyWeatherData] = useState(null);
  const [searchCity, setSearchCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showHourlyWeather, setShowHourlyWeather] = useState(false);
  const [showDailyWeather, setShowDailyWeather] = useState(false);
  const [currentHourIndex, setCurrentHourIndex] = useState(0);

  const [show5DaysAgoWeather, setShow5DaysAgoWeather] = useState(false);
  const [weather5DaysAgo, setWeather5DaysAgo] = useState(null);

  const handleFetchWeather5DaysAgo = async () => {
    setShow5DaysAgoWeather(true);

    try {
      // Calculate timestamp for 5 days ago
      const fiveDaysAgoTimestamp = Math.round((currentDateTime.getTime() - 5 * 24 * 60 * 60 * 1000) / 1000);

      // Fetch weather data for 5 days ago
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&dt=${fiveDaysAgoTimestamp}&appid=7b16a3bb0d4c6253ab56ca6a2a14f500&units=metric`
      );

      setWeather5DaysAgo(response.data);
    } catch (error) {
      console.error("Error fetching weather data 5 days ago:", error);
    }
  };

  const handleClose5DaysAgoWeather = () => {
    setShow5DaysAgoWeather(false);
  };

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

      const currentWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=7b16a3bb0d4c6253ab56ca6a2a14f500&units=metric`
      );
      setWeatherData(currentWeatherResponse.data);

      const hourlyWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=7b16a3bb0d4c6253ab56ca6a2a14f500&units=metric`
      );

      const currentHour = currentDateTime.getHours();
      const filteredHourlyData = hourlyWeatherResponse.data.list.filter((item) => {
        const itemDate = new Date(item.dt * 1000);
        const itemHour = itemDate.getHours();

        const next24Hours = (currentHour + 24) % 24;

        return (itemHour >= currentHour && itemHour <= 23) || (itemHour >= 0 && itemHour < next24Hours);
      });

      setHourlyWeatherData(filteredHourlyData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDailyWeatherData = async (lat, lon) => {
    try {
      setLoading(true);

      const dailyWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=7b16a3bb0d4c6253ab56ca6a2a14f500&units=metric`
      );

      const next7DaysData = dailyWeatherResponse.data.daily.slice(1, 8);
      setDailyWeatherData(next7DaysData);
    } catch (error) {
      console.error("Error fetching daily weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        getWeatherData(latitude, longitude);
        getDailyWeatherData(latitude, longitude);
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

  const handleCloseDailyWeather = () => {
    setShowDailyWeather(false);
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
          <Navbar
            setShowHourlyWeather={setShowHourlyWeather}
            setShowDailyWeather={setShowDailyWeather}
            setShow5DaysAgoWeather={handleFetchWeather5DaysAgo}
          />
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
          <div className="hourly_weather">
            <div className="hourly_weather_title">
              <h2>Hourly Weather</h2>
              <button className="close_button" onClick={handleCloseHourlyWeather}>
                Close
              </button>
            </div>
            <div className="hourly_weather_list">
              <button className="hourly_weather_button" onClick={handlePrevHour}>
                Previous
              </button>
              {hourlyWeatherData.slice(currentHourIndex, currentHourIndex + 6).map((hourlyData) => (
                <div key={hourlyData.dt} className="hourly_weather_item">
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
              <button className="hourly_weather_button" onClick={handleNextHour}>
                Next
              </button>
            </div>
          </div>
        )}

        {showDailyWeather && dailyWeatherData && (
          <div className="daily_weather">
            <div className="daily_weather_title">
              <h2>Daily Weather</h2>
              <button className="close_button" onClick={handleCloseDailyWeather}>
                Close
              </button>
            </div>
            <div className="daily_weather_list">
              {dailyWeatherData.map((dailyData) => (
                <div key={dailyData.dt} className="daily_weather_item">
                  <p>{new Date(dailyData.dt * 1000).toLocaleDateString()}</p>
                  <img
                    src={`http://openweathermap.org/img/wn/${dailyData.weather[0].icon}.png`}
                    alt={dailyData.weather[0].description}
                  />
                  <p>Max Temp: {Math.round(dailyData.temp.max)}°C</p>
                  <p>Min Temp: {Math.round(dailyData.temp.min)}°C</p>
                  <p>Humidity: {dailyData.humidity}%</p>
                  <p>Wind Speed: {dailyData.wind_speed} m/s</p>
                  <p>Status: {dailyData.weather[0].description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {show5DaysAgoWeather && weather5DaysAgo && (
          <div className="FiveDays_ago_weather">
            <div className="FiveDays_ago_weather_title">
              <h2>Weather 5 Days Ago</h2>
              <button className="close_button" onClick={handleClose5DaysAgoWeather}>
                Close
              </button>
            </div>
            <div className="FiveDays_ago_weather_list">
              {weather5DaysAgo.hourly.map((hourlyData) => (
                <div key={hourlyData.dt} className="FiveDays_ago_weather_item">
                  <p>{new Date(hourlyData.dt * 1000).toLocaleTimeString()}</p>
                  <img
                    src={`http://openweathermap.org/img/wn/${hourlyData.weather[0].icon}.png`}
                    alt={hourlyData.weather[0].description}
                  />
                  <p>{Math.round(hourlyData.temp)}°C</p>
                  <p>Humidity: {hourlyData.humidity}%</p>
                  <p>Wind Speed: {hourlyData.wind_speed} m/s</p>
                  <p>Status: {hourlyData.weather[0].description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
