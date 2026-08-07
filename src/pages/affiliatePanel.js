import { initTheme } from '../utils/theme.js';
import { renderHeader } from '../components/Header.js';
import { renderCopyTool } from '../components/CopyTool.js';
import { showToast } from '../components/Toast.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { loginUser, logoutUser, subscribeToAuth, getCurrentUserProfile } from '../services/authService.js';
import { getCategories } from '../services/categoriesService.js';
import { createOffer, getAllOffersForAdmin, deleteOffer, toggleOfferStatus } from '../services/offersService.js';
import { ApiService } from '../services/apiService.js';
import { PermissionService } from '../permissions/permissionService.js';
import { PERMISSIONS } from '../permissions/permissions.js';
import { db } from '../firebase/config.js';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';

let currentUser = null;
let currentUserProfile = null;
let copyToolInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  renderHeader('panelHeader', { showSearch: false, title: 'Promivo Afiliados' });

  // Initialize Copy Tool instance
  copyToolInstance = renderCopyTool('copyToolContainer', getFormData());

  // Setup API Search Button for Mercado Livre Integration
  setupApiSearch();

  // Setup offer form inputs live listeners
  setupOfferFormListeners();

  // Setup Login Form Listener
  setupLoginForm();

  // Setup Tab Navigation Listeners
  setupTabNavigation();

  // Setup User Creation Form Listener (Admin Only)
  setupCreateUserForm();

  // Logout button listener
  document.getElementById('btnLogout')?.addEventListener('click', async () => {
    await logoutUser();
    showToast('Sessão encerrada com sucesso.', 'info');
  });

  // Subscribe to Firebase Auth state
  subscribeToAuth(async (user, profile) => {
    currentUser = user;
    currentUserProfile = profile;

    const authSection = document.getElementById('authSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const userBadge = document.getElementById('userEmailBadge');

    if (user && profile) {
      if (authSection) authSection.style.display = 'none';
      if (dashboardSection) dashboardSection.style.display = 'block';
      if (userBadge) userBadge.textContent = `${profile.email} (${(profile.role || 'affiliate').toUpperCase()})`;

      // Dynamic Permission Guards for UI Tabs
      updateUiPermissionGuards(profile);

      // Populate Categories Select
      await populateCategoriesSelect();

      // Load offers table
      await loadOffersTable();
    } else {
      if (authSection) authSection.style.display = 'block';
      if (dashboardSection) dashboardSection.style.display = 'none';
    }
  });
});

function updateUiPermissionGuards(profile) {
  const btnTabUsers = document.getElementById('btnTabUsers');
  const btnTabLogs = document.getElementById('btnTabLogs');

  const canReadUsers = PermissionService.hasPermission(profile, PERMISSIONS.USERS_READ);
  const canViewLogs = PermissionService.hasPermission(profile, PERMISSIONS.LOGS_VIEW);

  if (btnTabUsers) btnTabUsers.style.display = canReadUsers ? 'inline-flex' : 'none';
  if (btnTabLogs) btnTabLogs.style.display = canViewLogs ? 'inline-flex' : 'none';
}

function setupTabNavigation() {
  const btnTabTool = document.getElementById('btnTabTool');
  const btnTabUsers = document.getElementById('btnTabUsers');
  const btnTabLogs = document.getElementById('btnTabLogs');

  const tabTool = document.getElementById('tabContentTool');
  const tabUsers = document.getElementById('tabContentUsers');
  const tabLogs = document.getElementById('tabContentLogs');

  const switchTab = (activeBtn, activeTab) => {
    [btnTabTool, btnTabUsers, btnTabLogs].forEach(b => b?.classList.remove('active'));
    [tabTool, tabUsers, tabLogs].forEach(t => { if (t) t.style.display = 'none'; });

    if (activeBtn) activeBtn.classList.add('active');
    if (activeTab) activeTab.style.display = 'block';
  };

  btnTabTool?.addEventListener('click', () => switchTab(btnTabTool, tabTool));
  btnTabUsers?.addEventListener('click', async () => {
    switchTab(btnTabUsers, tabUsers);
    await loadAdminUsersTable();
  });
  btnTabLogs?.addEventListener('click', async () => {
    switchTab(btnTabLogs, tabLogs);
    await loadAuditLogsTable();
  });
}

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

