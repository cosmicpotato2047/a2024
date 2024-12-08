// 화면 로드 시 LittleP와 GLOBE의 크기를 조정
document.addEventListener("DOMContentLoaded", () => {
  const littleP = document.getElementById("littlep");
  const globe = document.getElementById("globe");

  // 화면 크기가 작으면 크기를 조정
  if (window.innerWidth < 500) {
    globe.style.width = "200px";
    littleP.style.width = "8%";
  }
});


// 모달 열기
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

// 모달 닫기
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// 현재 위치 사용
function useCurrentLocation() {
  navigator.geolocation.getCurrentPosition(position => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // 모달 열기 및 현재 위치 표시
    openModal("mapModal");
    document.getElementById("modalContent").innerHTML = `
      <div id="googleMap" style="width: 100%; height: 300px;"></div>
      <p>현재 위치: (${latitude.toFixed(6)}, ${longitude.toFixed(6)})</p>
      <p>여기가 맞습니까?</p>
      <button onclick="confirmCurrentLocation(${latitude}, ${longitude})">Yes</button>
      <button onclick="declineCurrentLocation()">No</button>
    `;
    initMap(latitude, longitude);
  });
}

function confirmCurrentLocation(lat, lng) {
  closeModal("mapModal");
  loadInfoScreen(lat, lng);
}

function declineCurrentLocation() {
  alert("직접 위치 설정을 눌러주세요.");
  closeModal("mapModal");
}

// 직접 위치 설정
function openDirectLocationModal() {
  openModal("mapModal");
  document.getElementById("modalContent").innerHTML = `
    <div id="googleMap" style="width: 100%; height: 300px;"></div>
    <p>설정한 위치: <span id="selectedLocation">없음</span></p>
    <button onclick="nextAfterLocationSelection()">Next</button>
  `;
  initSelectableMap();
}

function nextAfterLocationSelection() {
  const locationText = document.getElementById("selectedLocation").innerText;
  if (locationText === "없음") {
    alert("위치를 먼저 선택하세요.");
  } else {
    closeModal("mapModal");
    const [lat, lng] = locationText.split(",").map(Number);
    loadInfoScreen(lat, lng);
  }
}

function initMap(lat, lng) {
  const map = new google.maps.Map(document.getElementById("googleMap"), {
    center: { lat, lng },
    zoom: 15,
  });
  new google.maps.Marker({ position: { lat, lng }, map });
}

function initSelectableMap() {
  const map = new google.maps.Map(document.getElementById("googleMap"), {
    center: { lat: 37.7749, lng: -122.4194 }, // San Francisco default
    zoom: 12,
  });

  map.addListener("click", e => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    document.getElementById("selectedLocation").innerText = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  });
}

// 정보 화면 로드
let currentLocation = {};
function loadInfoScreen(latitude, longitude) {
  currentLocation = { lat: latitude, lng: longitude };

  document.getElementById("initialScreen").style.display = "none";
  document.getElementById("infoScreen").style.display = "flex";

  // 날씨 데이터를 가져오고 화면 업데이트
  fetchWeatherData(latitude, longitude);
  
}

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
  weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
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

function openCountryDetails() {
  if (!currentLocation.lat || !currentLocation.lng) {
    alert("위치를 먼저 설정하세요.");
    return;
  }

  const { lat, lng } = currentLocation;
  const username = "jackie_chan"; 
  const nearbyUrl = `http://api.geonames.org/findNearbyPlaceNameJSON?lat=${lat}&lng=${lng}&username=${username}`;

  // 1. 가까운 장소를 가져오기
  fetch(nearbyUrl)
    .then(response => response.json())
    .then(data => {
      if (data.geonames && data.geonames.length > 0) {
        const countryCode = data.geonames[0].countryCode;

        // 2. 국가 세부 정보를 가져오기
        const countryInfoUrl = `http://api.geonames.org/countryInfoJSON?country=${countryCode}&username=${username}`;

        return fetch(countryInfoUrl)
          .then(response => response.json())
          .then(countryData => {
            if (countryData.geonames && countryData.geonames.length > 0) {
              const country = countryData.geonames[0];

              // 3. 국가 정보를 표시
              const content = `
                <h3>${country.countryName} 정보</h3>
                <p>언어: ${country.languages}</p>
                <p>통화: ${country.currencyCode}</p>
                <p>국제 전화 코드: +${country.countryCode}</p>
                <p>인구: ${country.population}</p>
                <p><a href="https://en.wikipedia.org/wiki/${country.countryName}" target="_blank">Wikipedia에서 자세히 보기</a></p>
              `;
              document.getElementById("countryDetailsContent").innerHTML = content;
              openModal("countryDetailsModal");
            } else {
              alert("국가 세부 정보를 가져올 수 없습니다.");
            }
          });
      } else {
        alert("근처 장소 정보를 찾을 수 없습니다.");
      }
    })
    .catch(error => console.error("API 요청 오류:", error));
}


