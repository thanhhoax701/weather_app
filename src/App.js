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
import "./assets/HistoryWeather30DaysAgo.css";


function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyWeatherData, setHourlyWeatherData] = useState(null);
  const [dailyWeatherData, setDailyWeatherData] = useState(null);
  const [searchCity, setSearchCity] = useState("");

  const [currentCity, setCurrentCity] = useState(null);

  const [loading, setLoading] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showHourlyWeather, setShowHourlyWeather] = useState(false);

  const [showDailyWeather, setShowDailyWeather] = useState(false);
  const [currentHourIndex, setCurrentHourIndex] = useState(0);

  const [show5DaysAgoWeather, setShow5DaysAgoWeather] = useState(false);
  const [weather5DaysAgo, setWeather5DaysAgo] = useState(null);
  const [showDetail5DaysAgo, setShowDetail5DaysAgo] = useState(false);
  const [detail5DaysAgoWeatherData, setDetail5DaysAgoWeatherData] = useState(null);

  const [show30DaysAgoWeather, setShow30DaysAgoWeather] = useState(false);
  const [weather30DaysAgo, setWeather30DaysAgo] = useState(null);



  const getFormattedDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return currentDateTime.toLocaleDateString("en-US", options);
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
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=bd5e378503939ddaee76f12ad7a97608&units=metric`
      );
      setWeatherData(currentWeatherResponse.data);

      const hourlyWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=bd5e378503939ddaee76f12ad7a97608&units=metric`
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
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=bd5e378503939ddaee76f12ad7a97608&units=metric`
      );

      console.log(lat, lon);

      const next7DaysData = dailyWeatherResponse.data.daily.slice(1, 8);
      setDailyWeatherData(next7DaysData);
    } catch (error) {
      console.error("Error fetching daily weather data:", error);
    } finally {
      setLoading(false);
    }
  };



  const handleFetchWeather5DaysAgo = async () => {
    setShow5DaysAgoWeather(true);

    try {
      if (weatherData && weatherData.coord) {
        // Create an array to store historical weather data for each day
        const weatherData5DaysAgo = [];

        // Loop through the past 5 days
        for (let i = 1; i <= 5; i++) {
          // Calculate timestamp for the current day
          const dayTimestamp = Math.round((currentDateTime.getTime() - i * 24 * 60 * 60 * 1000) / 1000);

          // Fetch weather data for the current day based on current city
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&dt=${dayTimestamp}&appid=bd5e378503939ddaee76f12ad7a97608&units=metric`
          );

          // Store the weather data for the current day in the array
          weatherData5DaysAgo.push({ day: i, data: response.data });
        }

        // Set the state with the array of historical weather data
        setWeather5DaysAgo(weatherData5DaysAgo);
      }
    } catch (error) {
      console.error("Error fetching weather data 5 days ago:", error);
    }
  };

  const handleShowDetail5DaysAgo = async (dayData) => {
    try {
      const dayTimestamp = dayData.data.current.dt;
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&dt=${dayTimestamp}&appid=bd5e378503939ddaee76f12ad7a97608&units=metric`
      );

      setDetail5DaysAgoWeatherData(response.data);
      setShowDetail5DaysAgo(true);
    } catch (error) {
      console.error("Error fetching detailed weather data:", error);
    }
  };



  const handleFetchWeather30DaysAgo = async () => {
    setShow30DaysAgoWeather(true);

    try {
      if (weatherData && weatherData.coord) {
        const { lat, lon } = weatherData.coord;

        // Tính toán timestamp cho 30 ngày trước
        const thirtyDaysAgoTimestamp = Math.round((currentDateTime.getTime() - 30 * 24 * 60 * 60 * 1000) / 1000);

        // Lấy dữ liệu thời tiết cho 30 ngày trước dựa trên vị trí hiện tại
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${thirtyDaysAgoTimestamp}&appid=bd5e378503939ddaee76f12ad7a97608&units=metric`
        );

        setWeather30DaysAgo(response.data);
      }
    } catch (error) {
      console.error("Error fetching weather data 30 days ago:", error);
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

      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=bd5e378503939ddaee76f12ad7a97608&units=metric`
      );

      // Hourly Weather
      const hourlyWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&appid=bd5e378503939ddaee76f12ad7a97608&units=metric`
      );

      const filteredHourlyData = hourlyWeatherResponse.data.list.filter((item) => {
        const itemDate = new Date(item.dt * 1000);
        const currentDate = new Date();
        const next24Hours = new Date(currentDate);
        next24Hours.setHours(currentDate.getHours() + 24);

        console.log('dt:', item.dt);

        return itemDate >= currentDate && itemDate < next24Hours;
      });

      setHourlyWeatherData(filteredHourlyData);

      // Daily Weather
      const dailyWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${weatherResponse.data.coord.lat}&lon=${weatherResponse.data.coord.lon}&exclude=current,minutely,hourly,alerts&appid=bd5e378503939ddaee76f12ad7a97608&units=metric`
      );

      const next7DaysData = dailyWeatherResponse.data.daily.slice(1, 8);
      setDailyWeatherData(next7DaysData);


      // Weather 5 Days Ago
      const newWeather5DaysAgo = [];
      for (let i = 1; i <= 5; i++) {
        const dayTimestamp = Math.round((currentDateTime.getTime() - i * 24 * 60 * 60 * 1000) / 1000);

        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${weatherResponse.data.coord.lat}&lon=${weatherResponse.data.coord.lon}&dt=${dayTimestamp}&appid=bd5e378503939ddaee76f12ad7a97608&units=metric`
        );

        newWeather5DaysAgo.push({ day: i, data: response.data });
      }
      setWeather5DaysAgo(newWeather5DaysAgo);

      // Update current city
      setCurrentCity(searchCity);

      setWeatherData(weatherResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };



  // CLOSE
  const handleCloseHourlyWeather = () => {
    setShowHourlyWeather(false);
  };

  const handleCloseDailyWeather = () => {
    setShowDailyWeather(false);
  };

  const handleClose5DaysAgoWeather = () => {
    setShow5DaysAgoWeather(false);
  };

  const closeDetail5DaysAgo = () => {
    setShowDetail5DaysAgo(false);
  };

  const handleClose30DaysAgoWeather = () => {
    setShow30DaysAgoWeather(false);
  };


  useEffect(() => {
    getCurrentLocation();

    // Lắng nghe sự kiện click trên nền
    const handleOutsideClick = (e) => {
      if (showDetail5DaysAgo && !e.target.closest(".detail_weather_modal")) {
        closeDetail5DaysAgo();
      }
    };
    // Đăng ký sự kiện khi component được mount
    document.addEventListener("click", handleOutsideClick);

    // Hủy đăng ký sự kiện khi component unmount
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [showDetail5DaysAgo]);

  return (
    <div className="App">
      <div className="weather_header">
        <div className="Navbar-container">
          <Navbar
            setShowHourlyWeather={setShowHourlyWeather}
            setShowDailyWeather={setShowDailyWeather}
            setShow5DaysAgoWeather={handleFetchWeather5DaysAgo}
            setShow30DaysAgoWeather={handleFetchWeather30DaysAgo}
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
      {/* Hourly Weather */}
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


        {/* Daily Weather */}
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


{/* Weather 5 Days Ago */}
        {show5DaysAgoWeather && weather5DaysAgo && (
          <div className="FiveDays_ago_weather">
            <div className="FiveDays_ago_weather_title">
              <h2>Weather 5 Days Ago</h2>
              <button className="close_button" onClick={handleClose5DaysAgoWeather}>
                Close
              </button>
            </div>
            <div className="FiveDays_ago_weather_list">
              {weather5DaysAgo.map((dayData) => (
                <div key={dayData.day} className="FiveDays_ago_weather_item">
                  <p>{new Date(dayData.data.current.dt * 1000).toLocaleDateString()}</p>
                  <img
                    src={`http://openweathermap.org/img/wn/${dayData.data.current.weather[0].icon}.png`}
                    alt={dayData.data.current.weather[0].description}
                  />
                  <p>{Math.round(dayData.data.current.temp)}°C</p>
                  <p>Humidity: {dayData.data.current.humidity}%</p>
                  <p>Wind Speed: {dayData.data.current.wind_speed} m/s</p>
                  <p>Status: {dayData.data.current.weather[0].description}</p>
                  <button type="button" className="btn_details" onClick={() => handleShowDetail5DaysAgo(dayData)}>
                    Xem chi tiết
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showDetail5DaysAgo && detail5DaysAgoWeatherData && (
          <div className="detail_weather_modal">
            <div className="detail_weather_modal_title">
              <h2>Detailed Weather</h2>
              <h1>{new Date(detail5DaysAgoWeatherData.hourly[0].dt * 1000).toLocaleDateString()}</h1>
              <button className="close_button" onClick={closeDetail5DaysAgo}>
                Close
              </button>
            </div>
            <div className="detail_weather_modal_list">
              {detail5DaysAgoWeatherData.hourly.map((hourlyData) => (
                <div key={hourlyData.dt} className="detail_weather_modal_item">
                  <p>{new Date(hourlyData.dt * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
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


{/*  */}
        {show30DaysAgoWeather && weather30DaysAgo && (
          <div className="weather_30_days_ago">
            <div className="weather_30_days_ago_title">
              <h2>Weather 30 Days Ago</h2>
              <button className="close_button" onClick={handleClose30DaysAgoWeather}>
                Close
              </button>
            </div>
            <div className="weather_30_days_ago_list">
              {weather30DaysAgo.hourly.map((hourlyData) => (
                <div key={hourlyData.dt} className="weather_30_days_ago_item">
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

