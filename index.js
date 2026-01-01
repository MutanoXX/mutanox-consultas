import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// World Ecletix API Config
const WORLD_ECLETIX_BASE = 'https://world-ecletix.onrender.com/api';
const API_ENDPOINTS = {
  consultarCPF: `${WORLD_ECLETIX_BASE}/consultarcpf`,
  numero: `${WORLD_ECLETIX_BASE}/numero`,
  nomeCompleto: `${WORLD_ECLETIX_BASE}/nome-completo`
};

// Função para extrair dados do texto formatado da API
function parseCPFData(text) {
  const lines = text.split('\n');
  const data = {};

  lines.forEach(line => {
    // Nome
    const nomeMatch = line.match(/Nome:\s*(.+)/);
    if (nomeMatch) data.nome = nomeMatch[1].trim();

    // CPF
    const cpfMatch = line.match(/CPF:\s*(\d{11})/);
    if (cpfMatch) data.cpf = cpfMatch[1];

    // CNS
    const cnsMatch = line.match(/CNS:\s*(\d+)/);
    if (cnsMatch) data.cns = cnsMatch[1];

    // Data de Nascimento
    const nascMatch = line.match(/Data de Nascimento:\s*(.+)/);
    if (nascMatch) data.data_nascimento = nascMatch[1].trim();

    // Idade
    const idadeMatch = line.match(/\((\d+)\s+anos\)/);
    if (idadeMatch) data.idade = idadeMatch[1];

    // Sexo
    const sexoMatch = line.match(/Sexo:\s*(.+?)-/);
    if (sexoMatch) data.sexo = sexoMatch[1].trim();

    // Cor
    const corMatch = line.match(/Cor:\s*(.+)/);
    if (corMatch) data.cor = corMatch[1].trim();

    // Mãe
    const maeMatch = line.match(/Nome da Mãe:\s*(.+)/);
    if (maeMatch) data.mae = maeMatch[1].trim();

    // Pai
    const paiMatch = line.match(/Nome do Pai:\s*(.+)/);
    if (paiMatch) data.pai = paiMatch[1].trim();

    // Naturalidade/Município
    const naturalidadeMatch = line.match(/Município de Nascimento:\s*(.+)/);
    if (naturalidadeMatch) data.naturalidade = naturalidadeMatch[1].trim();

    // Escolaridade
    const escolaridadeMatch = line.match(/Escolaridade:\s*(.+)/);
    if (escolaridadeMatch) data.escolaridade = escolaridadeMatch[1].trim();

    // Situação Cadastral
    const situacaoMatch = line.match(/Situação Cadastral:\s*(.+)/);
    if (situacaoMatch) data.situacao_cadastral = situacaoMatch[1].trim();

    // Data da Situação
    const dataSituacaoMatch = line.match(/Data da Situação:\s*(.+)/);
    if (dataSituacaoMatch) data.data_situacao = dataSituacaoMatch[1].trim();

    // Renda
    const rendaMatch = line.match(/Renda:\s*(.+)/);
    if (rendaMatch) data.renda = rendaMatch[1].trim();

    // Telefone (primeiro)
    const telefoneMatch = line.match(/Telefone 1\n• Número:\s*(\d+)/);
    if (telefoneMatch) data.telefone = telefoneMatch[1];

    // Operadora
    const operadoraMatch = line.match(/Telefone 1\n• Número:.*\n•.*Operadora:\s*(.+)/);
    if (operadoraMatch) data.operadora = operadoraMatch[1].trim();

    // Email
    const emailMatch = line.match(/E-MAIL 1\n• E-mail:\s*(.+)/);
    if (emailMatch) data.email = emailMatch[1].trim();
  });

  return data;
}