const languageTips = {
  english: [
    "Hello! → 안녕하세요! (Hello!)",
    "How much is this? → 이거 얼마에요? (How much is this?)",
    "Where is the restroom? → 화장실 어디에요? (Where is the restroom?)",
    "I don’t understand. → 이해하지 못해요. (I don’t understand.)",
    "Can you help me? → 도와줄 수 있나요? (Can you help me?)",
    "I’m lost. → 길을 잃었어요. (I’m lost.)",
    "Can you speak English? → 영어 할 수 있어요? (Can you speak English?)",
    "I’d like to order… → ...을(를) 주문하고 싶어요. (I’d like to order…)",
    "What time is it now? → 지금 몇 시에요? (What time is it now?)",
    "Excuse me, how do I get to [place]? → 실례합니다, [장소]에 어떻게 가요? (Excuse me, how do I get to [place]?)"
  ],
  chinese: [
    "你好! → 안녕하세요! (Ni hao!)",
    "这个多少钱? → 이거 얼마에요? (Zhe ge duo shao qian?)",
    "厕所在哪里? → 화장실 어디에요? (Ce suo zai na li?)",
    "我听不懂. → 이해하지 못해요. (Wo ting bu dong.)",
    "你可以帮我吗? → 도와줄 수 있나요? (Ni ke yi bang wo ma?)",
    "我迷路了. → 길을 잃었어요. (Wo mi lu le.)",
    "你会说英语吗? → 영어 할 수 있어요? (Ni hui shuo ying yu ma?)",
    "我想点... → ...을(를) 주문하고 싶어요. (Wo xiang dian...)",
    "现在几点? → 지금 몇 시에요? (Xian zai ji dian?)",
    "请问, 到[장소]怎么走? → 실례합니다, [장소]에 어떻게 가요? (Qing wen, dao [place] zen me zou?)"
  ],
  hindi: [
    "नमस्ते! → 안녕하세요! (Namaste!)",
    "यह कितने का है? → 이거 얼마에요? (Yah kitne ka hai?)",
    "शौचालय कहाँ है? → 화장실 어디에요? (Shauchalay kahan hai?)",
    "मैं समझ नहीं पाया/पाई. → 이해하지 못해요. (Main samajh nahi paya/payi.)",
    "क्या आप मेरी मदद कर सकते हैं? → 도와줄 수 있나요? (Kya aap meri madad kar sakte hain?)",
    "मैं रास्ता भटक गया/गई. → 길을 잃었어요. (Main rasta bhatak gaya/gayi.)",
    "क्या आप अंग्रेजी बोल सकते हैं? → 영어 할 수 있어요? (Kya aap angrezi bol sakte hain?)",
    "मैं ... मँगवाना चाहता/चाहती हूँ. → ...을(를) 주문하고 싶어요. (Main ... mangwana chahta/chahti hoon.)",
    "अभी क्या समय हुआ है? → 지금 몇 시에요? (Abhi kya samay hua hai?)",
    "माफ़ कीजिए, [장소] कैसे जाएँ? → 실례합니다, [장소]에 어떻게 가요? (Maaf kijiye, [place] kaise jayein?)"
  ],
  spanish: [
    "¡Hola! → 안녕하세요! (Hola!)",
    "¿Cuánto cuesta esto? → 이거 얼마에요? (¿Cuánto cuesta esto?)",
    "¿Dónde está el baño? → 화장실 어디에요? (¿Dónde está el baño?)",
    "No entiendo. → 이해하지 못해요. (No entiendo.)",
    "¿Puede ayudarme? → 도와줄 수 있나요? (¿Puede ayudarme?)",
    "Estoy perdido/perdida. → 길을 잃었어요. (Estoy perdido/perdida.)",
    "¿Habla inglés? → 영어 할 수 있어요? (¿Habla inglés?)",
    "Quiero pedir... → ...을(를) 주문하고 싶어요. (Quiero pedir...)",
    "¿Qué hora es? → 지금 몇 시에요? (¿Qué hora es?)",
    "Disculpe, ¿cómo llego a [장소]? → 실례합니다, [장소]에 어떻게 가요? (Disculpe, ¿cómo llego a [place]?)"
  ],
  french: [
    "Bonjour! → 안녕하세요! (Bonjour!)",
    "Combien ça coûte? → 이거 얼마에요? (Combien ça coûte?)",
    "Où sont les toilettes? → 화장실 어디에요? (Où sont les toilettes?)",
    "Je ne comprends pas. → 이해하지 못해요. (Je ne comprends pas.)",
    "Pouvez-vous m’aider? → 도와줄 수 있나요? (Pouvez-vous m’aider?)",
    "Je suis perdu/perdue. → 길을 잃었어요. (Je suis perdu/perdue.)",
    "Parlez-vous anglais? → 영어 할 수 있어요? (Parlez-vous anglais?)",
    "Je voudrais commander... → ...을(를) 주문하고 싶어요. (Je voudrais commander...)",
    "Quelle heure est-il? → 지금 몇 시에요? (Quelle heure est-il?)",
    "Excusez-moi, comment aller à [장소]? → 실례합니다, [장소]에 어떻게 가요? (Excusez-moi, comment aller à [place]?)"
  ], 
  arabic: [
    "مرحبًا! → 안녕하세요! (Marhaban!)",
    "كم سعر هذا؟ → 이거 얼마에요? (Kam siar hadha?)",
    "أين الحمام؟ → 화장실 어디에요? (Ayn alhamam?)",
    "لا أفهم. → 이해하지 못해요. (La afham.)",
    "هل يمكنك مساعدتي؟ → 도와줄 수 있나요? (Hal yumkinuka musaeadati?)",
    "أنا تائه. → 길을 잃었어요. (Ana taeih.)",
    "هل تتحدث الإنجليزية؟ → 영어 할 수 있어요? (Hal tatahaddath al'iinjilizia?)",
    "أريد طلب... → ...을(를) 주문하고 싶어요. (Arid talab...)",
    "كم الساعة الآن؟ → 지금 몇 시에요? (Kam alsaeat alan?)",
    "عذرًا، كيف أذهب إلى [장소]؟ → 실례합니다, [장소]에 어떻게 가요? (Eadhraan, kayfa adhhab 'iilaa [place]?)"
  ],
  bengali: [
    "হ্যালো! → 안녕하세요! (Hyalo!)",
    "এটা কত দাম? → 이거 얼마에요? (Eta koto dam?)",
    "টয়লেট কোথায়? → 화장실 어디에요? (Toilet kothay?)",
    "আমি বুঝতে পারছি না. → 이해하지 못해요. (Ami bujhte parchi na.)",
    "আপনি কি আমাকে সাহায্য করতে পারেন? → 도와줄 수 있나요? (Apni ki amake shahajyo korte paren?)",
    "আমি পথ হারিয়ে ফেলেছি. → 길을 잃었어요. (Ami poth hariye felechi.)",
    "আপনি কি ইংরেজি বলতে পারেন? → 영어 할 수 있어요? (Apni ki ingreji bolte paren?)",
    "আমি ... অর্ডার করতে চাই. → ...을(를) 주문하고 싶어요. (Ami ... order korte chai.)",
    "এখন কত সময়? → 지금 몇 시에요? (Ekhon koto somoy?)",
    "মাফ করবেন, [장소] কীভাবে যাব? → 실례합니다, [장소]에 어떻게 가요? (Maf korben, [place] kivabe jabo?)"
  ],  
  portuguese: [
    "Olá! → 안녕하세요! (Olá!)",
    "Quanto custa isso? → 이거 얼마에요? (Quanto custa isso?)",
    "Onde fica o banheiro? → 화장실 어디에요? (Onde fica o banheiro?)",
    "Eu não entendo. → 이해하지 못해요. (Eu não entendo.)",
    "Você pode me ajudar? → 도와줄 수 있나요? (Você pode me ajudar?)",
    "Estou perdido/perdida. → 길을 잃었어요. (Estou perdido/perdida.)",
    "Você fala inglês? → 영어 할 수 있어요? (Você fala inglês?)",
    "Eu gostaria de pedir... → ...을(를) 주문하고 싶어요. (Eu gostaria de pedir...)",
    "Que horas são agora? → 지금 몇 시에요? (Que horas são agora?)",
    "Com licença, como chego a [장소]? → 실례합니다, [장소]에 어떻게 가요? (Com licença, como chego a [place]?)"
  ],
  russian: [
    "Здравствуйте! → 안녕하세요! (Zdravstvuyte!)",
    "Сколько это стоит? → 이거 얼마에요? (Skol'ko eto stoit?)",
    "Где находится туалет? → 화장실 어디에요? (Gde nakhoditsya tualet?)",
    "Я не понимаю. → 이해하지 못해요. (Ya ne ponimayu.)",
    "Вы можете мне помочь? → 도와줄 수 있나요? (Vy mozhete mne pomoch'?)",
    "Я заблудился/заблудилась. → 길을 잃었어요. (Ya zabludilsya/zabludilas'.)",
    "Вы говорите по-английски? → 영어 할 수 있어요? (Vy govorite po-angliyski?)",
    "Я хотел(а) бы заказать... → ...을(를) 주문하고 싶어요. (Ya khotel(a) by zakazat'...)",
    "Который час сейчас? → 지금 몇 시에요? (Kotoryy chas seychas?)",
    "Извините, как пройти к [장소]? → 실례합니다, [장소]에 어떻게 가요? (Izvinite, kak proyti k [place]?)"
  ],
  urdu: [
    "سلام! → 안녕하세요! (Salaam!)",
    "یہ کتنے کا ہے؟ → 이거 얼마에요? (Yeh kitne ka hai?)",
    "بیت الخلا کہاں ہے؟ → 화장실 어디에요? (Bait-ul-khala kahan hai?)",
    "میں نہیں سمجھتا/سمجھتی. → 이해하지 못해요. (Main nahi samajhta/samajhti.)",
    "کیا آپ میری مدد کر سکتے ہیں؟ → 도와줄 수 있나요? (Kya aap meri madad kar sakte hain?)",
    "میں راستہ بھول گیا/گئی ہوں. → 길을 잃었어요. (Main rasta bhool gaya/gayi hoon.)",
    "کیا آپ انگریزی بول سکتے ہیں؟ → 영어 할 수 있어요? (Kya aap angrezi bol sakte hain?)",
    "میں ... کا آرڈر دینا چاہتا/چاہتی ہوں. → ...을(를) 주문하고 싶어요. (Main ... ka order dena chahta/chahti hoon.)",
    "ابھی کیا وقت ہوا ہے؟ → 지금 몇 시에요? (Abhi kya waqt hua hai?)",
    "معاف کیجئے، [장소] کیسے جاؤں؟ → 실례합니다, [장소]에 어떻게 가요? (Maaf kijiye, [place] kaise jaoon?)"
  ]  
};

