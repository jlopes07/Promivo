import { initTheme } from '../utils/theme.js';
import { renderHeader } from '../components/Header.js';
import { renderCopyTool } from '../components/CopyTool.js';
import { showToast } from '../components/Toast.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { loginUser, logoutUser, subscribeToAuth } from '../services/authService.js';
import { getCategories } from '../services/categoriesService.js';
import { createOffer, getAllOffersForAdmin, deleteOffer, toggleOfferStatus } from '../services/offersService.js';

let currentUser = null;
let copyToolInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  renderHeader('panelHeader', { showSearch: false, title: 'Promivo Afiliados' });

  // Initialize Copy Tool instance
  copyToolInstance = renderCopyTool('copyToolContainer', getFormData());

  // Setup live listeners on offer form inputs
  const offerForm = document.getElementById('offerForm');
  if (offerForm) {
    const inputs = offerForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        if (copyToolInstance) {
          copyToolInstance.update(getFormData());
        }
      });
    });

    offerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handlePublishOffer();
    });
  }

  // Login Form Submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const btn = document.getElementById('btnLoginSubmit');

      try {
        btn.disabled = true;
        btn.textContent = 'Autenticando...';
        await loginUser(email, password);
        showToast('Login realizado com sucesso!', 'success');
      } catch (err) {
        showToast(err.message || 'Erro ao efetuar login.', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Entrar no Painel';
      }
    });
  }

  // Logout button
  document.getElementById('btnLogout')?.addEventListener('click', async () => {
    await logoutUser();
    showToast('Sessão encerrada.', 'info');
  });

  // Subscribe to Firebase Auth state
  subscribeToAuth(async (user) => {
    currentUser = user;
    const authSection = document.getElementById('authSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const userBadge = document.getElementById('userEmailBadge');

    if (user) {
      if (authSection) authSection.style.display = 'none';
      if (dashboardSection) dashboardSection.style.display = 'block';
      if (userBadge) userBadge.textContent = user.email;

      // Populate Categories Select
      await populateCategoriesSelect();

      // Load user offers table
      await loadOffersTable();
    } else {
      if (authSection) authSection.style.display = 'block';
      if (dashboardSection) dashboardSection.style.display = 'none';
    }
  });
});

function getFormData() {
  return {
    name: document.getElementById('offerName')?.value || 'Fone de Ouvido Bluetooth Anker',
    category: document.getElementById('offerCategory')?.value || 'Eletrônicos',
    store: document.getElementById('offerStore')?.value || 'Amazon',
    productLink: document.getElementById('offerProductLink')?.value || '',
    affiliateLink: document.getElementById('offerAffiliateLink')?.value || 'https://amzn.to/exemplo',
    currentPrice: parseFloat(document.getElementById('offerCurrentPrice')?.value) || 199.90,
    oldPrice: parseFloat(document.getElementById('offerOldPrice')?.value) || 299.90,
    coupon: document.getElementById('offerCoupon')?.value || 'BLACK10',
    shipping: document.getElementById('offerShipping')?.value || 'Frete Grátis Prime',
    notes: document.getElementById('offerNotes')?.value || 'Cupom válido para 100 primeiros clientes',
    imageUrl: document.getElementById('offerImageUrl')?.value || ''
  };
}

async function populateCategoriesSelect() {
  const select = document.getElementById('offerCategory');
  if (!select) return;

  const categories = await getCategories();
  select.innerHTML = categories.map(c => `
    <option value="${c.name}">${c.icon || '🏷️'} ${c.name}</option>
  `).join('');

  // Trigger live copy update
  if (copyToolInstance) {
    copyToolInstance.update(getFormData());
  }
}

async function handlePublishOffer() {
  const data = getFormData();
  const btn = document.getElementById('btnPublishOffer');

  if (!data.name || !data.affiliateLink || !data.currentPrice) {
    showToast('Preencha os campos obrigatórios (*)', 'error');
    return;
  }

  try {
    btn.disabled = true;
    btn.textContent = 'Salvando no Cloud Firestore...';

    await createOffer(data, currentUser?.uid || 'affiliate');
    
    showToast('🎉 Oferta publicada com sucesso na Home do Promivo!', 'success');

    // Reset Form
    document.getElementById('offerForm').reset();
    if (copyToolInstance) {
      copyToolInstance.update(getFormData());
    }

    // Refresh Table
    await loadOffersTable();
  } catch (err) {
    console.error('Erro ao salvar oferta:', err);
    showToast('Falha ao publicar oferta.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '🚀 Publicar Oferta no Promivo';
  }
}

async function loadOffersTable() {
  const tbody = document.getElementById('panelOffersTable');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
        Carregando ofertas...
      </td>
    </tr>
  `;

  const offers = await getAllOffersForAdmin();

  if (offers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">
          Nenhuma oferta cadastrada ainda. Use o formulário acima para criar sua primeira oferta!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = offers.map(offer => `
    <tr style="border-bottom: 1px solid var(--border-color);">
      <td style="padding: 0.85rem 1rem; font-weight: 600;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <img src="${offer.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100'}" style="width: 32px; height: 32px; object-fit: contain; border-radius: 4px;" />
          <span style="max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${offer.name}">
            ${offer.name}
          </span>
        </div>
      </td>
      <td style="padding: 0.85rem 1rem; color: var(--text-secondary);">${offer.category || 'Geral'}</td>
      <td style="padding: 0.85rem 1rem; color: var(--text-secondary);">${offer.store || '-'}</td>
      <td style="padding: 0.85rem 1rem; font-weight: 700;">${formatCurrency(offer.currentPrice)}</td>
      <td style="padding: 0.85rem 1rem;">
        <span style="padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600; background: ${offer.active !== false ? 'var(--accent-success-light)' : 'var(--bg-surface-hover)'}; color: ${offer.active !== false ? 'var(--accent-success)' : 'var(--text-muted)'};">
          ${offer.active !== false ? 'Ativa' : 'Pausada'}
        </span>
      </td>
      <td style="padding: 0.85rem 1rem; text-align: right;">
        <button class="btn btn-sm btn-secondary toggle-status-btn" data-id="${offer.id}" data-active="${offer.active !== false}" title="Pausar/Ativar">
          ${offer.active !== false ? '⏸️' : '▶️'}
        </button>
        <button class="btn btn-sm btn-danger delete-offer-btn" data-id="${offer.id}" title="Excluir">
          🗑️
        </button>
      </td>
    </tr>
  `).join('');

  // Attach event listeners for table actions
  tbody.querySelectorAll('.toggle-status-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = btn.getAttribute('data-id');
      const active = btn.getAttribute('data-active') === 'true';
      await toggleOfferStatus(id, active);
      showToast(active ? 'Oferta pausada na Home' : 'Oferta reativada na Home', 'info');
      await loadOffersTable();
    });
  });

  tbody.querySelectorAll('.delete-offer-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (confirm('Tem certeza que deseja excluir esta oferta?')) {
        const id = btn.getAttribute('data-id');
        await deleteOffer(id);
        showToast('Oferta excluída com sucesso!', 'success');
        await loadOffersTable();
      }
    });
  });
}
