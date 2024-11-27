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
function loadInfoScreen(latitude, longitude) {
  document.getElementById("initialScreen").style.display = "none";
  document.getElementById("infoScreen").style.display = "flex";

  // 지도와 정보 로드
  loadMap(latitude, longitude);
  loadWeather(latitude, longitude);
  loadYouTubeVideos(latitude, longitude);
}

function loadMap(latitude, longitude) {
  const mapContainer = document.getElementById('mapContainer');
  mapContainer.innerHTML = `<p>Map showing location: (${latitude}, ${longitude})</p>`;
}

function loadWeather(latitude, longitude) {
  const weatherInfo = document.getElementById('weatherInfo');
  weatherInfo.innerHTML = `<p>날씨 정보: 맑음, 25도</p>`;
  document.getElementById('clothingAdvice').innerText = "추천 복장: 가벼운 옷차림";
}

function loadYouTubeVideos(latitude, longitude) {
  const youtubeVideos = document.getElementById('youtubeVideos');
  youtubeVideos.innerHTML = "<p>추천 영상 로드 중...</p>";
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
  // 선택된 조건 가져오기
  const mainCategory = document.getElementById('mainCategory').value;
  const subCategory = document.getElementById('subCategory').value;
  const radius = document.getElementById('radius').value;
  const sortBy = document.getElementById('sortBy').value;

  // 조건 표시
  document.getElementById('selectedConditions').innerHTML = `
    중위 카테고리: ${mainCategory}<br>
    하위 카테고리: ${subCategory}<br>
    반경: ${radius}m<br>
    정렬 기준: ${sortBy}
  `;

  // 결과 화면으로 전환
  document.getElementById('placeModal').style.display = 'none';
  document.getElementById('infoScreen').style.display = 'none';
  document.getElementById('placeSearchResultScreen').style.display = 'flex';

  // 검색 로직 추가 (Google Places API 호출 등)
  loadSearchResults(subCategory, radius, sortBy);
}

function showMapView() {
  const resultContainer = document.getElementById('resultContainer');
  resultContainer.innerHTML = `<div id="mapView" style="width: 100%; height: 400px;"></div>`;

  const map = new google.maps.Map(document.getElementById('mapView'), {
    center: { lat: 37.7749, lng: -122.4194 }, // 임의의 중심 좌표
    zoom: 12,
  });

  // 예제 장소 데이터
  const places = [
    { name: "Place 1", lat: 37.7749, lng: -122.4194 },
    { name: "Place 2", lat: 37.7849, lng: -122.4294 },
  ];

  places.forEach(place => {
    new google.maps.Marker({
      position: { lat: place.lat, lng: place.lng },
      map,
      title: place.name,
    });
  });
}


function showTableView() {
  const resultContainer = document.getElementById('resultContainer');
  const places = [
    { name: "Place 1", address: "123 Street", rating: 4.5 },
    { name: "Place 2", address: "456 Avenue", rating: 4.0 },
  ];

  let tableHTML = `
    <table border="1" style="width: 100%; text-align: left;">
      <tr>
        <th>이름</th>
        <th>주소</th>
        <th>평점</th>
      </tr>
  `;

  places.forEach(place => {
    tableHTML += `
      <tr>
        <td>${place.name}</td>
        <td>${place.address}</td>
        <td>${place.rating}</td>
      </tr>
    `;
  });

  tableHTML += `</table>`;
  resultContainer.innerHTML = tableHTML;
}


function goBackToSearch() {
  document.getElementById('placeSearchResultScreen').style.display = 'none';
  document.getElementById('infoScreen').style.display = 'flex';
}
