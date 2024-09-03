$(document).ready(function () {
    $('.owl-carousel').owlCarousel({
        rtl: true,
        loop: true,
        margin: 10,
        nav: true,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 3
            },
            1000: {
                items: 5
            }
        }
    });

    function updateTime(timezone) {
        const timeElement = document.getElementById('current-time');
        const dateElement = document.getElementById('current-date');
        const now = new Date();

        const options = { timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const dateOptions = { timeZone: timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const timeString = now.toLocaleTimeString('en-US', options);
        const dateString = now.toLocaleDateString('en-US', dateOptions);

        timeElement.innerText = timeString;
        dateElement.innerText = dateString;
    }

    function startClock(timezone) {
        updateTime(timezone);
        clearInterval(window.clockInterval);
        window.clockInterval = setInterval(() => {
            updateTime(timezone);
        }, 1000);
    }

    document.getElementById('search-btn').addEventListener('click', function () {
        const location = document.getElementById('location-input').value;
        fetchWeatherData(location);
    });

    function fetchWeatherData(location) {
        const apiKey = '5e16742af03942c9b3f171441242608';
        fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=5`)
            .then(response => response.json())
            .then(data => {
                updateWeatherUI(data);
                const timezone = data.location.tz_id;
                startClock(timezone);
            })
            .catch(error => console.error('Error fetching the weather data:', error));
    }

    function updateWeatherUI(data) {
        const location = data.location;
        document.getElementById('city-name').innerText = location.name;

        const current = data.current;
        document.getElementById('icon').src = current.condition.icon;
        document.getElementById('icon').alt = current.condition.text;
        document.getElementById('temp').innerText = `${current.temp_c}°C`;
        document.getElementById('weather-desc').innerText = current.condition.text;
        document.getElementById('humidity').innerText = `Humidity: ${current.humidity}%`;
        document.getElementById('wind-speed').innerText = `Wind Speed: ${current.wind_kph} km/h`;
        document.getElementById('pressure').innerText = `Pressure: ${current.pressure_mb} hPa`;
        document.getElementById('uv-index').innerText = `UV: ${current.uv}`;
        document.getElementById('sunrise').innerText = `Sunrise: ${data.forecast.forecastday[0].astro.sunrise}`;
        document.getElementById('sunset').innerText = `Sunset: ${data.forecast.forecastday[0].astro.sunset}`;

        const hourlyForecastContainer = $('#hourly-forecast');
        hourlyForecastContainer.owlCarousel('destroy');  // Destroy previous instance
        hourlyForecastContainer.empty();  // Clear previous content

        data.forecast.forecastday[0].hour.forEach(hour => {
            hourlyForecastContainer.append(`
                <div class="item">
                    <p>${hour.time.split(' ')[1]}</p>
                    <img src="${hour.condition.icon}" alt="${hour.condition.text}">
                    <p>${hour.temp_c}°C</p>
                    <p>${hour.wind_kph} km/h</p>
                </div>
            `);
        });

        hourlyForecastContainer.owlCarousel({
            rtl: true,
            loop: true,
            margin: 10,
            nav: true,
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 3
                },
                1000: {
                    items: 5
                }
            }
        });

        const fiveDayForecastContainer = $('#five-day-forecast');
        fiveDayForecastContainer.owlCarousel('destroy');  // Destroy previous instance
        fiveDayForecastContainer.empty();  // Clear previous content

        data.forecast.forecastday.forEach(day => {
            fiveDayForecastContainer.append(`
                <div class="item day-forecast">
                    <p>${new Date(day.date).toDateString()}</p>
                    <img src="${day.day.condition.icon}" alt="${day.day.condition.text}">
                    <p>${day.day.maxtemp_c}°C / ${day.day.mintemp_c}°C</p>
                </div>
            `);
        });

        fiveDayForecastContainer.owlCarousel({
            rtl: true,
            loop: true,
            margin: 10,
            nav: true,
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 3
                },
                1000: {
                    items: 5
                }
            }
        });
    }

    function fetchCurrentLocationWeather() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherData(`${lat},${lon}`);
            }, error => {
                console.error('Error getting location:', error);
                fetchWeatherData('Colombo');
            });
        } else {
            fetchWeatherData('Colombo');
        }
    }

    fetchCurrentLocationWeather();
});