function openLanguageTips() {
  openModal("languageTipsModal");
  updateLanguageTips();
}

function updateLanguageTips() {
  const selectedLanguage = document.getElementById("languageSelect").value;
  const tips = languageTips[selectedLanguage] || [];
  const content = tips.map(tip => `<p>${tip}</p>`).join("");
  document.getElementById("languageTipsContent").innerHTML = content;
}







const subCategories = {
  lodging: ['lodging', 'tourist_attraction', 'campground', 'rv_park'], // 숙박 및 관광
  food: ['restaurant', 'cafe', 'bakery', 'meal_delivery', 'meal_takeaway', 'food'], // 음식점
  shopping: [
    'shopping_mall', 'store', 'book_store', 'clothing_store', 
    'electronics_store', 'furniture_store', 'jewelry_store', 
    'department_store', 'convenience_store', 'grocery_or_supermarket'
  ], // 쇼핑 및 상업
  outdoor: ['park', 'zoo', 'aquarium', 'amusement_park', 'natural_feature'], // 야외 활동 및 자연
  culture: ['art_gallery', 'museum', 'library', 'movie_theater', 'stadium'], // 문화 및 예술
  transport: [
    'airport', 'bus_station', 'subway_station', 'train_station', 
    'taxi_stand', 'transit_station', 'car_rental', 'parking', 'gas_station'
  ], // 교통 및 여행
  alcohol: ['liquor_store', 'bar', 'night_club'], // 주류
  convenience: [
    'beauty_salon', 'hair_care', 'spa', 'laundry', 'car_repair', 
    'hardware_store', 'home_goods_store'
  ], // 기타 편의 시설
  health: ['hospital', 'pharmacy', 'doctor', 'dentist', 'veterinary_care', 'gym'], // 건강 및 의료
  public: [
    'school', 'university', 'post_office', 'city_hall', 
    'embassy', 'fire_station', 'police', 'local_government_office'
  ], // 공공 서비스 및 기관
  finance: ['atm', 'bank', 'accounting', 'insurance_agency', 'real_estate_agency'], // 금융 및 비즈니스
  religion: [
    'church', 'hindu_temple', 'mosque', 'synagogue', 'cemetery', 'place_of_worship'
  ] // 종교 및 기념
};

