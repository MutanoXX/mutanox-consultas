import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://discord.com/api/webhooks/1456066499981611197/FpVJ-hWYVBXmKi4WcjimWXunxswV8_31e5WORFxngqDM7W3oMSjvOeBSqg7PWa2gO40c';

// Middleware
app.use(cors());
app.use(express.json());

// API Config
const API_BASE = 'https://world-ecletix.onrender.com/api';

// Webhook Discord
async function sendWebhook(tipo, dados, cpf = '') {
  try {
    const color = tipo === 'CPF' ? 0x9333ea : tipo === 'TELEFONE' ? 0x00bfff : tipo === 'NOME' ? 0x00ff88 : 0xff0000;

    const embed = {
      title: `🔍 Nova Consulta - ${tipo}`,
      color: color,
      fields: [],
      timestamp: new Date().toISOString()
    };

    if (tipo === 'CPF') {
      embed.fields.push(
        { name: '👤 Nome', value: dados.nome || '-', inline: false },
        { name: '🆔 CPF', value: formatCPF(dados.cpf) || '-', inline: true },
        { name: '📅 Nascimento', value: dados.data_nascimento || '-', inline: true },
        { name: '⚧️ Sexo', value: dados.sexo || '-', inline: true },
        { name: '👪 Mãe', value: dados.mae || '-', inline: false },
        { name: '📍 Situação', value: dados.situacao || '-', inline: true },
        { name: '💰 Renda', value: dados.renda || '-', inline: true }
      );
    } else if (tipo === 'TELEFONE' && dados.length > 0) {
      const first = dados[0];
      embed.fields.push(
        { name: '👤 Nome', value: first.nome || '-', inline: false },
        { name: '🆔 CPF', value: formatCPF(first.cpf) || '-', inline: true },
        { name: '📱 Telefone', value: first.numero || '-', inline: true },
        { name: '📡 Status', value: first.status || '-', inline: true },
        { name: '📶 Operadora', value: first.operadora || '-', inline: true }
      );
    } else if (tipo === 'NOME') {
      embed.fields.push(
        { name: '👤 Nome', value: dados.nome || '-', inline: false },
        { name: '🆔 CPF', value: formatCPF(dados.cpf) || '-', inline: true },
        { name: '📅 Nascimento', value: dados.data_nascimento || '-', inline: true },
        { name: '⚧️ Sexo', value: dados.sexo || '-', inline: true },
        { name: '👪 Mãe', value: dados.mae || '-', inline: false }
      );
    }

    const payload = {
      username: 'Mutanox Consultas Bot',
      avatar_url: 'https://i.imgur.com/8J5Y3qM.png',
      embeds: [embed]
    };

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log(`✅ Webhook enviado: ${tipo}`);
  } catch (error) {
    console.error('❌ Erro ao enviar webhook:', error);
  }
}

// Parse CPF data
function parseCPFData(text) {
  const data = {};

  // Nome
  const nomeMatch = text.match(/Nome:\s*(.+)/);
  if (nomeMatch) data.nome = nomeMatch[1].trim();

  // CPF
  const cpfMatch = text.match(/CPF:\s*(\d{11})/);
  if (cpfMatch) data.cpf = cpfMatch[1];

  // Data de Nascimento
  const nascMatch = text.match(/Data de Nascimento:\s*(.+)/);
  if (nascMatch) data.data_nascimento = nascMatch[1].trim();

  // Idade
  const idadeMatch = text.match(/\((\d+)\s+anos\)/);
  if (idadeMatch) data.idade = idadeMatch[1];

  // Sexo
  const sexoMatch = text.match(/Sexo:\s*(.+?)\s*-/);
  if (sexoMatch) data.sexo = sexoMatch[1].trim();

  // Mãe
  const maeMatch = text.match(/Nome da Mãe:\s*(.+)/);
  if (maeMatch) data.mae = maeMatch[1].trim();

  // Situação
  const situacaoMatch = text.match(/Situação Cadastral:\s*(.+)/);
  if (situacaoMatch) data.situacao = situacaoMatch[1].trim();

  // Renda
  const rendaMatch = text.match(/Renda:\s*(.+)/);
  if (rendaMatch) data.renda = rendaMatch[1].trim();

  return data;
}

