// Navbar.js
import React from 'react';
import './assets/Navbar.css';

function Navbar({
    setShowHourlyWeather,
    setShowDailyWeather,
    setShow5DaysAgoWeather,
    setShow30DaysAgoWeather,
}) {
    return (
        <nav className="Navbar">
            <button className="Navbar-button" onClick={() => setShowHourlyWeather(true)}>
                Hourly Weather
            </button>
            <button className="Navbar-button" onClick={() => setShowDailyWeather(true)}>
                Daily Weather
            </button>
            <button className="Navbar-button" onClick={() => setShow5DaysAgoWeather(true)}>
                Weather 5 Days Ago
            </button>
            <button className="Navbar-button" onClick={() => setShow30DaysAgoWeather(true)}>
            Weather History 30 Days Ago
            </button>
        </nav>
    );
}

export default Navbar;