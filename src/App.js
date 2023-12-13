import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import Weather from "./Weather";
import Modal from "react-modal";
import "./App.css"; // Import CSS

function App() {
  const [weatherData, setWeatherData] = useState(null);
  // Du bao thoi tiet hien thi theo gio
  const [hourlyWeatherData, setHourlyWeatherData] = useState(null);
  const [searchCity, setSearchCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  // Show button Du bao theo gio
  const [showHourlyWeather, setShowHourlyWeather] = useState(false);

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

      // Lọc dữ liệu thời tiết theo từng giờ từ dữ liệu forecast
      const filteredHourlyData = hourlyWeatherResponse.data.list.filter(
        (item) => item.dt_txt.includes("12:00:00")
      );

      setHourlyWeatherData(filteredHourlyData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHourlyDataForDay = (data, day) => {
    const startOfDay = new Date(day);
    const endOfDay = new Date(day);
    endOfDay.setDate(endOfDay.getDate() + 1);

    return data.filter((item) => {
      const itemDate = new Date(item.dt * 1000);
      return itemDate >= startOfDay && itemDate < endOfDay;
    });
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
      const filteredHourlyData = getHourlyDataForDay(
        hourlyWeatherResponse.data.list,
        new Date()
      );

      setHourlyWeatherData(filteredHourlyData);
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleModal = () => {
    setIsModalOpen(!isModalOpen);
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
      <p>
        {getFormattedDate()} {currentDateTime.toLocaleTimeString()}
      </p>
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
        <button className="toggle_button" onClick={handleToggleModal}>
          {isModalOpen ? "Hide Hourly Weather" : "Show Hourly Weather"}
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {weatherData && <Weather data={weatherData} />}
      {showHourlyWeather && hourlyWeatherData && (
        <div className="hourly-weather">
          <h2>Hourly Weather</h2>
          <ul>
            {hourlyWeatherData.map((hourlyData) => (
              <li key={hourlyData.dt}>
                {new Date(hourlyData.dt * 1000).getHours()}:00 -{" "}
                {Math.round(hourlyData.main.temp)}°C
              </li>
            ))}
          </ul>
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleToggleModal}
        contentLabel="Hourly Weather Modal"
        className="Modal"
      >
        <h2>Hourly Weather</h2>
        <ul>
          {hourlyWeatherData &&
            hourlyWeatherData.map((hourlyData) => (
              <li key={hourlyData.dt}>
                {new Date(hourlyData.dt * 1000).getHours()}:00 -{" "}
                {Math.round(hourlyData.main.temp)}°C
              </li>
            ))}
        </ul>
        <button onClick={handleToggleModal}>Close</button>
      </Modal>
    </div>
  );
}

export default App;