// Parse Phone data
function parsePhoneData(text) {
  const lines = text.split('\n');
  const phones = [];
  let currentPhone = null;

  lines.forEach(line => {
    if (line.includes('TELEFONE')) {
      if (currentPhone && currentPhone.numero) {
        phones.push(currentPhone);
      }
      currentPhone = {};
    }

    if (currentPhone) {
      const cpfMatch = line.match(/CPF\/CNPJ:\s*(.+)/);
      if (cpfMatch) currentPhone.cpf = cpfMatch[1].trim();

      const nomeMatch = line.match(/Nome:\s*(.+)/);
      if (nomeMatch) currentPhone.nome = nomeMatch[1].trim();

      const numeroMatch = line.match(/Número:\s*(\d+)/);
      if (numeroMatch) currentPhone.numero = numeroMatch[1];

      const statusMatch = line.match(/Status:\s*(.+)/);
      if (statusMatch) currentPhone.status = statusMatch[1].trim();

      const tipoMatch = line.match(/Tipo:\s*(.+)/);
      if (tipoMatch) currentPhone.tipo = tipoMatch[1].trim();

      const operadoraMatch = line.match(/Operadora:\s*(.+)/);
      if (operadoraMatch) currentPhone.operadora = operadoraMatch[1].trim();
    }
  });

  if (currentPhone && currentPhone.numero) {
    phones.push(currentPhone);
  }

  return phones;
}

// Parse Name data
function parseNameData(text) {
  const data = {};

  const cpfMatch = text.match(/CPF:\s*(\d{11})/);
  if (cpfMatch) data.cpf = cpfMatch[1];

  const nomeMatch = text.match(/Nome:\s*(.+)/);
  if (nomeMatch) data.nome = nomeMatch[1].trim();

  const nascMatch = text.match(/Data de Nascimento:\s*(.+)/);
  if (nascMatch) data.data_nascimento = nascMatch[1].trim();

  const idadeMatch = text.match(/\((\d+)\s+anos\)/);
  if (idadeMatch) data.idade = idadeMatch[1];

  const maeMatch = text.match(/Nome da Mãe:\s*(.+)/);
  if (maeMatch) data.mae = maeMatch[1].trim();

  return data;
}