function setupApiSearch() {
  const btnApiSearch = document.getElementById('btnApiSearch');
  const apiSearchInput = document.getElementById('apiSearchInput');
  const apiSearchResults = document.getElementById('apiSearchResults');

  if (btnApiSearch && apiSearchInput) {
    btnApiSearch.addEventListener('click', async () => {
      const q = apiSearchInput.value.trim();
      if (!q) return;

      try {
        btnApiSearch.disabled = true;
        btnApiSearch.textContent = 'Buscando...';
        const res = await ApiService.searchMarketplace(q, 'mercadolivre');

        if (res.success && res.data && res.data.length > 0) {
          apiSearchResults.style.display = 'block';
          apiSearchResults.innerHTML = res.data.map((item, index) => `
            <div class="api-search-item" data-index="${index}" style="padding: 0.5rem; cursor: pointer; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 0.5rem;">
              <img src="${item.images[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100'}" style="width: 32px; height: 32px; object-fit: contain;" />
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 0.8rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</div>
                <div style="font-size: 0.75rem; color: var(--brand-primary); font-weight: 700;">R$ ${item.price} ${item.oldPrice ? `<span style="text-decoration: line-through; color: var(--text-muted);">(R$ ${item.oldPrice})</span>` : ''}</div>
              </div>
            </div>
          `).join('');

          apiSearchResults.querySelectorAll('.api-search-item').forEach(el => {
            el.addEventListener('click', () => {
              const idx = parseInt(el.getAttribute('data-index'), 10);
              const selectedItem = res.data[idx];
              autofillOfferForm(selectedItem);
              apiSearchResults.style.display = 'none';
              showToast('Dados do produto importados com sucesso!', 'success');
            });
          });
        } else {
          apiSearchResults.style.display = 'block';
          apiSearchResults.innerHTML = `<div style="padding: 0.5rem; font-size: 0.8rem; color: var(--text-muted);">Nenhum produto encontrado.</div>`;
        }
      } catch (err) {
        showToast('Erro ao buscar na API: ' + err.message, 'error');
      } finally {
        btnApiSearch.disabled = false;
        btnApiSearch.textContent = 'Buscar';
      }
    });
  }
}

function setupOfferFormListeners() {
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
}

function setupLoginForm() {
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
        showToast(err.message || 'Acesso não autorizado.', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Entrar no Painel';
      }
    });
  }
}

async function populateCategoriesSelect() {
  const select = document.getElementById('offerCategory');
  if (!select) return;

  const categories = await getCategories();
  select.innerHTML = categories.map(c => `
    <option value="${c.name}">${c.icon || '🏷️'} ${c.name}</option>
  `).join('');

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
    btn.textContent = 'Salvando oferta...';

    await createOffer(data, currentUser?.uid || 'affiliate');
    
    showToast('🎉 Oferta publicada com sucesso na Home!', 'success');
    document.getElementById('offerForm').reset();
    if (copyToolInstance) {
      copyToolInstance.update(getFormData());
    }
    await loadOffersTable();
  } catch (err) {
    console.error('Erro ao salvar oferta:', err);
    showToast('Falha ao publicar oferta: ' + err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '🚀 Publicar Oferta no Promivo';
  }
}

