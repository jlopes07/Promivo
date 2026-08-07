import { generateCopies } from '../utils/copyGenerator.js';
import { copyToClipboard } from '../utils/clipboard.js';

export function renderCopyTool(containerId, initialData = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let currentCopies = generateCopies(initialData);

  const update = (newData) => {
    currentCopies = generateCopies(newData);
    render();
  };

  const render = () => {
    container.innerHTML = `
      <div class="panel-card">
        <h3 class="panel-card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" stroke-width="2.5">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          Gerador de Copy Automático
        </h3>

        <!-- Quick Copy Action Bar -->
        <div class="quick-actions-bar">
          <button id="btnCopyTitle" class="btn btn-sm btn-secondary">
            📋 Copiar Título
          </button>
          <button id="btnCopyWhatsapp" class="btn btn-sm btn-secondary">
            💬 Copiar WhatsApp
          </button>
          <button id="btnCopyTelegram" class="btn btn-sm btn-secondary">
            ✈️ Copiar Telegram
          </button>
          <button id="btnCopyHashtags" class="btn btn-sm btn-secondary">
            #️⃣ Copiar Hashtags
          </button>
          <button id="btnCopyLink" class="btn btn-sm btn-secondary">
            🔗 Copiar Link Afiliado
          </button>
          <button id="btnCopyAll" class="btn btn-sm btn-primary">
            🚀 Copiar Tudo (WhatsApp)
          </button>
        </div>

        <!-- Previews -->
        <div class="copy-box">
          <div class="copy-box-header">
            <span>WhatsApp (Com Formatação)</span>
            <button class="btn btn-sm btn-secondary copy-btn" data-type="whatsapp">Copiar</button>
          </div>
          <div class="copy-box-content">${escapeHtml(currentCopies.whatsapp)}</div>
        </div>

        <div class="copy-box">
          <div class="copy-box-header">
            <span>Telegram</span>
            <button class="btn btn-sm btn-secondary copy-btn" data-type="telegram">Copiar</button>
          </div>
          <div class="copy-box-content">${escapeHtml(currentCopies.telegram)}</div>
        </div>

        <div class="copy-box">
          <div class="copy-box-header">
            <span>Legenda Instagram</span>
            <button class="btn btn-sm btn-secondary copy-btn" data-type="instagram">Copiar</button>
          </div>
          <div class="copy-box-content">${escapeHtml(currentCopies.instagram)}</div>
        </div>

        <div class="copy-box">
          <div class="copy-box-header">
            <span>Legenda Facebook</span>
            <button class="btn btn-sm btn-secondary copy-btn" data-type="facebook">Copiar</button>
          </div>
          <div class="copy-box-content">${escapeHtml(currentCopies.facebook)}</div>
        </div>

        <div class="form-row">
          <div class="copy-box">
            <div class="copy-box-header">
              <span>Mensagem Curta</span>
              <button class="btn btn-sm btn-secondary copy-btn" data-type="shortMessage">Copiar</button>
            </div>
            <div class="copy-box-content">${escapeHtml(currentCopies.shortMessage)}</div>
          </div>
          
          <div class="copy-box">
            <div class="copy-box-header">
              <span>Hashtags</span>
              <button class="btn btn-sm btn-secondary copy-btn" data-type="hashtags">Copiar</button>
            </div>
            <div class="copy-box-content">${escapeHtml(currentCopies.hashtags)}</div>
          </div>
        </div>

        <div class="copy-box">
          <div class="copy-box-header">
            <span>Benefícios da Oferta</span>
            <button class="btn btn-sm btn-secondary copy-btn" data-type="benefitsList">Copiar</button>
          </div>
          <div class="copy-box-content">${escapeHtml(currentCopies.benefitsList)}</div>
        </div>

        <div class="copy-box">
          <div class="copy-box-header">
            <span>Call To Action (CTA)</span>
            <button class="btn btn-sm btn-secondary copy-btn" data-type="cta">Copiar</button>
          </div>
          <div class="copy-box-content">${escapeHtml(currentCopies.cta)}</div>
        </div>
      </div>
    `;

    // Attach listeners for quick buttons
    container.querySelector('#btnCopyTitle')?.addEventListener('click', () => copyToClipboard(currentCopies.title, 'Título'));
    container.querySelector('#btnCopyWhatsapp')?.addEventListener('click', () => copyToClipboard(currentCopies.whatsapp, 'Mensagem WhatsApp'));
    container.querySelector('#btnCopyTelegram')?.addEventListener('click', () => copyToClipboard(currentCopies.telegram, 'Mensagem Telegram'));
    container.querySelector('#btnCopyHashtags')?.addEventListener('click', () => copyToClipboard(currentCopies.hashtags, 'Hashtags'));
    container.querySelector('#btnCopyLink')?.addEventListener('click', () => copyToClipboard(currentCopies.affiliateLink, 'Link de Afiliado'));
    container.querySelector('#btnCopyAll')?.addEventListener('click', () => copyToClipboard(currentCopies.whatsapp, 'Oferta Completa'));

    // Attach listeners for individual copy buttons
    container.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.target.getAttribute('data-type');
        if (currentCopies[type]) {
          copyToClipboard(currentCopies[type], type);
        }
      });
    });
  };

  render();

  return { update };
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
