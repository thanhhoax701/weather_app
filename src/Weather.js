import React from 'react';
import './assets/Weather.css'; // Import CSS

const Weather = ({ data }) => {
    const formatTime = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
        });
    };

    const getWeatherIcon = () => {
        // Lấy tên của icon từ dữ liệu thời tiết thực tế
        const icon = data.weather[0].icon;
        // Tạo link đến icon từ API OpenWeatherMap
        const iconUrl = `http://openweathermap.org/img/w/${icon}.png`;
        // Trả về JSX hiển thị icon
        return <img src={iconUrl} alt="Weather Icon" />;
    };

    return (
        <div className="Weather">
            <h2 className="weather_country">
                {getWeatherIcon()}
                {data.name}, {data.sys.country}
            </h2>
            <div className="flex">
                <p className="weather_items_one">Temperature: {Math.round(data.main.temp)} °C</p>
                <p className="weather_items_one">Weather: {data.weather[0].description}</p>
            </div>
            <div className="flex">
                <p className="weather_items_two">Humidity: {data.main.humidity}%</p>
                <p className="weather_items_two">Wind Speed: {data.wind.speed} m/s</p>
            </div>
            <div className="flex">
                <p className="weather_items_three">Sunrise: {formatTime(data.sys.sunrise)}</p>
                <p className="weather_items_three">Sunset: {formatTime(data.sys.sunset)}</p>
            </div>
        </div>
    );
};

export default Weather;