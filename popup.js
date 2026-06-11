document.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.getElementById('game-container');
  const refreshBtn = document.getElementById('refresh-btn');

  function fetchSteamRecommendation() {
    gameContainer.innerHTML = '<p class="loading">추천 게임을 고르는 중...</p>';
    
    chrome.runtime.sendMessage({ action: "fetchSteamData" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        gameContainer.innerHTML = '<p class="loading" style="color: #ff4d4d;">통신 에러가 발생했습니다.</p>';
        return;
      }

      if (response && response.success) {
        const data = response.data;
        const games = data.featured_win;
        
        if (games && games.length > 0) {
          const randomIndex = Math.floor(Math.random() * games.length);
          const selectedGame = games[randomIndex];
          
          displayGame(selectedGame);
        } else {
          gameContainer.innerHTML = '<p class="loading">추천할 게임 목록이 비어 있습니다.</p>';
        }
      } else {
        const errorMsg = response ? response.error : '알 수 없는 오류';
        gameContainer.innerHTML = `<p class="loading" style="color: #ff4d4d;">연결 거부됨 (우회 실패)<br><span style="font-size: 10px; color: #aaa;">${errorMsg}</span></p>`;
      }
    });
  }

  function displayGame(game) {
    let priceText = '정보 없음';
    if (game.final_price === 0) {
      priceText = '무료 플레이';
    } else if (game.final_price) {
      const formattedPrice = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: game.currency || 'KRW' }).format(game.final_price / 100);
      priceText = game.discounted ? `세일중! ${formattedPrice}` : formattedPrice;
    }

    const storeUrl = `https://store.steampowered.com/app/${game.id}/`;

    gameContainer.innerHTML = `
      <div class="game-card">
        <img class="game-img" src="${game.large_capsule_image}" alt="${game.name}">
        <div class="game-title">${game.name}</div>
        <div class="game-price">${priceText}</div>
        <a href="${storeUrl}" target="_blank" class="store-link">스팀 상점에서 보기</a>
      </div>
    `;
  }

  refreshBtn.addEventListener('click', fetchSteamRecommendation);
  fetchSteamRecommendation();
});