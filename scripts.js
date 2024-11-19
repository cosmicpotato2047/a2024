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
    center: { lat: 37.5665, lng: 126.9780 }, // Seoul default
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
  loadLandmarks(latitude, longitude);
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

function loadLandmarks(latitude, longitude) {
  const landmarksList = document.getElementById('landmarksList');
  landmarksList.innerHTML = "<li>랜드마크 1</li><li>랜드마크 2</li>";
}

function loadYouTubeVideos(latitude, longitude) {
  const youtubeVideos = document.getElementById('youtubeVideos');
  youtubeVideos.innerHTML = "<p>추천 영상 로드 중...</p>";
}
