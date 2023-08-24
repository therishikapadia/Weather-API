const cityCoordinates = {};

fetch('city_coordinates.csv')
    .then(response => response.text())
    .then(data => {
        const rows = data.split('\n');
        for (const row of rows.slice(1)) {
            const [latitude, longitude, city, country] = row.split(',');
            const cityName = city.toLowerCase().trim();
            cityCoordinates[cityName] = { lat: parseFloat(latitude), lon: parseFloat(longitude) };

            // Dynamically add city options to the selector
            const option = document.createElement('option');
            option.value = cityName;
            option.textContent = `${city}, ${country}`;
            citySelector.appendChild(option);
        }
    });

const fetchWeatherButton = document.getElementById('fetchWeather');
const citySelector = document.getElementById('citySelector');
const weatherDisplay = document.getElementById('weatherDisplay');

fetchWeatherButton.addEventListener('click', () => {
    const selectedCity = citySelector.value;
    const coordinates = cityCoordinates[selectedCity];
    if (!coordinates) {
        weatherDisplay.innerHTML = 'Coordinates not available.';
        return;
    }

    const apiUrl = `http://www.7timer.info/bin/api.pl?lon=${coordinates.lon}&lat=${coordinates.lat}&product=civil&output=json`;

    // Make API request
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const currentDate = new Date();
            const forecastData = data.dataseries;
            
            let weatherHTML = `<h2>${selectedCity.toUpperCase()} Weather Forecast</h2>`;
            weatherHTML += '<ul>';

            for (let index = 0; index < 7; index++) {
                const forecastDate = new Date(currentDate);
                forecastDate.setDate(currentDate.getDate() + index); // Increment date for each forecast
                
                const dayData = forecastData[index];
                const formattedDate = forecastDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                const weatherImage = getWeatherImage(dayData.weather);
        

                weatherHTML += `
                    <li>
                        <strong>${formattedDate}</strong><br>
                        <img class="weather-icon" src="${weatherImage}" alt="${dayData.weather}">
                        Temperature: ${dayData.temp2m}°C
                    </li>`;
            }

            weatherHTML += '</ul>';
            weatherDisplay.innerHTML = weatherHTML;
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            weatherDisplay.innerHTML = 'An error occurred while fetching weather data.';
        });
});

function getWeatherImage(weather) {
    // This is a simplified mapping of weather conditions to images
    // Make sure the image paths are correct based on your file structure
    const weatherImages = {
        clear:'js/images/clear.png',
        pcloudy: 'js/images/pcloudy.png',
        mcloudy: 'js/images/mcloudy.png',
        cloudy: 'js/images/cloudy.png',
        lightrain: 'js/images/lightrain.png',
        rain: 'js/images/rain.png',
        lightsnow: 'js/images/lightsnow.png',
        snow: 'js/images/snow.png'
    };

    const lowerCaseWeather = weather.toLowerCase();
    return weatherImages[lowerCaseWeather] || 'js/images/default.png';
}

// Get the #container element
const container = document.getElementById('container');

// Function to calculate luminance from RGB values
function calculateLuminance(r, g, b) {
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// Function to update the container text color based on background luminance
function updateTextColor() {
    const bodyStyles = getComputedStyle(document.body);
    const backgroundColor = bodyStyles.backgroundImage.includes('linear-gradient') ?
                            bodyStyles.backgroundImage : bodyStyles.backgroundColor;
    const rgbValues = backgroundColor.match(/\d+/g);

    if (rgbValues) {
        const luminance = calculateLuminance(...rgbValues);
        const textColor = luminance > 0.5 ? '#000000' : '#ffffff';
        container.style.color = textColor;
    }
}

// Call the updateTextColor function initially and on window resize
updateTextColor();
window.addEventListener('resize', updateTextColor);

