/* ============================================================
   FIND YOUR DUO — Matchmaking Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  const playersList = document.getElementById('players-list');
  const filterGame = document.getElementById('filter-game');
  const filterRank = document.getElementById('filter-rank');
  const applyBtn = document.getElementById('apply-filters');
  const pageTitle = document.getElementById('page-title');
  const playerCountOnline = document.getElementById('player-count-online');
  const filterBtns = document.querySelectorAll('.btn-filter');
  
  let allPlayersData = [];

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
    filterRank.innerHTML = '<option value="all">All Ranks</option>';
    ranks.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      filterRank.appendChild(opt);
    });
    
    pageTitle.textContent = `Find ${game.charAt(0).toUpperCase() + game.slice(1)} Duos`;
  }

  async function fetchPlayers() {
    if (playersList) playersList.innerHTML = '<div id="loading-state"><div class="spinner"></div></div>';
    
    const game = filterGame.value;
    const rank = filterRank.value;

    try {
      console.log(`Searching for ${game} players with rank: ${rank}...`);
      
      let query = supabase
        .from('profiles')
        .select('*')
        .filter('selected_games', 'cs', `["${game}"]`)
        .order('updated_at', { ascending: false });

      if (rank !== 'all') {
        query = query.filter(`${game}_details->>rank`, 'eq', rank);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      allPlayersData = data || [];
      renderPlayers(allPlayersData);
      if (playerCountOnline) playerCountOnline.textContent = allPlayersData.length;

    } catch (err) {
      console.error('Error fetching players:', err);
      if (playersList) playersList.innerHTML = '<div class="no-results"><h3>Error loading players</h3><p>Please try again later.</p></div>';
    }
  }

  function renderPlayers(players) {
    if (!playersList) return;

    if (!players || players.length === 0) {
      playersList.innerHTML = '<div class="no-results"><h3>Nenhum jogador encontrado</h3><p>Tenta mudar os filtros de rank.</p></div>';
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

  // Quick Filters logic
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const range = btn.dataset.range;
      filterByRange(range);
    });
  });

  function filterByRange(range) {
    if (range === 'all') {
      renderPlayers(allPlayersData);
      return;
    }

    const filtered = allPlayersData.filter(p => {
      const rank = (p.valorant_details && p.valorant_details.rank) || 'Unranked';
      if (range === 'iron-bronze') return rank.includes('Iron') || rank.includes('Bronze') || rank.includes('Silver');
      if (range === 'gold-plat') return rank.includes('Gold') || rank.includes('Platinum');
      if (range === 'diamond-plus') return rank.includes('Diamond') || rank.includes('Ascendant') || rank.includes('Immortal') || rank.includes('Radiant');
      return true;
    });

    renderPlayers(filtered);
  }

  filterGame.addEventListener('change', () => {
    updateRankOptions();
    fetchPlayers();
  });

  if (applyBtn) {
    applyBtn.addEventListener('click', fetchPlayers);
  }

  // Initial load
  updateRankOptions();
  fetchPlayers();
});