// Função para extrair dados de telefone
function parsePhoneData(text) {
  const lines = text.split('\n');
  const phones = [];

  let currentPhone = null;

  lines.forEach(line => {
    if (line.includes('PESSOA')) {
      if (currentPhone) phones.push(currentPhone);
      currentPhone = {};
    }

    const cpfMatch = line.match(/CPF\/CNPJ:\s*(.+)/);
    if (cpfMatch && currentPhone) {
      currentPhone.cpf = cpfMatch[1].trim();
      const nomeMatch = line.match(/Nome:\s*(.+)/);
      if (nomeMatch) currentPhone.nome = nomeMatch[1].trim();
    }
  });

  if (currentPhone) phones.push(currentPhone);

  // Pegar dados do telefone
  lines.forEach(line => {
    if (line.includes('TELEFONE')) {
      currentPhone = {};
      const numeroMatch = line.match(/Número:\s*(\d+)/);
      if (numeroMatch) currentPhone.numero = numeroMatch[1];
      const statusMatch = line.match(/Status:\s*(.+)/);
      if (statusMatch) currentPhone.status = statusMatch[1].trim();
      const tipoMatch = line.match(/Tipo:\s*(.+)/);
      if (tipoMatch) currentPhone.tipo = tipoMatch[1].trim();
      const operadoraMatch = line.match(/Operadora:\s*(.+)/);
      if (operadoraMatch) currentPhone.operadora = operadoraMatch[1].trim();
      phones.push(currentPhone);
    }
  });

  return phones;
}

// Função para extrair dados de nome
function parseNameData(text) {
  const lines = text.split('\n');
  const data = {};

  lines.forEach(line => {
    const cpfMatch = line.match(/CPF:\s*(\d{11})/);
    if (cpfMatch) data.cpf = cpfMatch[1];

    const nomeMatch = line.match(/Nome:\s*(.+)/);
    if (nomeMatch) data.nome = nomeMatch[1].trim();

    const nascMatch = line.match(/Data de Nascimento:\s*(.+)/);
    if (nascMatch) data.data_nascimento = nascMatch[1].trim();

    const idadeMatch = line.match(/\((\d+)\s+anos\)/);
    if (idadeMatch) data.idade = idadeMatch[1];

    const maeMatch = line.match(/Nome da Mãe:\s*(.+)/);
    if (maeMatch) data.mae = maeMatch[1].trim();
  });

  return data;
}