function populateSubCategories() {
  const mainCategory = document.getElementById('mainCategory').value;
  const subCategorySelect = document.getElementById('subCategory');
  subCategorySelect.innerHTML = ''; // 기존 옵션 제거

  subCategories[mainCategory].forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    subCategorySelect.appendChild(option);
  });
}

function searchPlaces() {
  if (!currentLocation.lat || !currentLocation.lng) {
    alert("위치를 먼저 설정하세요.");
    return;
  }
  const mainCategory = document.getElementById("mainCategory").value;
  const subCategory = document.getElementById("subCategory").value;
  const radius = document.getElementById("radius").value;
  const sortBy = document.getElementById("sortBy").value;

  if (!mainCategory || !subCategory) {
    alert("카테고리를 선택해주세요.");
    return;
  }

  // 현재 위치 가져오기
  const { lat, lng } = currentLocation;

  const request = {
    location: new google.maps.LatLng(lat, lng),
    radius: sortBy === "prominence" ? parseInt(radius, 10) : undefined,
    type: subCategory,
    rankBy: sortBy === "distance" ? google.maps.places.RankBy.DISTANCE : undefined,
  };

  const service = new google.maps.places.PlacesService(document.createElement("div"));
  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      updatePlaceSearchResultScreen(results, { mainCategory, subCategory, radius, sortBy });
    } else {
      alert("검색 결과가 없습니다. 조건을 변경해주세요.");
    }
  });
}

