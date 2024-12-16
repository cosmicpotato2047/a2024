
document.addEventListener("DOMContentLoaded", () => {
  // "시작하기" 버튼 클릭 이벤트
  const startButton = document.getElementById("startButton");
  startButton.addEventListener("click", () => {
    // 설명 화면 숨기기
    document.getElementById("introScreen").style.display = "none";
    // 초기 화면 표시
    document.getElementById("initialScreen").style.display = "flex";
  });

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

function useCurrentLocation() {
  navigator.geolocation.getCurrentPosition(position => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Geocoding으로 주소 가져오기
    getAddressFromCoordinates(latitude, longitude, address => {
      openModal("mapModal");
      document.getElementById("modalContent").innerHTML = `
        <div id="googleMap" style="width: 100%; height: 300px;"></div>
        <p>현재 위치: ${address}</p>
        <p>여기가 맞습니까?</p>
        <button onclick="confirmCurrentLocation(${latitude}, ${longitude})">Yes</button>
        <button onclick="declineCurrentLocation()">No</button>
      `;
      initMap(latitude, longitude);
    });
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
    <p>경도, 위도: <span id="selectedLocation">없음</span></p>
    <p>주소: <spain id="selectedAddress">없음</span></p>
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
    center: { lat: 37.7749, lng: -122.4194 }, // 기본 위치
    zoom: 12,
  });

  map.addListener("click", e => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    getAddressFromCoordinates(lat, lng, address => {
      document.getElementById("selectedLocation").innerText = `${lat},${lng}`; // 위도, 경도 저장
      document.getElementById("selectedAddress").innerText = address; // 주소도 보여줌
    });
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


function returnToLocationSetup() {
  // 현재 모달을 닫고 초기 위치 설정 화면 표시
  closeModal('placeModal');
  document.getElementById('infoScreen').style.display = 'none';
  document.getElementById('initialScreen').style.display = 'flex';
}


// Geocoding API를 사용해 위도와 경도를 주소로 변환
function getAddressFromCoordinates(lat, lng, callback) {
  const apiKey = "AIzaSyAzs_JWrd2fjQl388h83v2xDT7UeheB-Sw"; // Google Maps API 키
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.status === "OK" && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        callback(address); // 주소를 콜백으로 전달
      } else {
        callback("주소를 가져올 수 없습니다."); // 오류 처리
      }
    })
    .catch(() => callback("Geocoding 요청 실패"));
}



window.getAddressFromCoordinates = getAddressFromCoordinates;







      