// Format CPF
function formatCPF(cpf) {
  if (!cpf || cpf.length !== 11) return cpf;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// HTML Template - Design Melhorado e Responsivo
const htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Mutanox Consultas</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      color: #ffffff;
      padding: 15px;
    }

    .container {
      max-width: 550px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 25px;
      padding: 20px;
    }

    .logo {
      width: 70px;
      height: 70px;
      margin: 0 auto 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    }

    .header h1 {
      font-size: 24px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }

    .header p {
      color: #888;
      font-size: 14px;
    }

    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .tabs::-webkit-scrollbar {
      display: none;
    }

    .tab {
      flex: 0 0 auto;
      min-width: 100px;
      padding: 14px 20px;
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .tab:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-2px);
    }

    .tab.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: transparent;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
    }

    .form-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 25px;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .input-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: #aaa;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    input {
      width: 100%;
      padding: 16px;
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      color: #fff;
      font-size: 16px;
      transition: all 0.3s ease;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
    }

    input::placeholder {
      color: #666;
    }

    button {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    button:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
    }

    button:active:not(:disabled) {
      transform: translateY(-1px);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .status {
      text-align: center;
      margin-top: 15px;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      min-height: 20px;
    }

    .status.success {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .status.error {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .loading {
      display: inline-block;
      width: 18px;
      height: 18px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-left: 10px;
      vertical-align: middle;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .results-card {
      display: none;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 25px;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.4s ease;
    }

    .results-card.show {
      display: block;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .results-header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 20px;
    }

    .results-header h2 {
      font-size: 20px;
      font-weight: 700;
      color: #10b981;
      margin-bottom: 5px;
    }

    .data-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .data-item:last-child {
      border-bottom: none;
    }

    .data-label {
      color: #888;
      font-size: 14px;
      font-weight: 500;
    }

    .data-value {
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      text-align: right;
      word-break: break-word;
      max-width: 65%;
    }

    .data-value.success {
      color: #10b981;
    }

    .data-value.warning {
      color: #f59e0b;
    }

    .data-value.error {
      color: #ef4444;
    }

    .new-search-btn {
      width: 100%;
      padding: 15px;
      background: transparent;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 20px;
    }

    .new-search-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }

    @media (max-width: 480px) {
      body {
        padding: 10px;
      }

      .container {
        max-width: 100%;
      }

      .header {
        padding: 15px;
        margin-bottom: 20px;
      }

      .logo {
        width: 60px;
        height: 60px;
        font-size: 24px;
        margin-bottom: 12px;
      }

      .header h1 {
        font-size: 20px;
      }

      .tabs {
        gap: 5px;
        margin-bottom: 15px;
      }

      .tab {
        padding: 12px 15px;
        font-size: 13px;
        min-width: 80px;
      }

      .form-card {
        padding: 20px;
        border-radius: 12px;
      }

      .results-card {
        padding: 20px;
        border-radius: 12px;
      }

      input {
        padding: 14px;
        font-size: 15px;
      }

      button {
        padding: 14px;
        font-size: 14px;
      }

      .data-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
        padding: 12px 0;
      }

      .data-label {
        font-size: 13px;
      }

      .data-value {
        text-align: left;
        max-width: 100%;
        font-size: 14px;
      }

      .data-value.success,
      .data-value.warning,
      .data-value.error {
        font-size: 13px;
        padding: 4px 8px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.05);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🔍</div>
      <h1>Mutanox Consultas</h1>
      <p>Sistema Avançado de Consultas em Tempo Real</p>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab active" data-tab="cpf">🆔 CPF</button>
      <button class="tab" data-tab="telefone">📱 Telefone</button>
      <button class="tab" data-tab="nome">👤 Nome</button>
    </div>

    <!-- CPF Form -->
    <div class="form-card" id="cpfForm">
      <div class="input-group">
        <label>CPF (11 dígitos)</label>
        <input type="tel" id="cpfInput" placeholder="Digite seu CPF" maxlength="11" autocomplete="off">
      </div>
      <button id="cpfButton" onclick="consultarCPF()">Consultar CPF</button>
      <div class="status" id="cpfStatus"></div>
    </div>

    <!-- Telefone Form -->
    <div class="form-card" id="telefoneForm" style="display: none;">
      <div class="input-group">
        <label>Telefone (apenas números)</label>
        <input type="tel" id="telefoneInput" placeholder="Digite o número" autocomplete="off">
      </div>
      <button id="telefoneButton" onclick="consultarTelefone()">Consultar Telefone</button>
      <div class="status" id="telefoneStatus"></div>
    </div>

    <!-- Nome Form -->
    <div class="form-card" id="nomeForm" style="display: none;">
      <div class="input-group">
        <label>Nome Completo</label>
        <input type="text" id="nomeInput" placeholder="Digite o nome completo" autocomplete="off">
      </div>
      <button id="nomeButton" onclick="consultarNome()">Consultar Nome</button>
      <div class="status" id="nomeStatus"></div>
    </div>

    <!-- Results -->
    <div class="results-card" id="resultsCard">
      <div class="results-header">
        <h2>✅ Consulta Realizada</h2>
        <p id="resultsSubtext" style="color: #888; font-size: 14px; margin-top: 5px;"></p>
      </div>

      <div id="cpfResults" style="display: none;">
        <div class="data-item">
          <span class="data-label">👤 Nome</span>
          <span class="data-value" id="cpfNome">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">🆔 CPF</span>
          <span class="data-value" id="cpfCPF">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">📅 Nascimento</span>
          <span class="data-value" id="cpfNascimento">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">⚧️ Sexo</span>
          <span class="data-value" id="cpfSexo">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">👪 Mãe</span>
          <span class="data-value" id="cpfMae">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">📍 Situação</span>
          <span class="data-value success" id="cpfSituacao">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">💰 Renda</span>
          <span class="data-value" id="cpfRenda">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">📱 Telefone</span>
          <span class="data-value" id="cpfTelefone">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">📶 Operadora</span>
          <span class="data-value" id="cpfOperadora">-</span>
        </div>
      </div>

      <div id="telefoneResults" style="display: none;">
        <div class="data-item">
          <span class="data-label">👤 Nome</span>
          <span class="data-value" id="telNome">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">🆔 CPF</span>
          <span class="data-value" id="telCPF">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">📱 Telefone</span>
          <span class="data-value" id="telNumero">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">📡 Status</span>
          <span class="data-value" id="telStatus">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">📶 Operadora</span>
          <span class="data-value" id="telOperadora">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">📲 Tipo</span>
          <span class="data-value" id="telTipo">-</span>
        </div>
      </div>

      <div id="nomeResults" style="display: none;">
        <div class="data-item">
          <span class="data-label">👤 Nome</span>
          <span class="data-value" id="nomeNome">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">🆔 CPF</span>
          <span class="data-value" id="nomeCPF">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">📅 Nascimento</span>
          <span class="data-value" id="nomeNascimento">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">⚧️ Sexo</span>
          <span class="data-value" id="nomeSexo">-</span>
        </div>
        <div class="data-item">
          <span class="data-label">👪 Mãe</span>
          <span class="data-value" id="nomeMae">-</span>
        </div>
      </div>

      <button class="new-search-btn" onclick="novaConsulta()">← Nova Consulta</button>
    </div>

    <div class="footer">
      <p>© 2026 Mutanox Consultas. Todos os direitos reservados.</p>
      <p>Desenvolvido com 💜 por MutanoX</p>
    </div>
  </div>

  <script>
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const forms = {
      cpf: document.getElementById('cpfForm'),
      telefone: document.getElementById('telefoneForm'),
      nome: document.getElementById('nomeForm')
    };

    function switchTab(tabName) {
      tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
          tab.classList.add('active');
        }
      });

      Object.keys(forms).forEach(key => {
        forms[key].style.display = 'none';
        if (key === tabName) {
          forms[key].style.display = 'block';
        }
      });

      // Hide results
      document.getElementById('resultsCard').classList.remove('show');
      clearStatus();
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    function clearStatus() {
      document.getElementById('cpfStatus').innerHTML = '';
      document.getElementById('telefoneStatus').innerHTML = '';
      document.getElementById('nomeStatus').innerHTML = '';
    }

    function showLoading(type) {
      const statusEl = document.getElementById(type + 'Status');
      statusEl.innerHTML = '<span class="loading"></span> Consultando...';
      statusEl.className = 'status';
      document.getElementById(type + 'Button').disabled = true;
    }

    function hideLoading(type) {
      document.getElementById(type + 'Button').disabled = false;
    }

    function showError(type, message) {
      const statusEl = document.getElementById(type + 'Status');
      statusEl.innerHTML = '❌ ' + message;
      statusEl.className = 'status error';
    }

    function showSuccess(type, message) {
      const statusEl = document.getElementById(type + 'Status');
      statusEl.innerHTML = '✅ ' + message;
      statusEl.className = 'status success';
    }

    // CPF Consultation
    async function consultarCPF() {
      const cpf = document.getElementById('cpfInput').value.replace(/\\D/g, '');

      if (!cpf || cpf.length !== 11) {
        showError('cpf', 'CPF deve ter 11 dígitos numéricos');
        return;
      }

      showLoading('cpf');
      clearStatus();

      try {
        const response = await fetch('/api/cpf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpf })
        });

        const data = await response.json();

        if (data.success) {
          showCPFResults(data.data);
          showSuccess('cpf', 'Consulta realizada com sucesso!');
          showResultsCard('cpf');
        } else {
          showError('cpf', data.error || 'Erro ao consultar CPF');
        }
      } catch (error) {
        showError('cpf', 'Erro de conexão. Tente novamente.');
      } finally {
        hideLoading('cpf');
      }
    }

    function showCPFResults(data) {
      document.getElementById('cpfNome').textContent = data.nome || '-';
      document.getElementById('cpfCPF').textContent = formatCPF(data.cpf) || '-';
      document.getElementById('cpfNascimento').textContent = data.data_nascimento || '-';
      document.getElementById('cpfSexo').textContent = data.sexo || '-';
      document.getElementById('cpfMae').textContent = data.mae || '-';
      document.getElementById('cpfSituacao').textContent = data.situacao || '-';
      document.getElementById('cpfRenda').textContent = data.renda || '-';
      document.getElementById('cpfTelefone').textContent = data.telefone || '-';
      document.getElementById('cpfOperadora').textContent = data.operadora || '-';

      document.getElementById('cpfResults').style.display = 'block';
      document.getElementById('telefoneResults').style.display = 'none';
      document.getElementById('nomeResults').style.display = 'none';
      document.getElementById('resultsSubtext').textContent = 'Dados completos do CPF consultado';
    }

    // Phone Consultation
    async function consultarTelefone() {
      const telefone = document.getElementById('telefoneInput').value.replace(/\\D/g, '');

      if (!telefone || telefone.length < 10) {
        showError('telefone', 'Digite um número válido (mínimo 10 dígitos)');
        return;
      }

      showLoading('telefone');
      clearStatus();

      try {
        const response = await fetch('/api/telefone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telefone })
        });

        const data = await response.json();

        if (data.success) {
          if (data.data && data.data.length > 0) {
            showTelefoneResults(data.data);
            showSuccess('telefone', data.data.length + ' telefone(s) encontrado(s)');
            showResultsCard('telefone');
          } else {
            showError('telefone', 'Nenhum telefone encontrado');
          }
        } else {
          showError('telefone', data.error || 'Erro ao consultar telefone');
        }
      } catch (error) {
        showError('telefone', 'Erro de conexão. Tente novamente.');
      } finally {
        hideLoading('telefone');
      }
    }

    function showTelefoneResults(data) {
      const first = data[0];
      document.getElementById('telNome').textContent = first.nome || '-';
      document.getElementById('telCPF').textContent = formatCPF(first.cpf) || '-';
      document.getElementById('telNumero').textContent = first.numero || '-';

      const statusEl = document.getElementById('telStatus');
      const statusText = first.status || '-';
      if (statusText.toUpperCase().includes('BLOQUEADO') || statusText.toUpperCase().includes('CANCELADO')) {
        statusEl.textContent = statusText + ' ⚠️';
        statusEl.className = 'data-value warning';
      } else if (statusText.toUpperCase().includes('ATIVO')) {
        statusEl.textContent = statusText + ' ✓';
        statusEl.className = 'data-value success';
      } else {
        statusEl.textContent = statusText;
      }

      document.getElementById('telTipo').textContent = first.tipo || '-';
      document.getElementById('telOperadora').textContent = first.operadora || '-';

      document.getElementById('cpfResults').style.display = 'none';
      document.getElementById('telefoneResults').style.display = 'block';
      document.getElementById('nomeResults').style.display = 'none';
      document.getElementById('resultsSubtext').textContent = data.length + ' telefone(s) encontrado(s)';
    }

    // Name Consultation
    async function consultarNome() {
      const nome = document.getElementById('nomeInput').value.trim();

      if (!nome || nome.length < 3) {
        showError('nome', 'Digite um nome válido (mínimo 3 caracteres)');
        return;
      }

      showLoading('nome');
      clearStatus();

      try {
        const response = await fetch('/api/nome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome })
        });

        const data = await response.json();

        if (data.success) {
          showNomeResults(data.data);
          showSuccess('nome', 'Consulta realizada com sucesso!');
          showResultsCard('nome');
        } else {
          showError('nome', data.error || 'Erro ao consultar nome');
        }
      } catch (error) {
        showError('nome', 'Erro de conexão. Tente novamente.');
      } finally {
        hideLoading('nome');
      }
    }

    function showNomeResults(data) {
      document.getElementById('nomeNome').textContent = data.nome || '-';
      document.getElementById('nomeCPF').textContent = formatCPF(data.cpf) || '-';
      document.getElementById('nomeNascimento').textContent = data.data_nascimento || '-';
      document.getElementById('nomeSexo').textContent = data.sexo || '-';
      document.getElementById('nomeMae').textContent = data.mae || '-';

      document.getElementById('cpfResults').style.display = 'none';
      document.getElementById('telefoneResults').style.display = 'none';
      document.getElementById('nomeResults').style.display = 'block';
      document.getElementById('resultsSubtext').textContent = 'Dados encontrados para o nome: ' + data.nome;
    }

    function showResultsCard(type) {
      const card = document.getElementById('resultsCard');
      card.classList.add('show');

      document.getElementById('cpfResults').style.display = type === 'cpf' ? 'block' : 'none';
      document.getElementById('telefoneResults').style.display = type === 'telefone' ? 'block' : 'none';
      document.getElementById('nomeResults').style.display = type === 'nome' ? 'block' : 'none';

      // Scroll to results
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function novaConsulta() {
      document.getElementById('resultsCard').classList.remove('show');
      document.getElementById('cpfInput').value = '';
      document.getElementById('telefoneInput').value = '';
      document.getElementById('nomeInput').value = '';
      clearStatus();
    }

    // Input cleanup
    document.getElementById('cpfInput').addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\\D/g, '');
    });

    document.getElementById('telefoneInput').addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\\D/g, '');
    });

    function formatCPF(cpf) {
      if (!cpf || cpf.length !== 11) return cpf;
      return cpf.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4');
    }
  </script>
