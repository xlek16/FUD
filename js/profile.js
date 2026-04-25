/* ============================================================
   FIND YOUR DUO — Profile Page JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  const loadingOverlay = document.getElementById('loading-overlay');
  const displayUsername = document.getElementById('display-username');
  const displayEmail = document.getElementById('display-email');
  const profileAvatar = document.getElementById('profile-avatar');
  const avatarUrlInput = document.getElementById('avatar-url');
  const bioInput = document.getElementById('bio');
  const discordInput = document.getElementById('discord');
  const gameOptions = document.querySelectorAll('.game-option');
  const valorantSection = document.getElementById('valorant-details');
  const agentPills = document.querySelectorAll('.agent-pill');
  const valRankSelect = document.getElementById('val-rank');
  const valRankIconOwn = document.getElementById('val-rank-icon-own');
  const valRankNameOwn = document.getElementById('val-rank-name-own');
  const saveBar = document.getElementById('save-bar');
  
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
  const saveBtn = document.getElementById('save-btn');
  const logoutBtn = document.getElementById('nav-logout');

  let currentUserId = null;
  let hasChanges = false;
  let selectedGames = [];
  let selectedAgents = [];

  // 1. Auth Check
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    window.location.href = 'login.html';
    return;
  }

  currentUserId = user.id;
  displayEmail.textContent = user.email;

  // 2. Load Profile Data
  async function loadProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();

      if (error) throw error;

      // Update UI
      displayUsername.textContent = data.username || user.email.split('@')[0];
      profileAvatar.textContent = (data.username || user.email)[0].toUpperCase();
      avatarUrlInput.value = data.avatar_url || '';
      bioInput.value = data.bio || '';
      
      // Update preview if avatar_url exists
      if (data.avatar_url) {
        profileAvatar.innerHTML = `<img src="${data.avatar_url}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
      } else {
        profileAvatar.textContent = (data.username || user.email)[0].toUpperCase();
      }
      
      const socials = data.social_links || {};
      discordInput.value = socials.discord || '';

      // Load Games
      selectedGames = data.selected_games || [];
      gameOptions.forEach(opt => {
        if (selectedGames.includes(opt.dataset.game)) {
          opt.classList.add('selected');
        }
      });
      toggleGameSections();

      // Load Valorant Details
      const valDetails = data.valorant_details || {};
      selectedAgents = valDetails.agents || [];
      agentPills.forEach(pill => {
        if (selectedAgents.includes(pill.textContent)) {
          pill.classList.add('selected');
        }
      });
      valRankSelect.value = valDetails.rank || 'Unranked';
      
      // Update Rank Icon
      if (valRankIconOwn && valRankNameOwn) {
        valRankNameOwn.textContent = valRankSelect.value;
        const rankImg = rankIcons[valRankSelect.value];
        valRankIconOwn.src = rankImg;
        const bgIcon = document.getElementById('val-rank-bg-own');
        if (bgIcon) bgIcon.src = rankImg;
        valRankNameOwn.textContent = valRankSelect.value;
      }

    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      loadingOverlay.style.opacity = '0';
      setTimeout(() => loadingOverlay.style.display = 'none', 300);
    }
  }

  await loadProfile();

  // 3. UI Interactions
  function toggleGameSections() {
    valorantSection.style.display = selectedGames.includes('valorant') ? 'block' : 'none';
  }

  function markChanges() {
    hasChanges = true;
    saveBar.classList.add('visible');
  }

  // Game selection
  gameOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const game = opt.dataset.game;
      if (selectedGames.includes(game)) {
        selectedGames = selectedGames.filter(g => g !== game);
        opt.classList.remove('selected');
      } else {
        selectedGames.push(game);
        opt.classList.add('selected');
      }
      toggleGameSections();
      markChanges();
    });
  });

  // Agent selection
  agentPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const agent = pill.textContent;
      if (selectedAgents.includes(agent)) {
        selectedAgents = selectedAgents.filter(a => a !== agent);
        pill.classList.remove('selected');
      } else {
        selectedAgents.push(agent);
        pill.classList.add('selected');
      }
      markChanges();
    });
  });

  // Input listeners
  [avatarUrlInput, bioInput, discordInput].forEach(el => {
    el.addEventListener('input', markChanges);
  });

  valRankSelect.addEventListener('change', () => {
    if (valRankIconOwn && valRankNameOwn) {
      valRankIconOwn.src = rankIcons[valRankSelect.value];
      valRankNameOwn.textContent = valRankSelect.value;
    }
    markChanges();
  });

  // 4. Save Logic
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
      const updates = {
        id: currentUserId,
        avatar_url: avatarUrlInput.value.trim(),
        bio: bioInput.value,
        selected_games: selectedGames,
        valorant_details: {
          agents: selectedAgents,
          rank: valRankSelect.value
        },
        social_links: {
          discord: discordInput.value
        },
        updated_at: new Date()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      hasChanges = false;
      saveBar.classList.remove('visible');
      alert('Profile saved successfully!');
    } catch (err) {
      alert('Error saving profile: ' + err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
    }
  });

  // 5. Logout
  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  });
});