async function loadOffersTable() {
  const tbody = document.getElementById('panelOffersTable');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">Carregando ofertas...</td></tr>`;

  const offers = await getAllOffersForAdmin();

  if (offers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">Nenhuma oferta cadastrada ainda.</td></tr>`;
    return;
  }

  const canUpdateAll = PermissionService.hasPermission(currentUserProfile, PERMISSIONS.OFFERS_UPDATE_ALL);
  const canDeleteAll = PermissionService.hasPermission(currentUserProfile, PERMISSIONS.OFFERS_DELETE_ALL);

  tbody.innerHTML = offers.map(offer => {
    const isOwnerOfOffer = offer.createdBy === currentUser?.uid;
    const canEditThis = canUpdateAll || (isOwnerOfOffer && PermissionService.hasPermission(currentUserProfile, PERMISSIONS.OFFERS_UPDATE_OWN));
    const canDeleteThis = canDeleteAll || (isOwnerOfOffer && PermissionService.hasPermission(currentUserProfile, PERMISSIONS.OFFERS_DELETE_OWN));

    return `
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
          ${canEditThis ? `
            <button class="btn btn-sm btn-secondary toggle-status-btn" data-id="${offer.id}" data-active="${offer.active !== false}" title="Pausar/Ativar">
              ${offer.active !== false ? '⏸️' : '▶️'}
            </button>
          ` : ''}
          ${canDeleteThis ? `
            <button class="btn btn-sm btn-danger delete-offer-btn" data-id="${offer.id}" title="Excluir">
              🗑️
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.toggle-status-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const active = btn.getAttribute('data-active') === 'true';
      await toggleOfferStatus(id, active);
      showToast(active ? 'Oferta pausada' : 'Oferta ativada', 'info');
      await loadOffersTable();
    });
  });

  tbody.querySelectorAll('.delete-offer-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Excluir oferta?')) {
        const id = btn.getAttribute('data-id');
        await deleteOffer(id);
        showToast('Oferta excluída!', 'success');
        await loadOffersTable();
      }
    });
  });
}

function setupCreateUserForm() {
  const form = document.getElementById('createUserForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnCreateUserSubmit');
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;

    try {
      btn.disabled = true;
      btn.textContent = 'Criando via Admin SDK...';

      await ApiService.post('/admin/users', { name, email, password, role });
      showToast(`Usuário ${email} criado com sucesso!`, 'success');
      form.reset();
      await loadAdminUsersTable();
    } catch (err) {
      showToast(err.message || 'Erro ao criar usuário.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Criar Usuário no Sistema';
    }
  });
}

async function loadAdminUsersTable() {
  const tbody = document.getElementById('panelUsersTable');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">Carregando usuários...</td></tr>`;

  let users = [];
  try {
    const res = await ApiService.get('/admin/users');
    if (res && res.success && Array.isArray(res.data)) {
      users = res.data;
    }
  } catch (err) {
    console.warn('API Cloud Functions indisponível, buscando usuários via Firestore SDK:', err.message);
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      snapshot.forEach(docSnap => users.push({ id: docSnap.id, ...docSnap.data() }));
    } catch (fsErr) {
      tbody.innerHTML = `<tr><td colspan="5" style="padding: 1.5rem; text-align: center; color: var(--accent-danger);">Erro ao carregar usuários: ${fsErr.message}</td></tr>`;
      return;
    }
  }

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">Nenhum usuário cadastrado além do atual.</td></tr>`;
    return;
  }

  const canActivate = PermissionService.hasPermission(currentUserProfile, PERMISSIONS.USERS_ACTIVATE);
  const canDelete = PermissionService.hasPermission(currentUserProfile, PERMISSIONS.USERS_DELETE);

  tbody.innerHTML = users.map(user => {
    const isOwner = user.role === 'owner';

    return `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 0.85rem 1rem; font-weight: 600;">${user.name || '-'}</td>
        <td style="padding: 0.85rem 1rem; color: var(--text-secondary);">${user.email}</td>
        <td style="padding: 0.85rem 1rem;">
          <span style="font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); background: ${isOwner ? 'var(--accent-warning)' : 'var(--brand-light)'}; color: ${isOwner ? '#000' : 'var(--brand-primary)'};">
            ${(user.role || 'affiliate').toUpperCase()}
          </span>
        </td>
        <td style="padding: 0.85rem 1rem;">
          <span style="font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); background: ${user.active !== false ? 'var(--accent-success-light)' : 'var(--accent-danger-light)'}; color: ${user.active !== false ? 'var(--accent-success)' : 'var(--accent-danger)'};">
            ${user.active !== false ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td style="padding: 0.85rem 1rem; text-align: right;">
          ${(!isOwner && canActivate) ? `
            <button class="btn btn-sm btn-secondary toggle-user-active-btn" data-id="${user.id || user.uid}" data-active="${user.active !== false}">
              ${user.active !== false ? 'Desativar' : 'Ativar'}
            </button>
          ` : ''}
          ${(!isOwner && canDelete) ? `
            <button class="btn btn-sm btn-danger delete-user-btn" data-id="${user.id || user.uid}">
              Excluir
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.toggle-user-active-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const active = btn.getAttribute('data-active') === 'true';
      
      try {
        const endpoint = active ? `/admin/users/${id}/deactivate` : `/admin/users/${id}/activate`;
        await ApiService.put(endpoint);
      } catch (e) {
        // Firestore SDK Fallback
        const userRef = doc(db, 'users', id);
        await updateDoc(userRef, { active: !active });
      }

      showToast(active ? 'Usuário desativado' : 'Usuário ativado', 'info');
      await loadAdminUsersTable();
    });
  });

  tbody.querySelectorAll('.delete-user-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Tem certeza que deseja excluir este usuário?')) {
        const id = btn.getAttribute('data-id');
        try {
          await ApiService.delete(`/admin/users/${id}`);
        } catch (e) {
          const userRef = doc(db, 'users', id);
          await deleteDoc(userRef);
        }
        showToast('Usuário excluído!', 'success');
        await loadAdminUsersTable();
      }
    });
  });
}