</body>
</html>`;

// Routes
app.get('/', (req, res) => {
  res.send(htmlTemplate);
});

// API - CPF
app.post('/api/cpf', async (req, res) => {
  const { cpf } = req.body;

  if (!cpf || cpf.length !== 11 || !/^\d+$/.test(cpf)) {
    return res.json({ success: false, error: 'CPF inválido' });
  }

  try {
    const response = await fetch(\`\${API_BASE}/consultarcpf?cpf=\${cpf}\`);
    const text = await response.text();
    const data = parseCPFData(text);

    // Enviar webhook
    await sendWebhook('CPF', data, cpf);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao consultar CPF:', error);
    res.json({ success: false, error: 'Erro ao consultar CPF' });
  }
});

// API - Telefone
app.post('/api/telefone', async (req, res) => {
  const { telefone } = req.body;

  if (!telefone || telefone.length < 10) {
    return res.json({ success: false, error: 'Telefone inválido' });
  }

  try {
    const response = await fetch(\`\${API_BASE}/numero?q=\${telefone}\`);
    const text = await response.text();
    const data = parsePhoneData(text);

    // Enviar webhook
    if (data.length > 0) {
      await sendWebhook('TELEFONE', data);
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao consultar telefone:', error);
    res.json({ success: false, error: 'Erro ao consultar telefone' });
  }
});

// API - Nome
app.post('/api/nome', async (req, res) => {
  const { nome } = req.body;

  if (!nome || nome.length < 3) {
    return res.json({ success: false, error: 'Nome inválido' });
  }

  try {
    const response = await fetch(\`\${API_BASE}/nome-completo?q=\${encodeURIComponent(nome)}\`);
    const text = await response.text();
    const data = parseNameData(text);

    // Enviar webhook
    await sendWebhook('NOME', data);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao consultar nome:', error);
    res.json({ success: false, error: 'Erro ao consultar nome' });
  }
});

// Export for Vercel
export default app;