// 검색 결과 화면 업데이트
function updatePlaceSearchResultScreen(results, conditions) {
  // 화면 전환
  document.getElementById("placeModal").style.display = "none";
  document.getElementById("infoScreen").style.display = "none";
  document.getElementById("placeSearchResultScreen").style.display = "flex";

  // 조건 표시
  const conditionsContainer = document.getElementById("selectedConditions");
  conditionsContainer.innerHTML = `
    <h3>선택한 조건</h3>
    <p>중위 카테고리: ${conditions.mainCategory}</p>
    <p>하위 카테고리: ${conditions.subCategory}</p>
    <p>반경: ${conditions.radius || "거리 기반"}</p>
    <p>정렬 기준: ${conditions.sortBy}</p>
  `;

  // 장소 목록 표시
  const resultsContainer = document.querySelector(".place-list");
  resultsContainer.innerHTML = ""; // 기존 내용 초기화

  results.forEach((place, index) => {
    const placeElement = document.createElement("div");
    placeElement.className = "place-item";
    placeElement.innerHTML = `
      <h3>${place.name}</h3>
      <p>주소: ${place.vicinity || "정보 없음"}</p>
      <p>평점: ${place.rating || "정보 없음"} (${place.user_ratings_total || 0} 리뷰)</p>
    `;
    placeElement.addEventListener("click", () => {
      map.setCenter(place.geometry.location);
      map.setZoom(15);
    });
    resultsContainer.appendChild(placeElement);
  });

// 지도 표시
  const mapContainer = document.getElementById("resultMap");
  let parent = mapContainer.parentElement;
while (parent) {
  console.log("Parent element:", parent);
  console.log("Parent offsetWidth:", parent.offsetWidth);
  console.log("Parent offsetHeight:", parent.offsetHeight);
  parent = parent.parentElement;
}
;
  mapContainer.innerHTML = ""; // 기존 지도 초기화
  
  
  if (currentLocation.lat && currentLocation.lng) {
    const map = new google.maps.Map(mapContainer, {
      center: currentLocation,
      zoom: 13,
    });

    results.forEach((place, index) => {
      const marker = new google.maps.Marker({
        position: place.geometry.location,
        map,
        label: `${index + 1}`,
      });

      marker.addListener("click", () => {
        map.setCenter(marker.getPosition());
        map.setZoom(15);
      });
    });
  } else {
    console.error("currentLocation이 비어 있음:", currentLocation);
    alert("현재 위치를 설정한 후 다시 시도하세요.");
  }
}

