// scripts.js

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
      loadInfoScreen(latitude, longitude);
    });
  }
  
  // 구글 지도 모달 열기
  function openMapModal() {
    alert('지도에서 위치를 선택하는 기능을 구현합니다.'); // 실제 구현에선 구글 맵 API와 연동
  }
  
  // 위치가 설정된 후 정보 화면 표시
  function loadInfoScreen(latitude, longitude) {
    document.getElementById("initialScreen").style.display = "none";
    document.getElementById("infoScreen").style.display = "flex";
    
    // 지도와 날씨, 랜드마크 정보를 설정된 위치에 맞춰 로드합니다
    loadMap(latitude, longitude);
    loadWeather(latitude, longitude);
    loadLandmarks(latitude, longitude);
    loadYouTubeVideos(latitude, longitude);
  }
  
  // 위치에 맞춰 지도 로드 (예시, 실제로는 구글 맵 API 필요)
  function loadMap(latitude, longitude) {
    const mapContainer = document.getElementById('mapContainer');
    mapContainer.innerHTML = `<p>Map showing location: (${latitude}, ${longitude})</p>`;
  }
  
  // 날씨 정보 로드 (예시, 실제로는 날씨 API 필요)
  function loadWeather(latitude, longitude) {
    const weatherInfo = document.getElementById('weatherInfo');
    weatherInfo.innerHTML = `<p>날씨 정보: 맑음, 25도</p>`;
    document.getElementById('clothingAdvice').innerText = "추천 복장: 가벼운 옷차림";
  }
  
  // 랜드마크 정보 로드 (예시)
  function loadLandmarks(latitude, longitude) {
    const landmarksList = document.getElementById('landmarksList');
    landmarksList.innerHTML = "<li>랜드마크 1</li><li>랜드마크 2</li>";
  }
  
  // 유튜브 영상 로드 (예시)
  function loadYouTubeVideos(latitude, longitude) {
    const youtubeVideos = document.getElementById('youtubeVideos');
    youtubeVideos.innerHTML = "<p>추천 영상 로드 중...</p>";
  }
  
  