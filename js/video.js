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
  
window.searchLiveStreams = searchLiveStreams;
