# 🌍 어디 갈래? - 스마트 여행 가이드  

**어디 갈래?**는 사용자의 현재 위치 또는 선택한 도시를 기반으로 **맞춤형 여행 정보**를 제공하는 웹 애플리케이션입니다.  
실시간 날씨, 주변 명소 검색, 유튜브 라이브 스트리밍 등을 활용하여 보다 스마트한 여행을 돕습니다.  

![Project Preview_1](assets/preview_1.png) 
![Project Preview_2](assets/preview_2.png)  


---

## 📌 주요 기능  

✔️ **실시간 날씨 정보 제공** (`OpenWeather API`)  
- 현재 위치 또는 선택한 도시의 기온, 체감 온도, 날씨 상태, 풍속 등을 표시  
- 습도, 풍속 등을 고려한 **옷차림 추천 기능** 포함  

✔️ **주변 명소 검색** (`Google Places API`)  
- 숙박, 음식점, 쇼핑, 야외 활동, 문화·예술 등 **13개 주요 카테고리**에서 장소 탐색  
- 장소별 평점, 주소, 운영 시간 등 제공  

✔️ **YouTube 실시간 스트리밍 검색** (`YouTube Data API`)  
- 현재 위치 반경 50km 내에서 **라이브 이벤트 검색**  
- 시청자 수 기준으로 정렬하여 인기 스트림 표시  

✔️ **문화·언어 팁 제공** (`REST Countries API`)  
- 여행하는 국가의 인구, 수도, 통화, 지역 정보 제공  
- 한국어/영어/중국어/스페인어 등 다국어 기본 회화 지원  

✔️ **사용자 맞춤형 위치 설정**  
- 현재 위치 자동 감지 (Geolocation API)  
- 직접 원하는 도시 선택 가능  

---

## 🛠️ 기술 스택  

- **Frontend:** HTML, CSS, JavaScript  
- **APIs:**  
  - [Google Maps API](https://developers.google.com/maps) - 지도 및 위치 정보 제공  
  - [Google Places API](https://developers.google.com/places/web-service/intro) - 장소 검색  
  - [OpenWeather API](https://openweathermap.org/) - 실시간 날씨 데이터 제공  
  - [YouTube Data API](https://developers.google.com/youtube/) - 라이브 영상 검색  
  - [REST Countries API](https://restcountries.com/) - 국가별 기본 정보 제공  
- **호스팅:** GitHub Pages  

---

## 🚀 실행 방법

### 1. 로컬에서 실행

```bash
# 프로젝트 클론
git clone https://github.com/yourusername/your-repository.git

# 프로젝트 디렉터리로 이동
cd your-repository

# index.html을 브라우저에서 열기

```

### 2. GitHub Pages에서 실행

1. 프로젝트를 GitHub에 업로드한 후
2. **Settings → Pages**에서 `main` 브랜치의 `root` 선택
3. URL을 통해 웹사이트에 접속 가능

---

## 📌 프로젝트 구조

```
📂 어디 갈래?
│-- 📂 assets/         # 이미지 및 아이콘
│-- 📂 css/            # 스타일시트
│-- 📂 js/             # 주요 기능별 JavaScript 파일
│   │-- weather.js      # 날씨 정보 API 처리
│   │-- location.js     # 장소 검색 및 지도 API 처리
│   │-- details.js      # 국가 정보 및 문화 팁 기능
│   │-- video.js        # YouTube 실시간 스트림 검색
│   │-- scripts.js      # 메인 화면 및 위치 설정 로직
│-- 📜 index.html      # 메인 HTML 파일
│-- 📜 README.md       # 프로젝트 설명 파일

```

---

## 📋 주요 코드 설명

### 📍 **날씨 정보 가져오기 (`weather.js`)**

- OpenWeather API를 사용하여 실시간 날씨 데이터를 가져오고 화면에 표시
- 기온, 체감 온도, 풍속 등을 고려한 **옷차림 추천 기능** 포함

```jsx
function fetchWeatherData(latitude, longitude) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric&lang=kr`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      updateWeatherContainer(data);
      document.getElementById("clothingAdvice").innerText = recommendClothing(data);
    })
    .catch(error => console.error("날씨 데이터 요청 실패:", error));
}

```

### 🏨 **주변 명소 검색 (`location.js`)**

- Google Places API를 사용해 다양한 카테고리별 장소 검색
- 선택한 카테고리에 따라 정렬 기준 설정 (인기도 vs. 거리순)

```jsx
function searchPlaces() {
  const request = {
    location: new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
    radius: 3000,
    type: document.getElementById("subCategory").value,
  };

  const service = new google.maps.places.PlacesService(document.createElement("div"));
  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      updatePlaceSearchResultScreen(results);
    } else {
      alert("검색 결과가 없습니다. 조건을 변경해주세요.");
    }
  });
}

```

### 🎥 **YouTube 라이브 스트리밍 검색 (`video.js`)**

- 현재 위치 기준 반경 50km 내의 라이브 스트리밍 검색
- 시청자 수 기준으로 인기 영상 정렬

```jsx
function searchLiveStreams() {
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&location=${currentLocation.lat},${currentLocation.lng}&locationRadius=50km&maxResults=5&key=${apiKey}`;

  fetch(searchUrl)
    .then(response => response.json())
    .then(data => {
      displayLiveStreams(data.items);
    });
}

```

---

## 🔥 개발 목표 및 향후 개선점

- ✅ **GitHub Pages를 활용한 배포**
- ✅ **Git을 활용한 코드 관리 및 협업 학습**
- 🔲 **사용자 로그인 기능 추가** (여행 기록 저장)
- 🔲 **여행 플래너 기능 구현** (맞춤형 일정 추천)
- 🔲 **추가 API 연동** (숙박 예약, 환율 정보 등)

---

## 📞 문의

해당 프로젝트에 대한 질문이나 개선 제안이 있다면,

**이슈 등록** 또는 **PR을 통해 기여**해 주세요! 🎉

🔗 **GitHub Repository:** [your-repository-link](https://github.com/cosmicpotato2047/where-to-go)
