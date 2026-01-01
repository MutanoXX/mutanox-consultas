import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
const API_BASE = 'https://world-ecletix.onrender.com/api';

// Simple modern HTML template
const htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mutanox Consultas</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      color: #ffffff;
      padding: 20px;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }

    .header p {
      color: #888;
      font-size: 14px;
    }

    .tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .tab {
      flex: 1;
      padding: 12px 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
    }

    .tab:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .tab.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: transparent;
    }

    .form-container {
      display: none;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      padding: 25px;
      margin-bottom: 20px;
    }

    .form-container.active {
      display: block;
    }

    .input-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: #aaa;
      font-size: 14px;
      margin-bottom: 8px;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 15px;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #fff;
      font-size: 16px;
      transition: all 0.3s ease;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    }

    input::placeholder {
      color: #666;
    }

    button {
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 10px;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .status {
      text-align: center;
      margin-top: 15px;
      color: #888;
      font-size: 14px;
      min-height: 20px;
    }

    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-left: 10px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .results {
      display: none;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      padding: 25px;
      margin-bottom: 20px;
    }

    .results.active {
      display: block;
    }

    .results-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .results-header h2 {
      font-size: 20px;
      font-weight: 600;
      color: #4ade80;
    }

    .data-row {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .data-row:last-child {
      border-bottom: none;
    }

    .data-label {
      flex: 0 0 140px;
      color: #888;
      font-size: 14px;
      font-weight: 500;
    }

    .data-value {
      flex: 1;
      color: #fff;
      font-size: 15px;
      word-break: break-word;
    }

    .data-value.success {
      color: #4ade80;
    }

    .data-value.error {
      color: #f87171;
    }

    .new-search {
      text-align: center;
      margin-top: 20px;
    }

    .new-search button {
      background: transparent;
      border: 2px solid rgba(255, 255, 255, 0.2);
      padding: 12px 30px;
    }

    .new-search button:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }

    @media (max-width: 480px) {
      body {
        padding: 10px;
      }

      .container {
        max-width: 100%;
      }

      .tabs {
        gap: 5px;
      }

      .tab {
        padding: 10px 12px;
        font-size: 12px;
      }

      .form-container {
        padding: 20px;
      }

      .results {
        padding: 20px;
      }

      .data-label {
        flex: 0 0 100px;
        font-size: 13px;
      }

      .data-value {
        font-size: 14px;
      }

      .header h1 {
        font-size: 22px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mutanox Consultas</h1>
      <p>Sistema de Consultas em Tempo Real</p>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab active" data-tab="cpf">CPF</button>
      <button class="tab" data-tab="telefone">Telefone</button>
      <button class="tab" data-tab="nome">Nome</button>
    </div>

    <!-- CPF Form -->
    <div class="form-container active" id="cpfForm">
      <div class="input-group">
        <label>CPF (11 dígitos)</label>
        <input type="text" id="cpfInput" placeholder="Digite seu CPF" maxlength="11" autocomplete="off">
      </div>
      <button id="cpfButton">Consultar CPF</button>
      <div class="status" id="cpfStatus"></div>
    </div>

    <!-- Telefone Form -->
    <div class="form-container" id="telefoneForm">
      <div class="input-group">
        <label>Telefone (apenas números)</label>
        <input type="tel" id="telefoneInput" placeholder="Digite o número de telefone" autocomplete="off">
      </div>
      <button id="telefoneButton">Consultar Telefone</button>
      <div class="status" id="telefoneStatus"></div>
    </div>

    <!-- Nome Form -->
    <div class="form-container" id="nomeForm">
      <div class="input-group">
        <label>Nome Completo</label>
        <input type="text" id="nomeInput" placeholder="Digite o nome completo" autocomplete="off">
      </div>
      <button id="nomeButton">Consultar Nome</button>
      <div class="status" id="nomeStatus"></div>
    </div>

    <!-- Results -->
    <div class="results" id="results">
      <div class="results-header">
        <h2>✓ Consulta Realizada</h2>
      </div>

      <div id="cpfResults" style="display: none;">
        <div class="data-row">
          <div class="data-label">Nome</div>
          <div class="data-value" id="resultNome">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">CPF</div>
          <div class="data-value" id="resultCPF">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">Data de Nascimento</div>
          <div class="data-value" id="resultNascimento">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">Idade</div>
          <div class="data-value" id="resultIdade">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">Sexo</div>
          <div class="data-value" id="resultSexo">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">Mãe</div>
          <div class="data-value" id="resultMae">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">Situação Cadastral</div>
          <div class="data-value" id="resultSituacao">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">Renda</div>
          <div class="data-value" id="resultRenda">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">Telefone</div>
          <div class="data-value" id="resultTelefone">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">Operadora</div>
          <div class="data-value" id="resultOperadora">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">E-mail</div>
          <div class="data-value" id="resultEmail">-</div>
        </div>
      </div>

      <div id="telefoneResults" style="display: none;">
        <div class="data-row">
          <div class="data-label">Nome</div>
          <div class="data-value" id="resultTelNome">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">CPF</div>
          <div class="data-value" id="resultTelCPF">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">Telefone</div>
          <div class="data-value" id="resultTelNumero">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">Status</div>
          <div class="data-value" id="resultTelStatus">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">Tipo</div>
          <div class="data-value" id="resultTelTipo">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">Operadora</div>
          <div class="data-value" id="resultTelOperadora">-</div>
        </div>
      </div>

      <div id="nomeResults" style="display: none;">
        <div class="data-row">
          <div class="data-label">Nome</div>
          <div class="data-value" id="resultNomeCompleto">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">CPF</div>
          <div class="data-value" id="resultNomeCPF">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">Data de Nascimento</div>
          <div class="data-value" id="resultNomeNascimento">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">Idade</div>
          <div class="data-value" id="resultNomeIdade">-</div>
        </div>
        <div class="data-row">
          <div class="data-label">Nome da Mãe</div>
          <div class="data-value" id="resultNomeMae">-</div>
        </div>
      </div>

      <div class="new-search">
        <button id="newSearchBtn">← Nova Consulta</button>
      </div>
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
      // Update tab styles
      tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
          tab.classList.add('active');
        }
      });

      // Update form visibility
      Object.keys(forms).forEach(key => {
        forms[key].classList.remove('active');
        if (key === tabName) {
          forms[key].classList.add('active');
        }
      });

      // Hide results
      document.getElementById('results').classList.remove('active');
      document.getElementById('cpfResults').style.display = 'none';
      document.getElementById('telefoneResults').style.display = 'none';
      document.getElementById('nomeResults').style.display = 'none';

      // Clear status
      document.getElementById('cpfStatus').textContent = '';
      document.getElementById('telefoneStatus').textContent = '';
      document.getElementById('nomeStatus').textContent = '';
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // CPF Consultation
    const cpfInput = document.getElementById('cpfInput');
    const cpfButton = document.getElementById('cpfButton');
    const cpfStatus = document.getElementById('cpfStatus');

    cpfButton.addEventListener('click', async () => {
      const cpf = cpfInput.value.trim();

      if (!cpf || cpf.length !== 11 || !/^\\d+$/.test(cpf)) {
        cpfStatus.textContent = '❌ CPF deve ter 11 dígitos numéricos';
        return;
      }

      cpfButton.disabled = true;
      cpfStatus.innerHTML = '<span class="loading"></span> Consultando...';

      try {
        const response = await fetch('/api/cpf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpf })
        });

        const data = await response.json();

        if (data.success) {
          showResults('cpf', data.data);
          cpfStatus.textContent = '✅ Consulta realizada com sucesso!';
        } else {
          cpfStatus.textContent = '❌ ' + data.error;
        }
      } catch (error) {
        cpfStatus.textContent = '❌ Erro de conexão. Tente novamente.';
      } finally {
        cpfButton.disabled = false;
      }
    });

    // Phone Consultation
    const telefoneInput = document.getElementById('telefoneInput');
    const telefoneButton = document.getElementById('telefoneButton');
    const telefoneStatus = document.getElementById('telefoneStatus');

    telefoneButton.addEventListener('click', async () => {
      const telefone = telefoneInput.value.replace(/\\D/g, '');

      if (!telefone || telefone.length < 10) {
        telefoneStatus.textContent = '❌ Digite um número válido (mínimo 10 dígitos)';
        return;
      }

      telefoneButton.disabled = true;
      telefoneStatus.innerHTML = '<span class="loading"></span> Consultando...';

      try {
        const response = await fetch('/api/telefone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telefone })
        });

        const data = await response.json();

        if (data.success) {
          showResults('telefone', data.data);
          telefoneStatus.textContent = '✅ ' + data.data.length + ' telefone(s) encontrado(s)';
        } else {
          telefoneStatus.textContent = '❌ ' + data.error;
        }
      } catch (error) {
        telefoneStatus.textContent = '❌ Erro de conexão. Tente novamente.';
      } finally {
        telefoneButton.disabled = false;
      }
    });

    // Name Consultation
    const nomeInput = document.getElementById('nomeInput');
    const nomeButton = document.getElementById('nomeButton');
    const nomeStatus = document.getElementById('nomeStatus');

    nomeButton.addEventListener('click', async () => {
      const nome = nomeInput.value.trim();

      if (!nome || nome.length < 3) {
        nomeStatus.textContent = '❌ Digite um nome válido (mínimo 3 caracteres)';
        return;
      }

      nomeButton.disabled = true;
      nomeStatus.innerHTML = '<span class="loading"></span> Consultando...';

      try {
        const response = await fetch('/api/nome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome })
        });

        const data = await response.json();

        if (data.success) {
          showResults('nome', data.data);
          nomeStatus.textContent = '✅ Consulta realizada com sucesso!';
        } else {
          nomeStatus.textContent = '❌ ' + data.error;
        }
      } catch (error) {
        nomeStatus.textContent = '❌ Erro de conexão. Tente novamente.';
      } finally {
        nomeButton.disabled = false;
      }
    });

    // Show Results
    function showResults(type, data) {
      document.getElementById('results').classList.add('active');

      // Hide all result sections
      document.getElementById('cpfResults').style.display = 'none';
      document.getElementById('telefoneResults').style.display = 'none';
      document.getElementById('nomeResults').style.display = 'none';

      if (type === 'cpf') {
        document.getElementById('cpfResults').style.display = 'block';
        document.getElementById('resultNome').textContent = data.nome || '-';
        document.getElementById('resultCPF').textContent = formatCPF(data.cpf) || '-';
        document.getElementById('resultNascimento').textContent = data.data_nascimento || '-';
        document.getElementById('resultIdade').textContent = data.idade || '-';
        document.getElementById('resultSexo').textContent = data.sexo || '-';
        document.getElementById('resultMae').textContent = data.mae || '-';
        document.getElementById('resultSituacao').textContent = data.situacao_cadastral || '-';
        document.getElementById('resultRenda').textContent = data.renda || '-';
        document.getElementById('resultTelefone').textContent = data.telefone || '-';
        document.getElementById('resultOperadora').textContent = data.operadora || '-';
        document.getElementById('resultEmail').textContent = data.email || '-';
      } else if (type === 'telefone') {
        document.getElementById('telefoneResults').style.display = 'block';
        if (data.length > 0) {
          const first = data[0];
          document.getElementById('resultTelNome').textContent = first.nome || '-';
          document.getElementById('resultTelCPF').textContent = formatCPF(first.cpf) || '-';
          document.getElementById('resultTelNumero').textContent = first.numero || '-';
          document.getElementById('resultTelStatus').textContent = first.status || '-';
          document.getElementById('resultTelTipo').textContent = first.tipo || '-';
          document.getElementById('resultTelOperadora').textContent = first.operadora || '-';
        }
      } else if (type === 'nome') {
        document.getElementById('nomeResults').style.display = 'block';
        document.getElementById('resultNomeCompleto').textContent = data.nome || '-';
        document.getElementById('resultNomeCPF').textContent = formatCPF(data.cpf) || '-';
        document.getElementById('resultNomeNascimento').textContent = data.data_nascimento || '-';
        document.getElementById('resultNomeIdade').textContent = data.idade || '-';
        document.getElementById('resultNomeMae').textContent = data.mae || '-';
      }
    }

    // New Search Button
    document.getElementById('newSearchBtn').addEventListener('click', () => {
      document.getElementById('results').classList.remove('active');
      cpfInput.value = '';
      telefoneInput.value = '';
      nomeInput.value = '';
      document.getElementById('cpfStatus').textContent = '';
      document.getElementById('telefoneStatus').textContent = '';
      document.getElementById('nomeStatus').textContent = '';
    });

    // Input cleanup
    cpfInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\\D/g, '');
    });

    telefoneInput.addEventListener('input', (e) => {
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

// API Routes
app.post('/api/cpf', async (req, res) => {
  const { cpf } = req.body;

  if (!cpf || cpf.length !== 11 || !/^\\d+$/.test(cpf)) {
    return res.json({ success: false, error: 'CPF inválido' });
  }

  try {
    const response = await fetch(\`\${API_BASE}/consultarcpf?cpf=\${cpf}\`);
    const text = await response.text();
    const data = parseCPFData(text);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao consultar CPF:', error);
    res.json({ success: false, error: 'Erro ao consultar CPF' });
  }
});

app.post('/api/telefone', async (req, res) => {
  const { telefone } = req.body;

  if (!telefone || telefone.length < 10) {
    return res.json({ success: false, error: 'Telefone inválido' });
  }

  try {
    const response = await fetch(\`\${API_BASE}/numero?q=\${telefone}\`);
    const text = await response.text();
    const data = parsePhoneData(text);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao consultar telefone:', error);
    res.json({ success: false, error: 'Erro ao consultar telefone' });
  }
});

app.post('/api/nome', async (req, res) => {
  const { nome } = req.body;

  if (!nome || nome.length < 3) {
    return res.json({ success: false, error: 'Nome inválido' });
  }

  try {
    const response = await fetch(\`\${API_BASE}/nome-completo?q=\${encodeURIComponent(nome)}\`);
    const text = await response.text();
    const data = parseNameData(text);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao consultar nome:', error);
    res.json({ success: false, error: 'Erro ao consultar nome' });
  }
});

// Helper functions
function parseCPFData(text) {
  const lines = text.split('\\n');
  const data = {};

  lines.forEach(line => {
    if (line.includes('Nome:')) {
      const match = line.match(/Nome:\\s*(.+)/);
      if (match) data.nome = match[1].trim();
    } else if (line.includes('CPF:')) {
      const match = line.match(/CPF:\\s*(\\d{11})/);
      if (match) data.cpf = match[1];
    } else if (line.includes('Data de Nascimento:')) {
      const match = line.match(/Data de Nascimento:\\s*(.+)/);
      if (match) data.data_nascimento = match[1].trim();
    } else if (line.includes('(') && line.includes('anos')) {
      const match = line.match(/\\((\\d+)\\s+anos\\)/);
      if (match) data.idade = match[1];
    } else if (line.includes('Sexo:')) {
      const match = line.match(/Sexo:\\s*(.+?)\\s*-/);
      if (match) data.sexo = match[1].trim();
    } else if (line.includes('Nome da Mãe:')) {
      const match = line.match(/Nome da Mãe:\\s*(.+)/);
      if (match) data.mae = match[1].trim();
    } else if (line.includes('Situação Cadastral:')) {
      const match = line.match(/Situação Cadastral:\\s*(.+)/);
      if (match) data.situacao_cadastral = match[1].trim();
    } else if (line.includes('Renda:')) {
      const match = line.match(/Renda:\\s*(.+)/);
      if (match) data.renda = match[1].trim();
    } else if (line.includes('Telefone 1') && line.includes('Número:')) {
      const match = line.match(/Número:\\s*(\\d+)/);
      if (match) data.telefone = match[1];
    } else if (line.includes('Operadora:')) {
      const match = line.match(/Operadora:\\s*(.+)/);
      if (match) data.operadora = match[1].trim();
    } else if (line.includes('E-MAIL 1') && line.includes('E-mail:')) {
      const match = line.match(/E-mail:\\s*(.+)/);
      if (match) data.email = match[1].trim();
    }
  });

  return data;
}

function parsePhoneData(text) {
  const lines = text.split('\\n');
  const phones = [];
  let currentPhone = null;

  lines.forEach(line => {
    if (line.includes('PESSOA')) {
      if (currentPhone && currentPhone.numero) phones.push(currentPhone);
      currentPhone = {};
    }

    const cpfMatch = line.match(/CPF\\/CNPJ:\\s*(.+)/);
    if (cpfMatch && currentPhone) {
      currentPhone.cpf = cpfMatch[1].trim();
      const nomeMatch = line.match(/Nome:\\s*(.+)/);
      if (nomeMatch) currentPhone.nome = nomeMatch[1].trim();
    }

    if (line.includes('TELEFONE')) {
      if (currentPhone) phones.push(currentPhone);
      currentPhone = {};
      const numeroMatch = line.match(/Número:\\s*(\\d+)/);
      if (numeroMatch) currentPhone.numero = numeroMatch[1];
      const statusMatch = line.match(/Status:\\s*(.+)/);
      if (statusMatch) currentPhone.status = statusMatch[1].trim();
      const tipoMatch = line.match(/Tipo:\\s*(.+)/);
      if (tipoMatch) currentPhone.tipo = tipoMatch[1].trim();
      const operadoraMatch = line.match(/Operadora:\\s*(.+)/);
      if (operadoraMatch) currentPhone.operadora = operadoraMatch[1].trim();
      if (currentPhone.numero) phones.push(currentPhone);
    }
  });

  return phones;
}

function parseNameData(text) {
  const lines = text.split('\\n');
  const data = {};

  lines.forEach(line => {
    if (line.includes('CPF:')) {
      const match = line.match(/CPF:\\s*(\\d{11})/);
      if (match) data.cpf = match[1];
    } else if (line.includes('Nome:')) {
      const match = line.match(/Nome:\\s*(.+)/);
      if (match) data.nome = match[1].trim();
    } else if (line.includes('Data de Nascimento:')) {
      const match = line.match(/Data de Nascimento:\\s*(.+)/);
      if (match) data.data_nascimento = match[1].trim();
    } else if (line.includes('(') && line.includes('anos')) {
      const match = line.match(/\\((\\d+)\\s+anos\\)/);
      if (match) data.idade = match[1];
    } else if (line.includes('Nome da Mãe:')) {
      const match = line.match(/Nome da Mãe:\\s*(.+)/);
      if (match) data.mae = match[1].trim();
    }
  });

  return data;
}

// Export for Vercel
export default app;
