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

  // 지도와 정보 로드
  loadMap(latitude, longitude);
  loadWeather(latitude, longitude);
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
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&location=${lat},${lng}&locationRadius=50km&key=${apiKey}`;

  fetch(searchUrl)
    .then(response => response.json())
    .then(data => {
      if (data.items && data.items.length > 0) {
        const videoIds = data.items.map(item => item.id.videoId).join(",");
        const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,liveStreamingDetails&id=${videoIds}&key=${apiKey}`;

        return fetch(videoDetailsUrl)
          .then(response => response.json())
          .then(details => {
            const allowedCategories = [19, 22, 24, 26, 27]; // 필터링할 카테고리
            const videoContainer = document.getElementById("youtubeVideos");
            videoContainer.innerHTML = "";

            // 필터링: 허용된 카테고리에 해당하는 영상만 포함
            const filteredVideos = details.items.filter(video =>
              allowedCategories.includes(parseInt(video.snippet.categoryId))
            );

            // 정렬: 현재 시청자 수 기준으로 내림차순
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
                  <img src="${video.snippet.thumbnails.default.url}" alt="썸네일" style="width: 120px; height: auto; margin-right: 15px; border-radius: 8px;">
                  <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" style="color: blue; text-decoration: underline; display: block; margin-bottom: 8px;">영상 보러가기</a>
                  <div style="flex-grow: 1;">
                    <h4>${formattedTitle} <br>[채널: ${video.snippet.channelTitle}]</h4>
                    <p>현재 시청자 수: ${video.liveStreamingDetails?.concurrentViewers || "정보 없음"}</p>
                    <p>현재 위치와의 거리: </p>
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



      