// HTML Template Moderno
const htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mutanox Consultas - 2026</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      font-family: 'Inter', sans-serif;
    }

    body {
      background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
      min-height: 100vh;
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .input-glow:focus {
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3), 0 0 20px rgba(139, 92, 246, 0.2);
    }

    .btn-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      background-size: 200% 200%;
      animation: gradient 3s ease infinite;
    }

    @keyframes gradient {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .loading-spinner {
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .fade-in {
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .data-row {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .data-row:last-child {
      border-bottom: none;
    }

    .pill {
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.3);
    }
  </style>
</head>
<body class="text-white">
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="py-6 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
              🔍
            </div>
            <div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Mutanox Consultas
              </h1>
              <p class="text-sm text-gray-400">Sistema Avançado de Consultas • 2026</p>
            </div>
          </div>
          <a href="https://www.instagram.com/mutanomodsx" target="_blank" class="text-purple-400 hover:text-pink-400 transition-colors">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.512 4.85.985.996.998 1.665 2.22 2.764 2.22 4.601 0 3.35-2.22 4.601-2.22.985.996-2.646-4.85-1.985-4.85-3.204 0-3.584-.512-4.85-.985-4.601-1.665-2.22-2.764-2.22-4.601 0-3.35 2.22-4.601 2.22.985.996 2.646 4.85 1.985 4.85 3.204 0 3.584.512 4.85.985.998 1.665 2.22 2.764 2.22 4.601 0 3.35-2.22 4.601-2.22-.985-4.601-1.665-2.22-2.764-2.22-4.601 0-3.35 2.22-4.601zm-1.644-6.655l-.617-3.322c-.125-.645-.46-1.016-1.016-1.747 0-.993.438-1.633.88-2.016.224-.493.533-.918.657-1.442.125-.525.203-1.024.203-1.598 0-.868-.393-1.412-.883-1.554l-2.7-2.7c-.379-.38-.575-.717-.575-1.168 0-.447.196-.734.575-1.168l1.655-1.655c-.125-.507.125-.875 0-1.024-.352-.352-.517-.875-.875-1.024l-3.322-.617c-.507-.125-1.016-.352-1.442-.203-.438-.949-.883-2.016-.883-1.747 0-.993.438-1.633.88-2.016.224-.493.533-.918.657-1.442.125-.525.203-1.024.203-1.598 0-.868-.393-1.412-.883-1.554l2.7-2.7c.379-.38.575-.717.575-1.168 0-.447-.196-.734-.575-1.168l-1.655 1.655c.125.507.125.875 0 1.024.352.352.517.875.875 1.024l3.322.617c.507.125 1.016.352 1.442.203.438.949.883 2.016.883 1.747 0 .993-.438 1.633-.88 2.016-.224.493-.533.918-.657 1.442-.125.525-.203 1.024-.203 1.598 0 .868.393 1.412.883 1.554l-2.7 2.7c-.379.38-.575.717-.575 1.168 0 .447.196.734.575 1.168l1.655 1.655c-.125-.507-.125-.875 0-1.024.352-.352.517-.875.875-1.024z"/>
            </svg>
          </a>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 px-4 py-8">
      <div class="max-w-7xl mx-auto space-y-8">
        <!-- Tabs -->
        <div class="glass-card rounded-2xl p-2 flex space-x-2">
          <button id="tabCPF" class="tab-btn flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            🆔 Consultar CPF
          </button>
          <button id="tabTelefone" class="tab-btn flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 text-gray-400 hover:text-white hover:bg-white/10">
            📱 Consultar Telefone
          </button>
          <button id="tabNome" class="tab-btn flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 text-gray-400 hover:text-white hover:bg-white/10">
            👤 Consultar Nome
          </button>
        </div>

        <!-- CPF Form -->
        <div id="cpfForm" class="glass-card rounded-2xl p-8 fade-in">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                CPF (apenas números)
              </label>
              <input
                type="text"
                id="cpfInput"
                placeholder="Digite o CPF (11 dígitos)"
                maxlength="11"
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 input-glow outline-none transition-all duration-300"
              >
            </div>
            <button id="consultCPF" class="btn-gradient w-full py-4 rounded-xl font-semibold text-white hover:opacity-90 transition-all duration-300 flex items-center justify-center space-x-2">
              <span>Consultar CPF</span>
              <div id="cpfSpinner" class="loading-spinner w-5 h-5 hidden"></div>
            </button>
            <div id="cpfStatus" class="text-center text-sm mt-2"></div>
          </div>
        </div>

        <!-- Telefone Form -->
        <div id="telefoneForm" class="glass-card rounded-2xl p-8 hidden fade-in">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Telefone (apenas números)
              </label>
              <input
                type="text"
                id="telefoneInput"
                placeholder="Digite o número de telefone"
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 input-glow outline-none transition-all duration-300"
              >
            </div>
            <button id="consultTelefone" class="btn-gradient w-full py-4 rounded-xl font-semibold text-white hover:opacity-90 transition-all duration-300 flex items-center justify-center space-x-2">
              <span>Consultar Telefone</span>
              <div id="telefoneSpinner" class="loading-spinner w-5 h-5 hidden"></div>
            </button>
            <div id="telefoneStatus" class="text-center text-sm mt-2"></div>
          </div>
        </div>

        <!-- Nome Form -->
        <div id="nomeForm" class="glass-card rounded-2xl p-8 hidden fade-in">
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                id="nomeInput"
                placeholder="Digite o nome completo"
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 input-glow outline-none transition-all duration-300"
              >
            </div>
            <button id="consultNome" class="btn-gradient w-full py-4 rounded-xl font-semibold text-white hover:opacity-90 transition-all duration-300 flex items-center justify-center space-x-2">
              <span>Consultar Nome</span>
              <div id="nomeSpinner" class="loading-spinner w-5 h-5 hidden"></div>
            </button>
            <div id="nomeStatus" class="text-center text-sm mt-2"></div>
          </div>
        </div>

        <!-- Results -->
        <div id="results" class="glass-card rounded-2xl p-8 hidden fade-in">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-2xl">
              ✓
            </div>
            <div>
              <h2 class="text-2xl font-bold text-white">Consulta Realizada</h2>
              <p class="text-gray-400 text-sm">Dados encontrados com sucesso</p>
            </div>
          </div>

          <div id="cpfResults" class="space-y-4 hidden">
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Nome Completo</div>
              <div id="resultNome" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">CPF</div>
              <div id="resultCPF" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Data de Nascimento</div>
              <div id="resultNasc" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Idade</div>
              <div id="resultIdade" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Sexo</div>
              <div id="resultSexo" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Nome da Mãe</div>
              <div id="resultMae" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Situação Cadastral</div>
              <div id="resultSituacao" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Renda</div>
              <div id="resultRenda" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Telefone</div>
              <div id="resultTelefone" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Operadora</div>
              <div id="resultOperadora" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">E-mail</div>
              <div id="resultEmail" class="text-white font-medium text-lg"></div>
            </div>
          </div>

          <div id="telefoneResults" class="space-y-4 hidden">
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Nome</div>
              <div id="resultTelNome" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">CPF</div>
              <div id="resultTelCPF" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Telefone</div>
              <div id="resultTelNumero" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Status</div>
              <div id="resultTelStatus" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Tipo</div>
              <div id="resultTelTipo" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Operadora</div>
              <div id="resultTelOperadora" class="text-white font-medium text-lg"></div>
            </div>
          </div>

          <div id="nomeResults" class="space-y-4 hidden">
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Nome</div>
              <div id="resultNomeCompleto" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">CPF</div>
              <div id="resultNomeCPF" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Data de Nascimento</div>
              <div id="resultNomeNasc" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Idade</div>
              <div id="resultNomeIdade" class="text-white font-medium text-lg"></div>
            </div>
            <div class="data-row py-4">
              <div class="text-gray-400 text-sm mb-1">Nome da Mãe</div>
              <div id="resultNomeMae" class="text-white font-medium text-lg"></div>
            </div>
          </div>

          <button id="newConsulta" class="w-full py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 border border-white/10 mt-6">
            ← Fazer Nova Consulta
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-6 px-4 border-t border-white/5">
      <div class="max-w-7xl mx-auto text-center text-gray-500 text-sm">
        <p>© 2026 Mutanox Consultas. Todos os direitos reservados.</p>
        <p class="mt-1">Desenvolvido por <span class="text-purple-400 font-medium">MutanoX</span> • Sistema de Consultas em Tempo Real</p>
      </div>
    </footer>
  </div>

  <script>
    // Tab switching
    const tabCPF = document.getElementById('tabCPF');
    const tabTelefone = document.getElementById('tabTelefone');
    const tabNome = document.getElementById('tabNome');
    const cpfForm = document.getElementById('cpfForm');
    const telefoneForm = document.getElementById('telefoneForm');
    const nomeForm = document.getElementById('nomeForm');
    const results = document.getElementById('results');

    function setActiveTab(tab, form) {
      [tabCPF, tabTelefone, tabNome].forEach(t => {
        t.classList.remove('bg-gradient-to-r', 'from-purple-500', 'to-pink-500', 'text-white');
        t.classList.add('text-gray-400', 'hover:text-white', 'hover:bg-white/10');
      });
      tab.classList.remove('text-gray-400', 'hover:text-white', 'hover:bg-white/10');
      tab.classList.add('bg-gradient-to-r', 'from-purple-500', 'to-pink-500', 'text-white');

      [cpfForm, telefoneForm, nomeForm].forEach(f => f.classList.add('hidden'));
      form.classList.remove('hidden');
      results.classList.add('hidden');
    }

    tabCPF.addEventListener('click', () => setActiveTab(tabCPF, cpfForm));
    tabTelefone.addEventListener('click', () => setActiveTab(tabTelefone, telefoneForm));
    tabNome.addEventListener('click', () => setActiveTab(tabNome, nomeForm));

    // CPF Consultation
    const cpfInput = document.getElementById('cpfInput');
    const consultCPF = document.getElementById('consultCPF');
    const cpfSpinner = document.getElementById('cpfSpinner');
    const cpfStatus = document.getElementById('cpfStatus');

    consultCPF.addEventListener('click', async () => {
      const cpf = cpfInput.value.trim();
      if (!cpf || cpf.length !== 11 || !/^\d+$/.test(cpf)) {
        cpfStatus.textContent = '❌ CPF inválido. Digite 11 dígitos numéricos.';
        cpfStatus.className = 'text-center text-sm mt-2 text-red-400';
        return;
      }

      cpfSpinner.classList.remove('hidden');
      cpfStatus.textContent = 'Consultando...';
      cpfStatus.className = 'text-center text-sm mt-2 text-purple-400';

      try {
        const response = await fetch('/api/consultar-cpf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpf })
        });

        const data = await response.json();

        if (data.success) {
          displayCPFResults(data.data);
        } else {
          cpfStatus.textContent = '❌ ' + data.error;
          cpfStatus.className = 'text-center text-sm mt-2 text-red-400';
        }
      } catch (error) {
        cpfStatus.textContent = '❌ Erro de conexão. Tente novamente.';
        cpfStatus.className = 'text-center text-sm mt-2 text-red-400';
      } finally {
        cpfSpinner.classList.add('hidden');
      }
    });

    function displayCPFResults(data) {
      results.classList.remove('hidden');
      document.getElementById('cpfResults').classList.remove('hidden');
      document.getElementById('telefoneResults').classList.add('hidden');
      document.getElementById('nomeResults').classList.add('hidden');

      document.getElementById('resultNome').textContent = data.nome || '-';
      document.getElementById('resultCPF').textContent = formatCPF(data.cpf) || '-';
      document.getElementById('resultNasc').textContent = data.data_nascimento || '-';
      document.getElementById('resultIdade').textContent = data.idade || '-';
      document.getElementById('resultSexo').textContent = data.sexo || '-';
      document.getElementById('resultMae').textContent = data.mae || '-';
      document.getElementById('resultSituacao').textContent = data.situacao_cadastral || '-';
      document.getElementById('resultRenda').textContent = data.renda || '-';
      document.getElementById('resultTelefone').textContent = data.telefone || '-';
      document.getElementById('resultOperadora').textContent = data.operadora || '-';
      document.getElementById('resultEmail').textContent = data.email || '-';

      cpfStatus.textContent = '✅ Consulta realizada com sucesso!';
      cpfStatus.className = 'text-center text-sm mt-2 text-green-400';
    }

    // Phone Consultation
    const telefoneInput = document.getElementById('telefoneInput');
    const consultTelefone = document.getElementById('consultTelefone');
    const telefoneSpinner = document.getElementById('telefoneSpinner');
    const telefoneStatus = document.getElementById('telefoneStatus');

    consultTelefone.addEventListener('click', async () => {
      const telefone = telefoneInput.value.trim();
      if (!telefone || telefone.length < 10) {
        telefoneStatus.textContent = '❌ Número inválido. Digite pelo menos 10 dígitos.';
        telefoneStatus.className = 'text-center text-sm mt-2 text-red-400';
        return;
      }

      telefoneSpinner.classList.remove('hidden');
      telefoneStatus.textContent = 'Consultando...';
      telefoneStatus.className = 'text-center text-sm mt-2 text-purple-400';

      try {
        const response = await fetch('/api/consultar-telefone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify { telefone }
        });

        const data = await response.json();

        if (data.success) {
          displayTelefoneResults(data.data);
        } else {
          telefoneStatus.textContent = '❌ ' + data.error;
          telefoneStatus.className = 'text-center text-sm mt-2 text-red-400';
        }
      } catch (error) {
        telefoneStatus.textContent = '❌ Erro de conexão. Tente novamente.';
        telefoneStatus.className = 'text-center text-sm mt-2 text-red-400';
      } finally {
        telefoneSpinner.classList.add('hidden');
      }
    });

    function displayTelefoneResults(data) {
      results.classList.remove('hidden');
      document.getElementById('cpfResults').classList.add('hidden');
      document.getElementById('telefoneResults').classList.remove('hidden');
      document.getElementById('nomeResults').classList.add('hidden');

      if (data.length > 0) {
        const first = data[0];
        document.getElementById('resultTelNome').textContent = first.nome || '-';
        document.getElementById('resultTelCPF').textContent = formatCPF(first.cpf) || '-';
        document.getElementById('resultTelNumero').textContent = first.numero || '-';
        document.getElementById('resultTelStatus').textContent = first.status || '-';
        document.getElementById('resultTelTipo').textContent = first.tipo || '-';
        document.getElementById('resultTelOperadora').textContent = first.operadora || '-';

        telefoneStatus.textContent = '✅ ' + data.length + ' telefone(s) encontrado(s)';
        telefoneStatus.className = 'text-center text-sm mt-2 text-green-400';
      } else {
        telefoneStatus.textContent = '❌ Nenhum telefone encontrado';
        telefoneStatus.className = 'text-center text-sm mt-2 text-red-400';
      }
    }

    // Name Consultation
    const nomeInput = document.getElementById('nomeInput');
    const consultNome = document.getElementById('consultNome');
    const nomeSpinner = document.getElementById('nomeSpinner');
    const nomeStatus = document.getElementById('nomeStatus');

    consultNome.addEventListener('click', async () => {
      const nome = nomeInput.value.trim();
      if (!nome || nome.length < 3) {
        nomeStatus.textContent = '❌ Nome inválido. Digite pelo menos 3 caracteres.';
        nomeStatus.className = 'text-center text-sm mt-2 text-red-400';
        return;
      }

      nomeSpinner.classList.remove('hidden');
      nomeStatus.textContent = 'Consultando...';
      nomeStatus.className = 'text-center text-sm mt-2 text-purple-400';

      try {
        const response = await fetch('/api/consultar-nome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify { nome }
        });

        const data = await response.json();

        if (data.success) {
          displayNomeResults(data.data);
        } else {
          nomeStatus.textContent = '❌ ' + data.error;
          nomeStatus.className = 'text-center text-sm mt-2 text-red-400';
        }
      } catch (error) {
        nomeStatus.textContent = '❌ Erro de conexão. Tente novamente.';
        nomeStatus.className = 'text-center text-sm mt-2 text-red-400';
      } finally {
        nomeSpinner.classList.add('hidden');
      }
    });

    function displayNomeResults(data) {
      results.classList.remove('hidden');
      document.getElementById('cpfResults').classList.add('hidden');
      document.getElementById('telefoneResults').classList.add('hidden');
      document.getElementById('nomeResults').classList.remove('hidden');

      document.getElementById('resultNomeCompleto').textContent = data.nome || '-';
      document.getElementById('resultNomeCPF').textContent = formatCPF(data.cpf) || '-';
      document.getElementById('resultNomeNasc').textContent = data.data_nascimento || '-';
      document.getElementById('resultNomeIdade').textContent = data.idade || '-';
      document.getElementById('resultNomeMae').textContent = data.mae || '-';

      nomeStatus.textContent = '✅ Consulta realizada com sucesso!';
      nomeStatus.className = 'text-center text-sm mt-2 text-green-400';
    }

    // New Consultation button
    document.getElementById('newConsulta').addEventListener('click', () => {
      results.classList.add('hidden');
      cpfStatus.textContent = '';
      telefoneStatus.textContent = '';
      nomeStatus.textContent = '';
    });

    // CPF validation
    cpfInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    });

    telefoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    });

    function formatCPF(cpf) {
      if (!cpf || cpf.length !== 11) return cpf;
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
  </script>
</body>
</html>`;

// Routes
app.get('/', (req, res) => {
  res.send(htmlTemplate);
});

// POST /api/consultar-cpf
app.post('/api/consultar-cpf', async (req, res) => {
  const { cpf } = req.body;

  if (!cpf || cpf.length !== 11 || !/^\d+$/.test(cpf)) {
    return res.json({ success: false, error: 'CPF inválido' });
  }

  try {
    const response = await fetch(`${API_ENDPOINTS.consultarCPF}?cpf=${cpf}`);
    const text = await response.text();
    const data = parseCPFData(text);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao consultar CPF:', error);
    res.json({ success: false, error: 'Erro ao consultar CPF' });
  }
});

// POST /api/consultar-telefone
app.post('/api/consultar-telefone', async (req, res) => {
  const { telefone } = req.body;

  if (!telefone || telefone.length < 10) {
    return res.json({ success: false, error: 'Telefone inválido' });
  }

  try {
    const response = await fetch(`${API_ENDPOINTS.numero}?q=${telefone}`);
    const text = await response.text();
    const data = parsePhoneData(text);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao consultar telefone:', error);
    res.json({ success: false, error: 'Erro ao consultar telefone' });
  }
});

// POST /api/consultar-nome
app.post('/api/consultar-nome', async (req, res) => {
  const { nome } = req.body;

  if (!nome || nome.length < 3) {
    return res.json({ success: false, error: 'Nome inválido' });
  }

  try {
    const response = await fetch(`${API_ENDPOINTS.nomeCompleto}?q=${encodeURIComponent(nome)}`);
    const text = await response.text();
    const data = parseNameData(text);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao consultar nome:', error);
    res.json({ success: false, error: 'Erro ao consultar nome' });
  }
});

// Export for Vercel
export default app;