async function loadAuditLogsTable() {
  const tbody = document.getElementById('panelLogsTable');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">Carregando logs de auditoria...</td></tr>`;

  let logs = [];
  try {
    const res = await ApiService.get('/admin/logs');
    if (res && res.success && Array.isArray(res.data)) {
      logs = res.data;
    }
  } catch (err) {
    console.warn('API /admin/logs indisponível, buscando via Firestore SDK:', err.message);
    try {
      const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      snapshot.forEach(docSnap => logs.push({ id: docSnap.id, ...docSnap.data() }));
    } catch (fsErr) {
      console.warn('Coleção de logs em branco ou inacessível no Firestore:', fsErr);
    }
  }

  if (logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="padding: 1.5rem; text-align: center; color: var(--text-muted);">Nenhum log de auditoria registrado ainda.</td></tr>`;
    return;
  }

  tbody.innerHTML = logs.map(log => `
    <tr style="border-bottom: 1px solid var(--border-color);">
      <td style="padding: 0.75rem 1rem; color: var(--text-secondary);">${formatDate(log.createdAt)}</td>
      <td style="padding: 0.75rem 1rem; font-weight: 600;">${log.userEmail || log.userId || 'sistema'}</td>
      <td style="padding: 0.75rem 1rem;">
        <span style="font-weight: 700; color: var(--brand-primary);">${log.action}</span>
        ${log.targetEmail ? `<span style="color: var(--text-muted); font-size: 0.75rem;"> (${log.targetEmail})</span>` : ''}
      </td>
      <td style="padding: 0.75rem 1rem; color: var(--text-muted); font-size: 0.75rem;">${log.ip || '127.0.0.1'}</td>
      <td style="padding: 0.75rem 1rem;">
        <span style="font-size: 0.75rem; font-weight: 600; color: ${log.status === 'SUCCESS' ? 'var(--accent-success)' : 'var(--accent-danger)'};">
          ${log.status || 'SUCCESS'}
        </span>
      </td>
    </tr>
  `).join('');
}

function autofillOfferForm(product) {
  if (!product) return;

  const nameEl = document.getElementById('offerName');
  const storeEl = document.getElementById('offerStore');
  const currentPriceEl = document.getElementById('offerCurrentPrice');
  const oldPriceEl = document.getElementById('offerOldPrice');
  const affiliateLinkEl = document.getElementById('offerAffiliateLink');
  const productLinkEl = document.getElementById('offerProductLink');
  const imageUrlEl = document.getElementById('offerImageUrl');
  const categoryEl = document.getElementById('offerCategory');

  if (nameEl) nameEl.value = product.title || '';
  if (storeEl) storeEl.value = product.marketplace || 'Mercado Livre';
  if (currentPriceEl) currentPriceEl.value = product.price || 0;
  if (oldPriceEl) oldPriceEl.value = product.oldPrice || '';
  if (affiliateLinkEl) affiliateLinkEl.value = product.affiliateUrl || product.url || '';
  if (productLinkEl) productLinkEl.value = product.url || '';
  if (imageUrlEl) imageUrlEl.value = product.images[0] || '';
  if (categoryEl && product.category) {
    for (let opt of categoryEl.options) {
      if (opt.value.toLowerCase() === product.category.toLowerCase()) {
        categoryEl.value = opt.value;
        break;
      }
    }
  }

  if (copyToolInstance) {
    copyToolInstance.update(getFormData());
  }
}
