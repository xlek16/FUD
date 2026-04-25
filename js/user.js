/* ============================================================
   FIND YOUR DUO — Public User Profile JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  const loadingOverlay = document.getElementById('loading-overlay');
  const userUsername = document.getElementById('user-username');
  const userAvatar = document.getElementById('user-avatar');
  const userBio = document.getElementById('user-bio');
  const gamesList = document.getElementById('games-list');
  const valorantSection = document.getElementById('valorant-section');
  const valRankIcon = document.getElementById('val-rank-icon');
  const valRankName = document.getElementById('val-rank-name');
  const valAgents = document.getElementById('val-agents');
  const socialSection = document.getElementById('social-section');
  const discordName = document.getElementById('discord-name');

  // Rank icons mapping
  const rankIcons = {
    'Unranked': 'https://vpdgphvxzqatgzihibzy.supabase.co/storage/v1/object/public/Valorant/Iron_1_Rank.webp',
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

  const gameInfo = {
    'valorant': { name: 'Valorant', icon: 'Fotos/valorant.webp' },
    'rocket-league': { name: 'Rocket League', icon: 'Fotos/rocket-league-true.webp' },
    'apex': { name: 'Apex Legends', icon: 'Fotos/Apex_legends_simple_logo.jpg' },
    'fortnite': { name: 'Fortnite', icon: 'Fotos/Fortnite_F_lettermark_logo.png' },
    'cs2': { name: 'CS2', icon: 'Fotos/valorant.webp' } // Placeholder for CS2
  };

  // Get user ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');

  if (!userId) {
    window.location.href = 'index.html';
    return;
  }

  async function loadUserProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Basic Info
      const username = data.username || 'Anonymous User';
      userUsername.textContent = username;
      
      if (data.avatar_url) {
        userAvatar.innerHTML = `<img src="${data.avatar_url}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
      } else {
        userAvatar.textContent = username[0].toUpperCase();
      }
      
      userBio.textContent = data.bio || 'This user hasn\'t written a bio yet.';

      // Socials
      if (data.social_links && data.social_links.discord) {
        socialSection.style.display = 'block';
        discordName.textContent = data.social_links.discord;
      }

      // Games
      const games = data.selected_games || [];
      if (games.length > 0) {
        gamesList.innerHTML = '';
        games.forEach(gameKey => {
          const info = gameInfo[gameKey];
          if (info) {
            const badge = document.createElement('div');
            badge.className = 'game-badge';
            badge.innerHTML = `<img src="${info.icon}" alt=""> <span>${info.name}</span>`;
            gamesList.appendChild(badge);
          }
        });
      } else {
        gamesList.innerHTML = '<p style="color: var(--text-tertiary); font-size: 14px;">No games selected yet.</p>';
      }

      // Valorant Details
      if (games.includes('valorant')) {
        valorantSection.style.display = 'block';
        const valDetails = data.valorant_details || {};
        const rank = valDetails.rank || 'Unranked';
        valRankName.textContent = rank;
        const rankImg = rankIcons[rank];
        valRankIcon.src = rankImg;
        const bgIcon = document.getElementById('val-rank-bg');
        if (bgIcon) bgIcon.src = rankImg;
        
        const agents = valDetails.agents || [];
        if (agents.length > 0) {
          valAgents.innerHTML = '';
          agents.forEach(agent => {
            const tag = document.createElement('span');
            tag.className = 'agent-tag';
            tag.textContent = agent;
            valAgents.appendChild(tag);
          });
        } else {
          valAgents.innerHTML = '<p style="color: var(--text-tertiary); font-size: 13px;">No agents specified.</p>';
        }
      }

    } catch (err) {
      console.error('Error loading user profile:', err);
      userUsername.textContent = 'User Not Found';
    } finally {
      loadingOverlay.style.opacity = '0';
      setTimeout(() => loadingOverlay.style.display = 'none', 300);
    }
  }

  loadUserProfile();
});