function goBackToSearch() {
  document.getElementById('placeSearchResultScreen').style.display = 'none';
  document.getElementById('infoScreen').style.display = 'flex';
}





//youtube api
function searchLiveStreams() {
  if (!currentLocation.lat || !currentLocation.lng) {
    alert("현재 위치가 설정되지 않았습니다. 위치를 먼저 설정해주세요.");
    return;
  }

  const { lat, lng } = currentLocation; // infoScreen에서 설정된 currentLocation 사용
  const apiKey = "AIzaSyAzs_JWrd2fjQl388h83v2xDT7UeheB-Sw"; // API 키를 여기서 불러옵니다.
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&location=${lat},${lng}&locationRadius=50km&maxResults=5&fields=items(id,snippet(channelId,channelTitle,title,thumbnails.default.url))&key=${apiKey}`;

  fetch(searchUrl)
    .then(response => response.json())
    .then(data => {
      if (data.items && data.items.length > 0) {
        const videoIds = data.items.map(item => item.id.videoId).join(",");
        const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoIds}&key=${apiKey}`;

        return fetch(videoDetailsUrl)
          .then(response => response.json())
          .then(details => {
            const allowedCategories = [19, 22, 24, 26, 27]; // 필터링할 카테고리
            const videoContainer = document.getElementById("youtubeVideos");
            videoContainer.innerHTML = "";

            // 필터링: 허용된 카테고리에 해당하는 영상만 포함
            const filteredVideos = details.items.filter(video =>
              video.snippet.categoryId && allowedCategories.includes(parseInt(video.snippet.categoryId))
            );

            // 정렬: 실시간은 시청자 수
            const sortedVideos = filteredVideos.sort((a, b) => {
              
                const aViewers = parseInt(a.liveStreamingDetails?.concurrentViewers || 0, 10);
                const bViewers = parseInt(b.liveStreamingDetails?.concurrentViewers || 0, 10);
                return bViewers - aViewers;
              
              
            });

            // 정렬된 결과를 UI에 표시 
            sortedVideos.forEach(video => {
              const videoElement = document.createElement("div");
              videoElement.className = "live-video-item";
            
              // 제목을 40자마다 <br> 삽입
              const formattedTitle = video.snippet.title.replace(/(.{40})/g, "$1<br>");
              
          
              
        
              
              videoElement.innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <img src="${video.snippet.thumbnails.default.url}" alt="썸네일" style="width: 200px; height: auto; margin-right: 15px; border-radius: 8px;">
                  <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" style="color: blue; text-decoration: underline; display: block; margin-bottom: 8px;">영상 보러가기</a>
                  <div style="flex-grow: 1;">
                    <h4>${formattedTitle} <br>[채널: ${video.snippet.channelTitle}]</h4>
                    <p>현재 시청자 수: ${video.liveStreamingDetails?.concurrentViewers || "0"}</p>
                    
                  </div>
                </div>
              `;
              videoContainer.appendChild(videoElement);
            });
            // 모달 열기
            openModal("youtubeModal");
          });
      } else {
        const videoContainer = document.getElementById("youtubeVideos");
        videoContainer.innerHTML = "<p>근처에서 방송 중인 라이브 스트림이 없습니다.</p>";
        openModal("youtubeModal");
      }
    })
    .catch(error => {
      console.error("YouTube API 요청 실패:", error);
      const videoContainer = document.getElementById("youtubeVideos");
      videoContainer.innerHTML = "<p>영상을 가져오는 데 실패했습니다.</p>";
      openModal("youtubeModal");
    });
}



      

