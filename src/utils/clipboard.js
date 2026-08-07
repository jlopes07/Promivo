import { showToast } from '../components/Toast.js';

export async function copyToClipboard(text, label = 'Texto') {
  if (!text) {
    showToast('Nada para copiar!', 'error');
    return false;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    showToast(`${label} copiado para a área de transferência!`, 'success');
    return true;
  } catch (err) {
    console.error('Erro ao copiar:', err);
    showToast('Falha ao copiar texto.', 'error');
    return false;
  }
}
