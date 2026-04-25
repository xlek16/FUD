/* ============================================================
   FIND YOUR DUO — Valorant Game Page JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  const playersContainer = document.querySelector('.game-hero-visual');
  const playersGrid = document.getElementById('valorant-players-grid');
  const findBtn = document.querySelector('.btn-large.primary');

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

  async function initRankChart(players) {
    const canvas = document.getElementById('rankDistributionChart');
    if (!canvas) return;

    const rankOrder = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'];
    const rankCounts = {};
    rankOrder.forEach(r => rankCounts[r] = 0);

    players.forEach(p => {
      const rank = (p.valorant_details && p.valorant_details.rank) || 'Unranked';
      if (rankCounts.hasOwnProperty(rank)) {
        rankCounts[rank]++;
      }
    });

    const dataValues = rankOrder.map(r => rankCounts[r]);

    // Preload images for the chart
    const loadedIcons = {};
    const loadPromises = rankOrder.map(rank => {
      return new Promise(resolve => {
        const img = new Image();
        img.src = rankIcons[rank];
        img.onload = () => {
          loadedIcons[rank] = img;
          resolve();
        };
      });
    });

    await Promise.all(loadPromises);

    new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: rankOrder,
        datasets: [{
          label: 'Players',
          data: dataValues,
          backgroundColor: 'rgba(255, 70, 85, 0.4)',
          borderColor: '#ff4655',
          borderWidth: 2,
          borderRadius: 6,
          hoverBackgroundColor: '#ff4655',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { bottom: 30 }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111822',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#ff4655',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => `${context.parsed.y} Players`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
            ticks: { 
              color: '#9ca3af', 
              stepSize: 1,
              font: { family: 'Inter', size: 11 }
            }
          },
          x: {
            grid: { display: false },
            ticks: { 
              color: '#fff', 
              font: { family: 'Inter', size: 11, weight: '600' },
              padding: 40 // Make room for icons
            }
          }
        }
      },
      plugins: [{
        id: 'rankIconsPlugin',
        afterDraw: (chart) => {
          const { ctx, scales: { x, y } } = chart;
          x.ticks.forEach((tick, index) => {
            const rank = rankOrder[index];
            const icon = loadedIcons[rank];
            if (icon) {
              const xPos = x.getPixelForTick(index) - 15;
              const yPos = chart.chartArea.bottom + 10;
              ctx.drawImage(icon, xPos, yPos, 30, 30);
            }
          });
        }
      }]
    });
  }

  async function fetchValorantPlayers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .filter('selected_games', 'cs', '["valorant"]')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Initialize stats chart
      if (data) initRankChart(data);

      // Clear containers
      if (playersContainer) playersContainer.innerHTML = '';
      if (playersGrid) playersGrid.innerHTML = '';

      if (!data || data.length === 0) {
        if (playersGrid) playersGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No players found yet. Be the first to join!</p>';
        return;
      }

      // Show only top 12 in the grid
      data.slice(0, 12).forEach((profile, index) => {
        const valDetails = profile.valorant_details || {};
        const rank = valDetails.rank || 'Unranked';
        const agents = valDetails.agents || [];
        const username = profile.username || 'Anonymous';
        const initial = username[0].toUpperCase();
        
        const avatarHTML = profile.avatar_url 
          ? `<img src="${profile.avatar_url}" alt="${username}">`
          : initial;

        const cardHTML = `
          <div class="player-card-header">
            <div class="player-avatar" style="background: ${profile.avatar_url ? 'transparent' : 'var(--accent)'}">${avatarHTML}</div>
            <div class="player-info">
              <span class="player-name">${username}</span>
              <div class="rank-badge-premium">
                <img src="${rankIcons[rank] || rankIcons['Iron']}" style="width: 16px; height: 16px; object-fit: contain;" alt="">
                ${rank}
              </div>
            </div>
          </div>

          <div class="agents-section">
            <span class="section-label-mini">Agentes Principais</span>
            <div class="agents-pills-mini">
              ${agents.length > 0 
                ? agents.slice(0, 3).map(a => `<span class="agent-pill-mini">${a}</span>`).join('') 
                : '<span class="agent-pill-mini">No agents</span>'}
            </div>
          </div>

          <div class="player-card-footer">
            <div class="game-tag-mini">VALORANT</div>
            <div class="status-indicator">
              <div class="status-dot"></div>
              <div class="status-text">Ranked <span class="status-sep">·</span> <span>Online</span></div>
            </div>
          </div>
        `;

        // Add to hero visual (limit to first 3 for style)
        if (playersContainer && index < 3) {
          const card = document.createElement('div');
          card.className = 'player-card fade-up visible';
          card.style.cursor = 'pointer';
          card.onclick = () => window.location.href = `../user.html?id=${profile.id}`;
          card.innerHTML = cardHTML;
          playersContainer.appendChild(card);
        }

        // Add to main grid
        if (playersGrid) {
          const card = document.createElement('div');
          card.className = 'player-card fade-up visible';
          card.style.cursor = 'pointer';
          card.onclick = () => window.location.href = `../user.html?id=${profile.id}`;
          card.innerHTML = cardHTML;
          playersGrid.appendChild(card);
        }
      });

    } catch (err) {
      console.error('Error fetching Valorant players:', err);
    }
  }

  fetchValorantPlayers();

  if (findBtn) {
    findBtn.addEventListener('click', () => {
      const section = document.getElementById('players-list-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
});
