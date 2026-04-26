/* ============================================================
   FIND YOUR DUO — Matchmaking Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  const playersList = document.getElementById('players-list');
  const filterGame = document.getElementById('filter-game');
  const applyBtn = document.getElementById('apply-filters');
  const pageTitle = document.getElementById('page-title');
  const playerCountOnline = document.getElementById('player-count-online');
  const rankSelectDropdown = document.getElementById('rank-select-dropdown');
  const rankSelectTrigger = document.getElementById('rank-select-trigger');
  const rankSelectLabel = document.getElementById('rank-select-label');
  
  let allPlayersData = [];
  let selectedRanks = [];

  // Toggle dropdown
  if (rankSelectTrigger) {
    rankSelectTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      rankSelectDropdown.classList.toggle('open');
      rankSelectDropdown.style.display = rankSelectDropdown.classList.contains('open') ? 'block' : 'none';
    });
  }

  document.addEventListener('click', (e) => {
    if (rankSelectTrigger && rankSelectDropdown && !rankSelectTrigger.contains(e.target) && !rankSelectDropdown.contains(e.target)) {
      rankSelectDropdown.classList.remove('open');
      rankSelectDropdown.style.display = 'none';
    }
  });

  const rankOptions = {
    'valorant': ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'],
    'rocket-league': ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Champion', 'Grand Champ', 'SSL'],
    'apex': ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Predator'],
    'fortnite': ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Elite', 'Champion', 'Unreal'],
    'cs2': ['Silver', 'Gold Nova', 'Master Guardian', 'Legendary Eagle', 'Supreme', 'Global Elite']
  };

  const rankIcons = {
    'Iron': 'https://vpdgphvxzqatgzihibzy.supabase.co/storage/v1/object/public/Valorant/Iron_3_Rank.webp',
    'Bronze': 'https://vpdgphvxzqatgzihibzy.supabase.co/storage/v1/object/public/Valorant/Bronze_3_Rank.webp',
    'Silver': 'https://vpdgphvxzqatgzihibzy.supabase.co/storage/v1/object/public/Valorant/Silver_3_Rank.webp',
    'Gold': 'https://vpdgphvxzqatgzihibzy.supabase.co/storage/v1/object/public/Valorant/Gold_3_Rank.webp',
    'Platinum': 'https://vpdgphvxzqatgzihibzy.supabase.co/storage/v1/object/public/Valorant/Platinum_3_Rank.webp',
    'Diamond': 'https://vpdgphvxzqatgzihibzy.supabase.co/storage/v1/object/public/Valorant/Diamond_3_Rank.webp',
    'Ascendant': 'https://vpdgphvxzqatgzihibzy.supabase.co/storage/v1/object/public/Valorant/Ascendant_3_Rank.webp',
    'Immortal': 'https://vpdgphvxzqatgzihibzy.supabase.co/storage/v1/object/public/Valorant/Immortal_3_Rank.webp',
    'Radiant': 'https://vpdgphvxzqatgzihibzy.supabase.co/storage/v1/object/public/Valorant/Radiant_Rank.webp'
  };

  // Get initial game from URL
  const urlParams = new URLSearchParams(window.location.search);
  const initialGame = urlParams.get('game') || 'valorant';
  filterGame.value = initialGame;

  function updateRankOptions() {
    const game = filterGame.value;
    const ranks = rankOptions[game] || [];
    
    if (rankSelectDropdown) {
      rankSelectDropdown.innerHTML = '';
      selectedRanks = [];
      updateRankLabel();
      
      ranks.forEach(r => {
        const opt = document.createElement('label');
        opt.className = 'custom-option';
        
        // Find icon for this rank
        const rankImg = rankIcons[r] || ''; 
        const imgHtml = rankImg ? `<img src="${rankImg}" class="rank-option-bg" alt="">` : '';
        
        opt.innerHTML = `
          <input type="checkbox" value="${r}">
          <span class="rank-option-text">${r}</span>
          ${imgHtml}
        `;
        
        opt.querySelector('input').addEventListener('change', (e) => {
          if (e.target.checked) {
            opt.classList.add('selected');
            if (!selectedRanks.includes(r)) selectedRanks.push(r);
          } else {
            opt.classList.remove('selected');
            selectedRanks = selectedRanks.filter(val => val !== r);
          }
          updateRankLabel();
        });
        
        rankSelectDropdown.appendChild(opt);
      });
    }
    
    pageTitle.textContent = `Find ${game.charAt(0).toUpperCase() + game.slice(1)} Duos`;
  }

  function updateRankLabel() {
    if (!rankSelectLabel) return;
    if (selectedRanks.length === 0) {
      rankSelectLabel.textContent = 'All Ranks';
    } else if (selectedRanks.length === 1) {
      rankSelectLabel.textContent = selectedRanks[0];
    } else {
      rankSelectLabel.textContent = `${selectedRanks.length} Ranks Selected`;
    }
  }

  async function fetchPlayers() {
    if (playersList) playersList.innerHTML = '<div id="loading-state"><div class="spinner"></div></div>';
    
    const game = filterGame.value;

    try {
      console.log(`Searching for ${game} players...`);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .filter('selected_games', 'cs', `["${game}"]`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      allPlayersData = data || [];
      filterAndRenderPlayers();

    } catch (err) {
      console.error('Error fetching players:', err);
      if (playersList) playersList.innerHTML = `
        <div class="no-results fade-up visible" style="border-color: rgba(255, 70, 85, 0.2);">
          <div class="no-results-icon">
            <div class="no-results-glow"></div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3>Erro ao carregar</h3>
          <p>Tente novamente mais tarde.</p>
        </div>
      `;
    }
  }

  function filterAndRenderPlayers() {
    let filtered = allPlayersData;
    
    if (selectedRanks.length > 0) {
      filtered = allPlayersData.filter(p => {
        const gameDetails = p[`${filterGame.value}_details`] || {};
        const pRank = gameDetails.rank || 'Unranked';
        return selectedRanks.some(selected => pRank.includes(selected));
      });
    }
    
    renderPlayers(filtered);
    if (playerCountOnline) playerCountOnline.textContent = filtered.length;
  }

  function renderPlayers(players) {
    if (!playersList) return;

    if (!players || players.length === 0) {
      playersList.innerHTML = `
        <div class="no-results fade-up visible">
          <div class="no-results-icon">
            <div class="no-results-glow"></div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 10h.01"/>
              <path d="M15 10h.01"/>
              <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>
            </svg>
          </div>
          <h3>Nenhum jogador encontrado</h3>
          <p>Não há jogadores com esses filtros. Tente expandir sua busca para mais ranks ou outro jogo!</p>
        </div>
      `;
      return;
    }

    playersList.innerHTML = '';
    players.forEach(profile => {
      const game = filterGame.value;
      const valDetails = profile.valorant_details || {};
      const pRank = valDetails.rank || 'Unranked';
      const agents = valDetails.agents || [];
      const username = profile.username || 'Anonymous';
      const initial = username[0].toUpperCase();
      
      // Mock stats for Valorant
      const kd = (Math.random() * (1.5 - 0.8) + 0.8).toFixed(2);
      const wr = Math.floor(Math.random() * (60 - 40) + 40) + '%';

      const avatarHTML = profile.avatar_url 
        ? `<img src="${profile.avatar_url}" alt="${username}">`
        : initial;

      const row = document.createElement('div');
      row.className = 'player-row fade-up visible';
      row.onclick = (e) => {
        if (!e.target.closest('.invite-btn')) {
          window.location.href = `user.html?id=${profile.id}`;
        }
      };

      const rankImg = rankIcons[pRank] || 'https://vpdgphvxzqatgzihibzy.supabase.co/storage/v1/object/public/Valorant/Iron_3_Rank.webp';

      row.innerHTML = `
        <div class="status-dot-large"></div>
        <div class="player-row-avatar">${avatarHTML}</div>
        <div class="player-row-info">
          <div class="player-row-name-wrap">
            <span class="player-row-name">${username}</span>
            <div class="rank-badge-list" style="background: ${getRankColor(pRank, 0.1)}; color: ${getRankColor(pRank, 1)}">
              ${pRank}
            </div>
          </div>
          <div class="stats-group">
            <span>K/D <b>${kd}</b></span>
            <span>WR <b>${wr}</b></span>
          </div>
        </div>
        <div class="player-row-agents">
          ${(agents || []).slice(0, 2).map(a => `<span class="agent-tag-list">${a}</span>`).join('') || '<span class="agent-tag-list">N/A</span>'}
        </div>
        <button class="invite-btn">Convidar</button>
        <img class="rank-bg-icon" src="${rankImg}" alt="">
      `;
      playersList.appendChild(row);
    });
  }

  function getRankColor(rank, opacity) {
    if (rank.includes('Immortal') || rank.includes('Radiant')) return `rgba(255, 70, 85, ${opacity})`;
    if (rank.includes('Diamond')) return `rgba(186, 114, 255, ${opacity})`;
    if (rank.includes('Platinum')) return `rgba(46, 226, 255, ${opacity})`;
    if (rank.includes('Gold')) return `rgba(255, 201, 63, ${opacity})`;
    return `rgba(156, 163, 175, ${opacity})`;
  }



  filterGame.addEventListener('change', () => {
    updateRankOptions();
    fetchPlayers();
  });

  if (applyBtn) {
    applyBtn.addEventListener('click', filterAndRenderPlayers);
  }

  // Initial load
  updateRankOptions();
  fetchPlayers();
});
