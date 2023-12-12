import React from 'react';
import './Weather.css'; // Import CSS

const Weather = ({ data }) => {
    return (
        <div className="Weather">
            <h2 className="weather_country">{data.name}, {data.sys.country}</h2>
            <p className="weather_items">Temperature: {data.main.temp} °C</p>
            <p className="weather_items">Weather: {data.weather[0].description}</p>
            <p className="weather_items">Humidity: {data.main.humidity}%</p>
            <p className="weather_items">Wind Speed: {data.wind.speed} m/s</p>
        </div>
    );
};

export default Weather;