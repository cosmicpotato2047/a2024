// OpenWeather API 키
const weatherApiKey = "bbe392b806253a8b3ca650555f40f031";

// 날씨 데이터를 가져와 화면에 업데이트하는 함수
function fetchWeatherData(latitude, longitude) {
  // OpenWeather API URL
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric&lang=kr`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      // 날씨 정보 업데이트
      updateWeatherContainer(data);

      // 옷차림 추천 업데이트
      const temp = data.main.temp;
      const feelsLike = data.main.feels_like;
      const tempMin = data.main.temp_min;
      const tempMax = data.main.temp_max;
      const weather = data.weather[0].main.toLowerCase();
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;

      const clothingAdvice = recommendClothing(temp, feelsLike, tempMin, tempMax, weather, humidity, windSpeed);
      document.getElementById("clothingAdvice").innerText = clothingAdvice;
    })
    .catch(error => console.error("날씨 데이터 요청 실패:", error));
}

// 날씨 정보를 화면에 표시하는 함수
function updateWeatherContainer(data) {
  const weatherContainer = document.getElementById("weatherContainer");
  
  // 데이터를 기반으로 DOM 요소 업데이트
  document.getElementById("location").innerText = data.name || "정보 없음";
  document.getElementById("temp").innerText = data.main.temp.toFixed(1);
  document.getElementById("feelsLike").innerText = data.main.feels_like.toFixed(1);
  document.getElementById("tempRange").innerText = `${data.main.temp_min.toFixed(1)} / ${data.main.temp_max.toFixed(1)}`;
  document.getElementById("description").innerText = data.weather[0].description;
  document.getElementById("humidity").innerText = data.main.humidity;
  document.getElementById("windSpeed").innerText = data.wind.speed;

  // 날씨 아이콘 업데이트
  const weatherIcon = document.getElementById("weatherIcon");
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIcon.style.display = "inline";
}

// 옷차림 추천 로직
 function recommendClothing(temp, feelsLike, tempMin, tempMax, weather, humidity, windSpeed) {
  let recommendation = getClothingByTemperature(temp);
  recommendation += " " + adjustForFeelsLike(temp, feelsLike);
  recommendation += " " + getClothingByWeather(weather);
  recommendation += " " + getClothingByHumidityAndWind(humidity, windSpeed);

  if (tempMax - tempMin > 10) {
    recommendation += "\n\n하루 동안 기온 변화가 크니 겹쳐 입을 수 있는 옷을 준비하세요.";
  }

  return recommendation.trim(); // 불필요한 공백 제거
}

// 온도에 따른 기본 추천
 function getClothingByTemperature(temp) {
  if (temp < 0) return "\n\n두꺼운 코트, 목도리, 장갑, 모자를 추천합니다.";
  if (temp < 10) return "\n\n따뜻한 자켓과 스웨터를 입으세요.";
  if (temp < 20) return "\n\n가벼운 자켓이나 긴팔 셔츠가 적당합니다.";
  if (temp < 30) return "\n\n반팔과 얇은 바지를 추천합니다.";
  return "\n\n민소매, 반바지, 선글라스를 준비하세요.";
}

// 체감 온도 반영
 function adjustForFeelsLike(temp, feelsLike) {
  const diff = temp - feelsLike;
  if (diff > 3) return "\n\n추위를 더 느낄 수 있으니 두꺼운 옷을 챙기세요.";
  if (diff < -3) return "\n\n실제 온도보다 덜 춥게 느껴질 수 있습니다. 얇은 옷을 선택하세요.";
  return "";
}

// 날씨 상태에 따른 추가 추천
 function getClothingByWeather(weather) {
  if (weather.includes("rain")) return "\n\n우산과 방수 재킷을 챙기세요.";
  if (weather.includes("snow")) return "\n\n방수 부츠와 따뜻한 옷을 준비하세요.";
  if (weather.includes("wind")) return "\n\n바람막이를 입는 것이 좋습니다.";
  return "";
}

// 습도와 바람 고려
 function getClothingByHumidityAndWind(humidity, windSpeed) {
  let advice = "";
  if (humidity > 70) advice += "\n\n습도가 높아 통풍이 잘 되는 옷을 추천합니다. ";
  if (windSpeed > 5) advice += "\n\n바람이 강하니 바람막이를 챙기세요.";
  return advice;
}

window.fetchWeatherData=fetchWeatherData;
window.updateWeatherContainer=updateWeatherContainer;
window.recommendClothing=recommendClothing;
window.getClothingByTemperature=getClothingByTemperature;
window.adjustForFeelsLike=adjustForFeelsLike;
window.getClothingByWeather=getClothingByWeather;
window.getClothingByHumidityAndWind=getClothingByHumidityAndWind;
