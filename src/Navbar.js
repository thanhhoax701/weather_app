import React from 'react';
import './assets/Navbar.css';

function Navbar({
    setShowHourlyWeather,
    setShowDailyWeather,
    setShow30DaysWeather,
}) {
    return (
        <nav className="Navbar">
            <button className="Navbar-button" onClick={() => setShowHourlyWeather(true)}>
                Hourly Weather
            </button>
            <button className="Navbar-button" onClick={() => setShowDailyWeather(true)}>
                Daily Weather
            </button>
            <button className="Navbar-button" onClick={() => setShow30DaysWeather(true)}>
                30 Days Weather
            </button>
        </nav>
    );
}

export default Navbar;