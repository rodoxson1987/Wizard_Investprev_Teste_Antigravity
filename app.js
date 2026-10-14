/* ==========================================================================
   WIZARD DE ONBOARDING RPPS - LÓGICA DE APLICAÇÃO (MVP)
   ========================================================================== */

// Estado Geral da Aplicação
const state = {
    currentStep: 1,
    theme: 'high-fidelity-mode', // 'high-fidelity-mode' ou 'wireframe-mode'
    rppsInfo: {
        nome: '',
        cnpj: '',
        enteEstado: '',
        enteMunicipio: '',
        progestao: 'Não Aderido',
        planos: {
            civil: true,
            militar: false,
            taxa: true
        },
        contacts: []
    },
    users: [
        // Usuários padrão para demonstração
        { nome: 'Ana Souza', email: 'ana.souza@rpps.gov.br', perfil: 'Administrador', status: 'Ativo' },
        { nome: 'Carlos Silva', email: 'carlos.silva@rpps.gov.br', perfil: 'Gestor', status: 'Ativo' }
    ],
    assetsImported: false,
    assets: [],
    pai: {
        ano: '2026',
        allocations: {
            '7-1-a': 0,
            '7-1-b': 0,
            '7-3-a': 0,
            '7-4': 0,
            '8-1': 0,
            '8-2': 0,
            '9-a': 0
        }
    },
    accounts: [],
    banks: [],
    assetsCAD: []
};

// ===========================================================================
// CAD-01: Catálogo de Bancos e Instituições Financeiras (BCB — Res. 4.553/2017)
// Segmentos S1/S2 = elegíveis para aportes RPPS (CMN 5.272/2025)
// ===========================================================================
const BANK_CATALOG = [
    // S1 — Grandes Bancos
    { compe: '001', ispb: '00000000', razaoSocial: 'Banco do Brasil S.A.', cnpj: '00.000.000/0001-91', segmento: 'S1', eligible: true },
    { compe: '104', ispb: '36122327', razaoSocial: 'Caixa Econômica Federal', cnpj: '00.360.305/0001-04', segmento: 'S1', eligible: true },
    { compe: '237', ispb: '60746948', razaoSocial: 'Banco Bradesco S.A.', cnpj: '60.746.948/0001-12', segmento: 'S1', eligible: true },
    { compe: '341', ispb: '60701190', razaoSocial: 'Itaú Unibanco S.A.', cnpj: '60.701.190/0001-04', segmento: 'S1', eligible: true },
    { compe: '033', ispb: '90400888', razaoSocial: 'Banco Santander (Brasil) S.A.', cnpj: '90.400.888/0001-42', segmento: 'S1', eligible: true },
    { compe: '745', ispb: '33479023', razaoSocial: 'Citibank N.A.', cnpj: '33.479.023/0001-80', segmento: 'S1', eligible: true },
    { compe: '208', ispb: '33923798', razaoSocial: 'Banco BTG Pactual S.A.', cnpj: '30.306.294/0001-45', segmento: 'S1', eligible: true },
    // S2 — Médio-grande porte
    { compe: '422', ispb: '58160789', razaoSocial: 'Banco Safra S.A.', cnpj: '58.160.789/0001-28', segmento: 'S2', eligible: true },
    { compe: '070', ispb: '00416968', razaoSocial: 'BRB — Banco de Brasília S.A.', cnpj: '00.000.208/0001-00', segmento: 'S2', eligible: true },
    { compe: '756', ispb: '02038232', razaoSocial: 'Banco Cooperativo Sicredi S.A.', cnpj: '01.181.521/0001-55', segmento: 'S2', eligible: true },
    { compe: '748', ispb: '01181521', razaoSocial: 'Banco Cooperativo do Brasil S.A. — Bancoob', cnpj: '02.038.232/0001-48', segmento: 'S2', eligible: true },
    { compe: '041', ispb: '92702067', razaoSocial: 'Banco do Estado do Rio Grande do Sul S.A. — Banrisul', cnpj: '92.702.067/0001-96', segmento: 'S2', eligible: true },
    { compe: '004', ispb: '07237373', razaoSocial: 'Banco do Nordeste do Brasil S.A. — BNB', cnpj: '07.237.373/0001-20', segmento: 'S2', eligible: true },
    { compe: '021', ispb: '28127603', razaoSocial: 'Banco Est. do Espírito Santo S.A. — Banestes', cnpj: '28.127.603/0001-78', segmento: 'S2', eligible: true },
    { compe: '047', ispb: '13009717', razaoSocial: 'Banco do Estado de Sergipe S.A. — Banese', cnpj: '13.009.717/0001-88', segmento: 'S2', eligible: true },
    // S3 — Vedados
    { compe: '212', ispb: '92894922', razaoSocial: 'Banco Original S.A.', cnpj: '92.894.922/0001-08', segmento: 'S3', eligible: false },
    { compe: '260', ispb: '18236120', razaoSocial: 'Nu Pagamentos S.A. — Nubank', cnpj: '18.236.120/0001-58', segmento: 'S3', eligible: false },
    { compe: '290', ispb: '71027866', razaoSocial: 'Pagseguro Internet Instituição de Pagamento S.A. — PagBank', cnpj: '08.561.701/0001-01', segmento: 'S3', eligible: false },
    { compe: '336', ispb: '13220493', razaoSocial: 'Banco C6 S.A.', cnpj: '31.872.495/0001-72', segmento: 'S3', eligible: false },
    { compe: '077', ispb: '00416968', razaoSocial: 'Banco Inter S.A.', cnpj: '00.416.968/0001-01', segmento: 'S3', eligible: false },
    // S4 — Vedados
    { compe: '348', ispb: '34829992', razaoSocial: 'Banco XP S.A.', cnpj: '33.264.668/0001-03', segmento: 'S4', eligible: false },
    { compe: '380', ispb: '37880206', razaoSocial: 'PicPay Instituição de Pagamento S.A.', cnpj: '22.896.431/0001-10', segmento: 'S4', eligible: false },
    { compe: '403', ispb: '21995256', razaoSocial: 'Cora SCD S.A.', cnpj: '37.880.206/0001-63', segmento: 'S4', eligible: false },
    // S5 — Vedados
    { compe: '329', ispb: '04814563', razaoSocial: 'QI SCD S.A.', cnpj: '32.402.502/0001-35', segmento: 'S5', eligible: false },
    { compe: '461', ispb: '60850229', razaoSocial: 'Asaas IP S.A.', cnpj: '19.540.550/0001-21', segmento: 'S5', eligible: false },
];

// Dados Mockados para Simular Planilha Importada (27 Ativos)
const MOCK_IMPORTED_ASSETS = [
    { nome: "Tesouro IPCA+ 2035 (NTN-B)", cnpj: "Direto - Tesouro", plano: "Plano Previdenciário", saldo: 25000000.00, art: "7-1-a", status: "OK", msg: "Enquadrado com sucesso" },
    { nome: "Tesouro IPCA+ 2045 (NTN-B)", cnpj: "Direto - Tesouro", plano: "Plano Previdenciário", saldo: 15000000.00, art: "7-1-a", status: "OK", msg: "Enquadrado com sucesso" },
    { nome: "Tesouro Selic 2029 (LFT)", cnpj: "Direto - Tesouro", plano: "Plano Previdenciário", saldo: 35000000.00, art: "7-1-a", status: "OK", msg: "Enquadrado com sucesso" },
    { nome: "BB Previdenciário RF IRF-M1 FI", cnpj: "11.328.882/0001-35", plano: "Plano Previdenciário", saldo: 12500000.00, art: "7-1-b", status: "OK", msg: "Fundo cadastrado na CVM" },
    { nome: "Caixa Brasil Gestão Ativa RF", cnpj: "10.740.670/0001-06", plano: "Plano Previdenciário", saldo: 8000000.00, art: "7-1-b", status: "OK", msg: "Fundo cadastrado na CVM" },
    { nome: "Bradesco FI RF IDKA 2", cnpj: "13.399.136/0001-01", plano: "Plano Previdenciário", saldo: 7200000.00, art: "7-1-b", status: "OK", msg: "Fundo cadastrado na CVM" },
    { nome: "Itaú Institucional RF Ref DI", cnpj: "00.832.435/0001-27", plano: "Plano Financeiro", saldo: 10450000.00, art: "7-1-b", status: "OK", msg: "Fundo cadastrado na CVM" },
    { nome: "Santander Alocação Ativa RF", cnpj: "19.348.182/0001-09", plano: "Plano Previdenciário", saldo: 5120000.00, art: "7-1-b", status: "OK", msg: "Fundo cadastrado na CVM" },
    { nome: "SulAmérica Clássico RF CP", cnpj: "09.283.472/0001-88", plano: "Plano Previdenciário", saldo: 4500000.00, art: "7-3-a", status: "OK", msg: "Respeita limites de crédito privado" },
    { nome: "Western Asset RF Ativo CP", cnpj: "03.493.189/0001-50", plano: "Plano Previdenciário", saldo: 3800000.00, art: "7-3-a", status: "OK", msg: "Respeita limites de crédito privado" },
    { nome: "Vinci Crédito Privado RF", cnpj: "11.458.192/0001-33", plano: "Plano Financeiro", saldo: 2900000.00, art: "7-3-a", status: "OK", msg: "Respeita limites de crédito privado" },
    { nome: "BTG Pactual CP RF FI", cnpj: "08.924.782/0001-20", plano: "Plano Previdenciário", saldo: 4200000.00, art: "7-3-a", status: "OK", msg: "Respeita limites de crédito privado" },
    { nome: "Sparta Debêntures Incentivadas FI", cnpj: "18.234.918/0001-01", plano: "Plano Previdenciário", saldo: 2000000.00, art: "7-4", status: "OK", msg: "Fundo de debêntures enquadrado" },
    { nome: "XP Debêntures FI RF CP", cnpj: "23.948.109/0001-15", plano: "Plano Previdenciário", saldo: 1800000.00, art: "7-4", status: "OK", msg: "Fundo de debêntures enquadrado" },
    { nome: "ARX Elbrus Debêntures Incentivadas", cnpj: "30.129.839/0001-02", plano: "Plano Previdenciário", saldo: 1500000.00, art: "7-4", status: "OK", msg: "Fundo de debêntures enquadrado" },
    { nome: "Constellation Ações FIC FIA", cnpj: "12.039.293/0001-88", plano: "Plano Previdenciário", saldo: 3200000.00, art: "8-1", status: "OK", msg: "Segmento de renda variável" },
    { nome: "Real Investor FIC FIA", cnpj: "15.192.482/0001-03", plano: "Plano Previdenciário", saldo: 2500000.00, art: "8-1", status: "OK", msg: "Segmento de renda variável" },
    { nome: "Bogari Value FIA", cnpj: "17.293.482/0001-55", plano: "Plano Previdenciário", saldo: 1900000.00, art: "8-1", status: "OK", msg: "Segmento de renda variável" },
    { nome: "Kinea Chronos FIM", cnpj: "19.293.482/0001-99", plano: "Taxa de Administração", saldo: 1500000.00, art: "8-2", status: "OK", msg: "Multimercado enquadrado" },
    { nome: "Verde AM FIC FIM", cnpj: "00.999.888/0001-22", plano: "Taxa de Administração", saldo: 2100000.00, art: "8-2", status: "OK", msg: "Multimercado enquadrado" },
    { nome: "SPX Nimitz FIC FIM", cnpj: "13.928.384/0001-44", plano: "Plano Previdenciário", saldo: 1700000.00, art: "8-2", status: "OK", msg: "Multimercado enquadrado" },
    { nome: "Schroders BDR I FIC FI", cnpj: "14.283.472/0001-10", plano: "Plano Previdenciário", saldo: 1100000.00, art: "9-a", status: "OK", msg: "Investimento no Exterior" },
    { nome: "J.P. Morgan Global Equity BDR-FI", cnpj: "22.189.382/0001-87", plano: "Plano Previdenciário", saldo: 1300000.00, art: "9-a", status: "OK", msg: "Investimento no Exterior" },
    { nome: "Apex Global Allocation BDR-FI", cnpj: "26.289.472/0001-09", plano: "Plano Previdenciário", saldo: 900000.00, art: "9-a", status: "OK", msg: "Investimento no Exterior" },
    // Ativos com problemas de conformidade para demonstrar motor de validação
    { nome: "Fundo XYZ Renda Fixa CP Especial", cnpj: "99.999.999/9999-99", plano: "Plano Previdenciário", saldo: 2500000.00, art: "7-3-a", status: "WARNING", msg: "Mapeamento regulatório incompleto ou pendente de análise jurídica" },
    { nome: "Debênture Holding Cidade Nova (Não Listada)", cnpj: "Pendente - Sem Registro", plano: "Plano Previdenciário", saldo: 800000.00, art: "Sem Artigo", status: "DANGER", msg: "Falta CNPJ válido ou ativo não elegível pela Resolução 4.963" },
    { nome: "Fundo Parceria Estratégica RF", cnpj: "00.111.222/0001-33", plano: "Plano Financeiro", saldo: 1200000.00, art: "7-1-b", status: "WARNING", msg: "Fundo suspenso para novas aplicações pelo gestor" }
];

// Iniciar a Aplicação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    setupThemeToggler();
    setupNavigation();
    setupModuleNavigation();
    setupFormsAndInteractions();
    setupBankCatalog();
    setupAssetCatalog();
    loadFromLocalStorage();
    showStep(state.currentStep);
    updateProgressUI();
}

/* ==========================================================================
   CONTROLE DE TEMA (Wireframe vs High Fidelity)
   ========================================================================== */
function setupThemeToggler() {
    const toggle = document.getElementById('theme-toggle');
    
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            state.theme = 'high-fidelity-mode';
            document.body.classList.remove('wireframe-mode');
            document.body.classList.add('high-fidelity-mode');
        } else {
            state.theme = 'wireframe-mode';
            document.body.classList.remove('high-fidelity-mode');
            document.body.classList.add('wireframe-mode');
        }
        saveToLocalStorage();
    });
}

function applyThemeUI() {
    const toggle = document.getElementById('theme-toggle');
    if (state.theme === 'high-fidelity-mode') {
        toggle.checked = true;
        document.body.classList.remove('wireframe-mode');
        document.body.classList.add('high-fidelity-mode');
    } else {
        toggle.checked = false;
        document.body.classList.remove('high-fidelity-mode');
        document.body.classList.add('wireframe-mode');
    }
}

/* ==========================================================================
   NAVEGAÇÃO DO WIZARD (State Machine)
   ========================================================================== */
function setupNavigation() {
    const stepButtons = document.querySelectorAll('.step-btn');
    const btnBack = document.getElementById('btn-footer-back');
    const btnNext = document.getElementById('btn-footer-next');
    const btnSave = document.getElementById('btn-save-progress');
    const btnReset = document.getElementById('btn-reset');

    // Botões laterais
    stepButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const step = parseInt(btn.getAttribute('data-step'));
            if (!btn.classList.contains('locked')) {
                showStep(step);
            }
        });
    });

    // Botão Voltar (Rodapé)
    btnBack.addEventListener('click', () => {
        if (state.currentStep > 1) {
            showStep(state.currentStep - 1);
        }
    });

    // Botão Avançar / Salvar (Rodapé)
    btnNext.addEventListener('click', () => {
        if (validateStep(state.currentStep)) {
            // Salva dados locais antes de ir para o próximo passo
            saveStepData(state.currentStep);
            
            if (state.currentStep < 6) {
                // Desbloqueia o próximo passo
                const nextStepBtn = document.getElementById(`step-nav-${state.currentStep + 1}`);
                if (nextStepBtn) {
                    nextStepBtn.classList.remove('locked');
                    nextStepBtn.removeAttribute('disabled');
                }
                showStep(state.currentStep + 1);
            } else {
                // Finaliza Implantação
                triggerOnboardingFinalization();
            }
        }
    });

    // Botão de Salvar Rápido (Cabeçalho)
    btnSave.addEventListener('click', () => {
        saveStepData(state.currentStep);
        saveToLocalStorage();
        alert('Progresso da implantação salvo no seu navegador!');
    });

    // Botão de Limpar/Reiniciar (Cabeçalho)
    btnReset.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja apagar todos os dados e reiniciar o Wizard de implantação?')) {
            resetWizard();
        }
    });
}

function showStep(stepNumber) {
    state.currentStep = stepNumber;

    // Ocultar todos os painéis e desativar botões
    document.querySelectorAll('.step-pane').forEach(pane => pane.classList.add('hidden'));
    document.querySelectorAll('.step-btn').forEach(btn => btn.classList.remove('active'));

    // Mostrar painel ativo
    document.getElementById(`step-pane-${stepNumber}`).classList.remove('hidden');
    
    // Ativar botão correspondente na barra lateral
    const currentBtn = document.getElementById(`step-nav-${stepNumber}`);
    currentBtn.classList.add('active');
    currentBtn.classList.remove('locked');
    currentBtn.removeAttribute('disabled');

    // Controlar rodapé de navegação
    const btnBack = document.getElementById('btn-footer-back');
    const btnNext = document.getElementById('btn-footer-next');
    const currentIndicator = document.getElementById('current-step-indicator');

    currentIndicator.textContent = stepNumber;

    // Desabilitar voltar no passo 1
    if (stepNumber === 1) {
        btnBack.style.visibility = 'hidden';
    } else {
        btnBack.style.visibility = 'visible';
    }

    // Alterar label do botão avançar no último passo
    if (stepNumber === 6) {
        btnNext.querySelector('span').textContent = 'Finalizar Implantação';
        btnNext.className = "btn btn-success";
        generateValidationReport(); // Gera o relatório final dinâmico
    } else {
        btnNext.querySelector('span').textContent = 'Salvar e Continuar';
        btnNext.className = "btn btn-primary";
    }

    updateProgressUI();
    saveToLocalStorage();
}

function updateProgressUI() {
    // Calcula progresso base (por passos concluídos)
    // Se está no passo X, o progresso é (X - 1) / 5
    const progressPercent = Math.round(((state.currentStep - 1) / 5) * 100);
    
    document.getElementById('global-progress-percent').textContent = `${progressPercent}%`;
    document.getElementById('global-progress-bar').style.width = `${progressPercent}%`;

    // Atualiza marcas de "completo" na barra lateral
    for (let i = 1; i <= 6; i++) {
        const btn = document.getElementById(`step-nav-${i}`);
        const checkIcon = btn.querySelector('.step-check-icon');
        const numSpan = btn.querySelector('.step-number');

        if (i < state.currentStep) {
            btn.classList.add('completed');
            checkIcon.classList.remove('hidden');
            numSpan.classList.add('hidden');
        } else {
            btn.classList.remove('completed');
            checkIcon.classList.add('hidden');
            numSpan.classList.remove('hidden');
        }
    }
}

/* ==========================================================================
   VALIDAÇÕES E COLETA DE DADOS POR ETAPA
   ========================================================================== */
function validateStep(step) {
    if (step === 1) {
        // Valida campos obrigatórios da configuração do RPPS
        const form = document.getElementById('form-step-1');
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        // Valida se há pelo menos 1 contato de responsável adicionado
        if (state.rppsInfo.contacts.length === 0) {
            alert('Por favor, adicione pelo menos um contato de responsável no final da página antes de avançar.');
            return false;
        }
    }

    if (step === 2) {
        // Para o MVP, permitimos ir adiante se houver usuários cadastrados (já iniciamos com 2 mockados)
        if (state.users.length === 0) {
            alert('Cadastre pelo menos 1 usuário inicial para acessar o sistema.');
            return false;
        }
    }

    if (step === 3) {
        // Exige que a carteira de ativos tenha sido importada
        if (!state.assetsImported) {
            alert('É obrigatório realizar a importação do histórico de ativos (upload da planilha) para prosseguir.');
            return false;
        }
    }

    if (step === 4) {
        // PAI vigente: Valida se a soma das alocações propostas é exatamente 100%
        const total = calculateTotalPaiSum();
        if (Math.abs(total - 100) > 0.01) {
            alert(`A soma de alocações da PAI está em ${total.toFixed(2)}%. A soma deve ser exatamente 100% para prosseguir.`);
            return false;
        }

        // Verifica se há alguma alocação estourando o limite CMN regulatório
        let hasError = false;
        document.querySelectorAll('.input-pai-val').forEach(input => {
            const val = parseFloat(input.value) || 0;
            const limit = parseFloat(input.getAttribute('data-limit'));
            if (val > limit) {
                hasError = true;
            }
        });

        if (hasError) {
            alert('Existem metas de alocação que superam os limites regulatórios da Resolução CMN 4.963. Por favor, ajuste as alocações da PAI antes de avançar.');
            return false;
        }
    }

    if (step === 5) {
        // Cadastro de contas correntes: exige ao menos uma conta cadastrada
        if (state.accounts.length === 0) {
            alert('Registre pelo menos uma conta corrente de abertura para o RPPS.');
            return false;
        }
    }

    return true;
}

function saveStepData(step) {
    if (step === 1) {
        state.rppsInfo.nome = document.getElementById('rpps-nome').value;
        state.rppsInfo.cnpj = document.getElementById('rpps-cnpj').value;
        state.rppsInfo.enteEstado = document.getElementById('rpps-ente-estado').value;
        state.rppsInfo.enteMunicipio = document.getElementById('rpps-ente-municipio').value;
        state.rppsInfo.progestao = document.getElementById('rpps-progestao').value;
        state.rppsInfo.planos.civil = document.getElementById('plano-civil').checked;
        state.rppsInfo.planos.militar = document.getElementById('plano-militar').checked;
        state.rppsInfo.planos.taxa = document.getElementById('plano-taxa').checked;
    }

    if (step === 4) {
        state.pai.ano = document.getElementById('pai-ano').value;
        document.querySelectorAll('.input-pai-val').forEach(input => {
            const art = input.getAttribute('data-art');
            const val = parseFloat(input.value) || 0;
            state.pai.allocations[art] = val;
        });
    }

    saveToLocalStorage();
}

/* ==========================================================================
   INTERAÇÕES DOS COMPONENTES E FORMULÁRIOS
   ========================================================================== */
function setupFormsAndInteractions() {
    // ---- MÁSCARAS DE ENTRADA ----
    setupMasks();

    // ---- PASSO 1: RESPONSÁVEIS ----
    const btnAddContact = document.getElementById('btn-add-contact');
    btnAddContact.addEventListener('click', addContactHandler);

    // ---- PASSO 2: USUÁRIOS ----
    const btnAddUser = document.getElementById('btn-add-user');
    btnAddUser.addEventListener('click', addUserHandler);

    // ---- PASSO 3: UPLOAD DE ATIVOS ----
    setupAssetUpload();

    // ---- PASSO 4: LIMITES DA PAI (CMN) ----
    setupPaiCalculation();

    // ---- PASSO 5: CONTAS CORRENTES com validação S1/S2 ----
    setupAccountFormWithValidation();

    // ---- MODAL FINAL ----
    const btnCloseModal = document.getElementById('btn-close-modal');
    btnCloseModal.addEventListener('click', () => {
        document.getElementById('success-modal').classList.add('hidden');
        resetWizard();
    });
}

/* ==========================================================================
   MÓDULO CAD-01: NAVEGAÇÃO E CATALOG DE BANCOS
   ========================================================================== */
function setupModuleNavigation() {
    const moduleBtns = document.querySelectorAll('.module-btn');
    moduleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mod = btn.getAttribute('data-module');
            if (mod === 'banks') {
                openBankModule();
            }
        });
    });

    const btnBack = document.getElementById('btn-back-from-banks');
    btnBack.addEventListener('click', () => {
        closeBankModule();
    });
}

function openBankModule() {
    // Guarda o passo atual para retornar depois
    state._stepBeforeModule = state.currentStep;

    // Oculta todos os paineis de etapa
    document.querySelectorAll('.step-pane').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.step-btn:not(.module-btn)').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.module-btn').forEach(b => b.classList.add('active'));

    document.getElementById('module-pane-banks').classList.remove('hidden');
    renderBankCatalog();
}

function closeBankModule() {
    document.getElementById('module-pane-banks').classList.add('hidden');
    document.querySelectorAll('.module-btn').forEach(b => b.classList.remove('active'));
    showStep(state._stepBeforeModule || 1);
}

/* ==========================================================================
   MÓDULO CAD-02: ATIVOS FINANCEIROS
   ========================================================================== */

// Base mockada de fundos da CVM (simula lookup por CNPJ)
const MOCK_CVM_FUNDS = {
    '11.328.882/0001-35': { nome: 'BB Previdenciário RF IRF-M1 FI', gestor: 'BB DTVM S.A.', admin: 'Banco do Brasil S.A.', classCvm: 'RF — Renda Fixa', benchmark: 'IRF-M 1', taxaAdm: 0.300, taxaPerf: 'Não há', segmento: 'Art. 7º I-b — FI Títulos Públicos', custodiante: 'Banco do Brasil S.A.' },
    '10.740.670/0001-06': { nome: 'Caixa Brasil Gestão Ativa RF FI', gestor: 'Caixa Distribuidora de Títulos', admin: 'Caixa Econômica Federal', classCvm: 'RF — Renda Fixa', benchmark: 'IMA-B 5', taxaAdm: 0.250, taxaPerf: 'Não há', segmento: 'Art. 7º I-b — FI Títulos Públicos', custodiante: 'Caixa Econômica Federal' },
    '13.399.136/0001-01': { nome: 'Bradesco FI RF IDKA 2', gestor: 'Bradesco Asset Management', admin: 'Banco Bradesco S.A.', classCvm: 'RF — Renda Fixa', benchmark: 'IMA-B', taxaAdm: 0.200, taxaPerf: 'Não há', segmento: 'Art. 7º I-b — FI Títulos Públicos', custodiante: 'Banco Bradesco S.A.' },
    '00.832.435/0001-27': { nome: 'Itaú Institucional RF Ref DI FIC', gestor: 'Itaú Asset Management', admin: 'Itaú Unibanco S.A.', classCvm: 'RF — Renda Fixa', benchmark: 'CDI', taxaAdm: 0.150, taxaPerf: 'Não há', segmento: 'Art. 7º I-b — FI Títulos Públicos', custodiante: 'Itaú Unibanco S.A.' },
    '09.283.472/0001-88': { nome: 'SulAmérica Clássico RF CP FI', gestor: 'SulAmérica Investimentos DTVM', admin: 'BTG Pactual Serviços Financeiros', classCvm: 'RF — Crédito Privado', benchmark: 'CDI', taxaAdm: 0.400, taxaPerf: '20% sobre CDI', segmento: 'Art. 7º III-a — RF Crédito Privado', custodiante: 'Banco Safra S.A.' },
    '19.348.182/0001-09': { nome: 'Santander Alocação Ativa RF FI', gestor: 'Santander Asset Management', admin: 'Banco Santander (Brasil) S.A.', classCvm: 'RF — Renda Fixa', benchmark: 'IMA-B', taxaAdm: 0.300, taxaPerf: 'Não há', segmento: 'Art. 7º I-b — FI Títulos Públicos', custodiante: 'Banco Santander (Brasil) S.A.' },
    '19.293.482/0001-99': { nome: 'Kinea Chronos FIM', gestor: 'Kinea Investimentos', admin: 'Itaú Unibanco S.A.', classCvm: 'Multimercado', benchmark: 'CDI', taxaAdm: 1.500, taxaPerf: '20% sobre CDI', segmento: 'Art. 8º II — Multimercado', custodiante: 'Itaú Unibanco S.A.' },
    '12.039.293/0001-88': { nome: 'Constellation Ações FIC FIA', gestor: 'Constellation Asset Management', admin: 'BTG Pactual Serviços Financeiros', classCvm: 'Ações', benchmark: 'Ibovespa', taxaAdm: 1.500, taxaPerf: '20% sobre Ibovespa', segmento: 'Art. 8º I — Renda Variável', custodiante: 'Banco BTG Pactual S.A.' },
};

function setupAssetCatalog() {
    // Navegação de abas
    document.querySelectorAll('.asset-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            document.querySelectorAll('.asset-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.asset-tab-panel').forEach(p => p.classList.add('hidden'));
            tab.classList.add('active');
            document.getElementById(`panel-${targetTab}`).classList.remove('hidden');
        });
    });

    // Tipo de Título Público
    document.querySelectorAll('#tp-tipo-group .tipo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#tp-tipo-group .tipo-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateTPBenchmark(btn.getAttribute('data-tipo'));
        });
    });

    // Tipo de Título Privado
    document.querySelectorAll('#priv-tipo-group .tipo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#priv-tipo-group .tipo-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updatePrivFGC(btn.getAttribute('data-tipo'));
        });
    });

    // Lookup de fundo por CNPJ (simula consulta CVM)
    document.getElementById('btn-fund-lookup').addEventListener('click', simulateCVMLookup);
    document.getElementById('fund-cnpj-lookup').addEventListener('keydown', e => {
        if (e.key === 'Enter') simulateCVMLookup();
    });
    // Máscara CNPJ no campo de lookup
    document.getElementById('fund-cnpj-lookup').addEventListener('input', e => {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
        e.target.value = !x[2] ? x[1] : x[1]+'.'+x[2]+'.'+x[3]+'/'+x[4]+(x[5] ? '-'+x[5] : '');
    });
    document.getElementById('fund-cnpj').addEventListener('input', e => {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
        e.target.value = !x[2] ? x[1] : x[1]+'.'+x[2]+'.'+x[3]+'/'+x[4]+(x[5] ? '-'+x[5] : '');
    });

    // Popular selects de custodiante (S1/S2 do catálogo CAD-01)
    populateEligibleBankSelect('fund-custodiante');
    populateEligibleBankSelect('priv-emissor');

    // Validação do emissor de título privado
    document.getElementById('priv-emissor').addEventListener('change', e => {
        const bank = BANK_CATALOG.find(b => b.razaoSocial === e.target.value);
        const warningEl = document.getElementById('priv-emissor-warning');
        if (bank) {
            warningEl.className = `bank-eligibility-warning ${bank.eligible ? 'warning-ok' : 'warning-block'}`;
            warningEl.innerHTML = bank.eligible
                ? `✓ ${bank.razaoSocial} (${bank.segmento}) é elegível como emissor conforme CMN 5.272/2025.`
                : `Vedado: ${bank.razaoSocial} (${bank.segmento}) não é elegível como emissor de títulos privados para RPPS.`;
        } else {
            warningEl.className = 'bank-eligibility-warning hidden';
        }
    });

    // Handlers de submit
    document.getElementById('btn-add-fund').addEventListener('click', addFundHandler);
    document.getElementById('btn-add-tp').addEventListener('click', addTitPublicoHandler);
    document.getElementById('btn-add-priv').addEventListener('click', addTitPrivadoHandler);
    document.getElementById('btn-sync-consig').addEventListener('click', syncConsigHandler);

    // Filtros da tabela de registros
    document.getElementById('asset-filter-tipo').addEventListener('change', renderAssetsRegistry);
    document.getElementById('asset-filter-status').addEventListener('change', renderAssetsRegistry);

    renderAssetsRegistry();
}

function populateEligibleBankSelect(selectId) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const existing = sel.innerHTML;
    // Remove optgroups antigos
    sel.innerHTML = '<option value="">Selecione (S1/S2)...</option>';
    const eligible = BANK_CATALOG.filter(b => b.eligible);
    const optgroup = document.createElement('optgroup');
    optgroup.label = '✅ Elegíveis (S1/S2) — CMN 5.272';
    eligible.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.razaoSocial;
        opt.dataset.segmento = b.segmento;
        opt.textContent = `[${b.compe}] ${b.razaoSocial}`;
        optgroup.appendChild(opt);
    });
    sel.appendChild(optgroup);
}

function updateTPBenchmark(tipo) {
    const bm = document.getElementById('tp-benchmark');
    const bmMap = { 'LFT': 'SELIC', 'LTN': 'Prefixado', 'NTN-B': 'IPCA', 'NTN-B Principal': 'IPCA', 'NTN-F': 'Prefixado' };
    if (bm && bmMap[tipo]) bm.value = bmMap[tipo];
}

function updatePrivFGC(tipo) {
    const fgcSel = document.getElementById('priv-fgc');
    if (!fgcSel) return;
    if (tipo === 'LF') {
        fgcSel.value = 'Não';
    } else {
        fgcSel.value = 'Sim';
    }
}

function simulateCVMLookup() {
    const cnpjInput = document.getElementById('fund-cnpj-lookup');
    const statusEl = document.getElementById('fund-lookup-status');
    const cnpj = cnpjInput.value.trim();

    if (!cnpj || cnpj.replace(/\D/g,'').length < 14) {
        statusEl.className = 'lookup-status lookup-error';
        statusEl.textContent = '⚠️ CNPJ inválido. Por favor, informe um CNPJ completo de 14 dígitos.';
        return;
    }

    // Simula latencia de consulta
    statusEl.className = 'lookup-status lookup-loading';
    statusEl.textContent = '⏳ Consultando base de fundos da CVM...';

    setTimeout(() => {
        const fund = MOCK_CVM_FUNDS[cnpj];
        if (fund) {
            // Preenche o formulário automaticamente
            document.getElementById('fund-nome').value = fund.nome;
            document.getElementById('fund-cnpj').value = cnpj;
            document.getElementById('fund-gestor').value = fund.gestor;
            document.getElementById('fund-admin').value = fund.admin;
            document.getElementById('fund-class-cvm').value = fund.classCvm;
            document.getElementById('fund-benchmark').value = fund.benchmark;
            document.getElementById('fund-segmento').value = fund.segmento;
            document.getElementById('fund-taxa-adm').value = fund.taxaAdm;
            document.getElementById('fund-taxa-perf').value = fund.taxaPerf;
            // Seta o custodiante
            const custSel = document.getElementById('fund-custodiante');
            const custOpt = Array.from(custSel.options).find(o => o.value === fund.custodiante);
            if (custOpt) custSel.value = fund.custodiante;

            statusEl.className = 'lookup-status lookup-success';
            statusEl.innerHTML = `✅ Fundo encontrado na base CVM. Dados preenchidos automaticamente. Verifique e confirme antes de registrar.`;
        } else {
            statusEl.className = 'lookup-status lookup-warning';
            statusEl.innerHTML = `⚠️ Fundo com CNPJ <strong>${cnpj}</strong> não encontrado na base CVM simulada. Preencha os campos manualmente.`;
        }
    }, 900);
}

function addFundHandler() {
    const nome = document.getElementById('fund-nome').value.trim();
    const cnpj = document.getElementById('fund-cnpj').value.trim();
    const classCvm = document.getElementById('fund-class-cvm').value;
    const segmento = document.getElementById('fund-segmento').value;

    if (!nome || !cnpj || !classCvm || !segmento) {
        alert('Preencha os campos obrigatórios: Denominação, CNPJ, Classificação CVM e Segmento CMN.');
        return;
    }

    const asset = {
        id: Date.now(),
        tipo: 'Fundo',
        subTipo: classCvm,
        nome,
        cnpj,
        gestor: document.getElementById('fund-gestor').value,
        admin: document.getElementById('fund-admin').value,
        benchmark: document.getElementById('fund-benchmark').value,
        segmento,
        taxaAdm: document.getElementById('fund-taxa-adm').value,
        taxaPerf: document.getElementById('fund-taxa-perf').value,
        custodiante: document.getElementById('fund-custodiante').value,
        dataInicio: document.getElementById('fund-data-inicio').value,
        vencimento: '—',
        status: 'Ativo'
    };

    state.assetsCAD.push(asset);
    renderAssetsRegistry();
    clearFundForm();
    saveToLocalStorage();
}

function clearFundForm() {
    ['fund-nome','fund-cnpj','fund-gestor','fund-admin','fund-taxa-adm','fund-taxa-perf','fund-data-inicio'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('fund-cnpj-lookup').value = '';
    const statusEl = document.getElementById('fund-lookup-status');
    statusEl.className = 'lookup-status hidden';
    statusEl.textContent = '';
}

function addTitPublicoHandler() {
    const tipoBtn = document.querySelector('#tp-tipo-group .tipo-btn.active');
    const tipo = tipoBtn ? tipoBtn.getAttribute('data-tipo') : 'LFT';
    const vencimento = document.getElementById('tp-vencimento').value;
    const taxaCompra = document.getElementById('tp-taxa-compra').value;

    if (!vencimento || !taxaCompra) {
        alert('Preencha os campos obrigatórios: Data de Vencimento e Taxa de Compra.');
        return;
    }

    const segMap = { LFT: 'Art. 7º I-a — Títulos Públicos', LTN: 'Art. 7º I-a — Títulos Públicos', 'NTN-B': 'Art. 7º I-a — Títulos Públicos', 'NTN-B Principal': 'Art. 7º I-a — Títulos Públicos', 'NTN-F': 'Art. 7º I-a — Títulos Públicos' };

    const asset = {
        id: Date.now(),
        tipo: 'Título Público',
        subTipo: tipo,
        nome: `${tipo} — Tesouro Direto (venc. ${vencimento})`,
        cnpj: 'Direto — Tesouro Nacional',
        benchmark: document.getElementById('tp-benchmark').value,
        segmento: segMap[tipo] || 'Art. 7º I-a — Títulos Públicos',
        codigoSelic: document.getElementById('tp-codigo-selic').value,
        taxaCompra: `${parseFloat(taxaCompra).toFixed(4)}% a.a.`,
        valorNominal: document.getElementById('tp-valor-nominal').value,
        dataInicio: document.getElementById('tp-data-inicio').value,
        vencimento,
        custodiante: 'Tesouro Nacional / B3',
        status: 'Ativo'
    };

    state.assetsCAD.push(asset);
    renderAssetsRegistry();
    ['tp-codigo-selic','tp-vencimento','tp-data-inicio','tp-taxa-compra','tp-valor-nominal'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
    saveToLocalStorage();
}

function addTitPrivadoHandler() {
    const tipoBtn = document.querySelector('#priv-tipo-group .tipo-btn.active');
    const tipo = tipoBtn ? tipoBtn.getAttribute('data-tipo') : 'CDB';
    const emissor = document.getElementById('priv-emissor').value;
    const nome = document.getElementById('priv-nome').value.trim();
    const rentVal = document.getElementById('priv-rentabilidade-val').value.trim();
    const vencimento = document.getElementById('priv-vencimento').value;

    if (!emissor || !nome || !rentVal || !vencimento) {
        alert('Preencha os campos obrigatórios: Emissor, Denominação, Rentabilidade e Vencimento.');
        return;
    }

    const rentTipo = document.getElementById('priv-rentabilidade-tipo').value;
    const bank = BANK_CATALOG.find(b => b.razaoSocial === emissor);
    if (bank && !bank.eligible) {
        alert(`Emissor ${emissor} (${bank.segmento}) não é elegível para emissão de títulos privados para RPPS conforme CMN 5.272/2025.`);
        return;
    }

    const asset = {
        id: Date.now(),
        tipo: 'Título Privado',
        subTipo: tipo,
        nome,
        cnpj: bank?.cnpj || '',
        emissor,
        benchmark: rentTipo,
        segmento: document.getElementById('priv-segmento').value,
        rentabilidade: `${rentVal} ${rentTipo}`,
        fgc: document.getElementById('priv-fgc').value,
        dataInicio: document.getElementById('priv-data-inicio').value,
        vencimento,
        custodiante: emissor,
        status: 'Ativo'
    };

    state.assetsCAD.push(asset);
    renderAssetsRegistry();
    ['priv-nome','priv-rentabilidade-val','priv-vencimento','priv-data-inicio'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
    document.getElementById('priv-emissor').value = '';
    document.getElementById('priv-emissor-warning').className = 'bank-eligibility-warning hidden';
    saveToLocalStorage();
}

function syncConsigHandler() {
    const btn = document.getElementById('btn-sync-consig');
    btn.disabled = true;
    btn.innerHTML = `
        <svg class="icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Sincronizando...
    `;
    setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Sincronizar com ConsigPrev
        `;
        // Atualiza os valores no painel
        document.getElementById('consig-saldo').textContent = 'R$ 8.634.218,00';
        document.getElementById('consig-rendimento').textContent = 'IPCA + 4,12%';
        document.getElementById('consig-inadimplencia').textContent = '0,39%';
        document.getElementById('consig-contratos').textContent = '2.361';

        // Adiciona entrada de consignados ao registro se ainda não existir
        if (!state.assetsCAD.find(a => a.tipo === 'Consignado')) {
            state.assetsCAD.push({
                id: Date.now(),
                tipo: 'Consignado',
                subTipo: 'Cart. Consignada',
                nome: 'Carteira Consolidada de Empréstimos Consignados — ConsigPrev',
                cnpj: 'N/A (Carteira Própria)',
                benchmark: 'IPCA+',
                segmento: 'Art. 7º III-a — RF Crédito Privado',
                vencimento: 'Rolagem contínua',
                dataInicio: new Date().toISOString().split('T')[0],
                custodiante: 'Próprio RPPS',
                status: 'Ativo'
            });
            renderAssetsRegistry();
            saveToLocalStorage();
        }
    }, 1500);
}

function renderAssetsRegistry() {
    const tipoFilter = document.getElementById('asset-filter-tipo')?.value || '';
    const statusFilter = document.getElementById('asset-filter-status')?.value || '';
    const tbody = document.getElementById('assets-registry-list');
    const countEl = document.getElementById('asset-total-count');
    if (!tbody) return;

    let filtered = state.assetsCAD.filter(a => {
        const matchTipo = !tipoFilter || a.tipo === tipoFilter;
        const matchStatus = !statusFilter || a.status === statusFilter;
        return matchTipo && matchStatus;
    });

    if (countEl) countEl.textContent = `${state.assetsCAD.length} registros`;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr class="empty-state-row"><td colspan="7">Nenhum ativo cadastrado. Use os formulários acima para adicionar.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    filtered.forEach(a => {
        const tr = document.createElement('tr');

        const tipoColorMap = {
            'Fundo': 'asset-tipo-fundo',
            'Título Público': 'asset-tipo-tp',
            'Título Privado': 'asset-tipo-priv',
            'Consignado': 'asset-tipo-consig'
        };
        const tipoClass = tipoColorMap[a.tipo] || '';

        const statusBadge = a.status === 'Ativo'
            ? '<span class="pill pill-success">Ativo</span>'
            : a.status === 'Resgatado'
                ? '<span class="pill pill-warning">Resgatado</span>'
                : '<span class="pill" style="background:var(--danger-bg);color:var(--danger-color);border:1px solid var(--danger-color);">Vencido</span>';

        const vencDisplay = a.vencimento && a.vencimento !== '—'
            ? (a.vencimento.includes('-') ? new Date(a.vencimento+'T12:00:00').toLocaleDateString('pt-BR') : a.vencimento)
            : '—';

        const segShort = a.segmento ? a.segmento.split('—')[0].trim() : '—';

        tr.innerHTML = `
            <td><span class="asset-tipo-badge ${tipoClass}">${a.subTipo || a.tipo}</span></td>
            <td><strong>${a.nome}</strong>${a.gestor ? `<br><span style="font-size:11px;color:var(--text-muted);">${a.gestor}</span>` : ''}</td>
            <td style="font-size:11px;">${segShort}</td>
            <td class="font-mono" style="font-size:12px;">${a.benchmark || '—'}</td>
            <td class="font-mono" style="font-size:12px;">${vencDisplay}</td>
            <td style="text-align:center;">${statusBadge}</td>
            <td style="text-align:center;">
                <button type="button" class="btn btn-outline btn-sm btn-danger-outline btn-delete-asset" data-id="${a.id}" style="padding:4px 8px;">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Handlers de exclução
    tbody.querySelectorAll('.btn-delete-asset').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = parseInt(e.target.getAttribute('data-id'));
            state.assetsCAD = state.assetsCAD.filter(a => a.id !== id);
            renderAssetsRegistry();
            saveToLocalStorage();
        });
    });
}

function setupBankCatalog() {
    const searchEl = document.getElementById('bank-search');
    const segFilterEl = document.getElementById('bank-filter-segment');
    const eligFilterEl = document.getElementById('bank-filter-eligibility');

    const applyFilters = () => renderBankCatalog();

    searchEl.addEventListener('input', applyFilters);
    segFilterEl.addEventListener('change', applyFilters);
    eligFilterEl.addEventListener('change', applyFilters);
}

function renderBankCatalog() {
    const searchVal = (document.getElementById('bank-search')?.value || '').toLowerCase();
    const segFilter = document.getElementById('bank-filter-segment')?.value || '';
    const eligFilter = document.getElementById('bank-filter-eligibility')?.value || '';

    let filtered = BANK_CATALOG.filter(bank => {
        const matchSearch = !searchVal ||
            bank.razaoSocial.toLowerCase().includes(searchVal) ||
            bank.cnpj.includes(searchVal) ||
            bank.compe.includes(searchVal) ||
            bank.ispb.includes(searchVal);

        const matchSeg = !segFilter || bank.segmento === segFilter;
        const matchElig = !eligFilter ||
            (eligFilter === 'eligible' && bank.eligible) ||
            (eligFilter === 'blocked' && !bank.eligible);

        return matchSearch && matchSeg && matchElig;
    });

    const tbody = document.getElementById('banks-list');
    if (!tbody) return;
    tbody.innerHTML = '';

    document.getElementById('banks-visible-count').textContent = filtered.length;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr class="empty-state-row"><td colspan="6">Nenhuma instituição encontrada para os filtros selecionados.</td></tr>`;
        return;
    }

    filtered.forEach(bank => {
        const tr = document.createElement('tr');
        if (!bank.eligible) tr.classList.add('row-blocked');

        const segClass = bank.segmento.toLowerCase();
        const eligBadge = bank.eligible
            ? `<span class="elig-badge elig-ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:12px;height:12px;"><polyline points="20 6 9 17 4 12"/></svg> Elegível</span>`
            : `<span class="elig-badge elig-block"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:12px;height:12px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Vedado</span>`;

        tr.innerHTML = `
            <td class="font-mono" style="font-weight:600;">${bank.compe}</td>
            <td class="font-mono text-muted" style="font-size:12px;">${bank.ispb}</td>
            <td>${bank.razaoSocial}</td>
            <td class="font-mono" style="font-size:12px;">${bank.cnpj}</td>
            <td style="text-align:center;"><span class="reg-badge ${segClass}" style="font-size:12px;padding:2px 10px;">${bank.segmento}</span></td>
            <td style="text-align:center;">${eligBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}

function setupMasks() {
    // Máscara CNPJ (00.000.000/0001-00)
    const cnpjInput = document.getElementById('rpps-cnpj');
    cnpjInput.addEventListener('input', (e) => {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/);
        e.target.value = !x[2] ? x[1] : x[1] + '.' + x[2] + '.' + x[3] + '/' + x[4] + (x[5] ? '-' + x[5] : '');
    });

    // Máscara Telefone ((00) 00000-0000)
    const phoneInput = document.getElementById('contact-phone');
    phoneInput.addEventListener('input', (e) => {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });

    // Máscara Dinheiro/Saldo Inicial
    const balanceInput = document.getElementById('acc-balance');
    balanceInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = (value / 100).toFixed(2) + '';
        value = value.replace(".", ",");
        value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        e.target.value = value === 'NaN' || value === '0,00' ? '' : value;
    });
}

// Handler de Contatos do RPPS
function addContactHandler() {
    const nameEl = document.getElementById('contact-name');
    const emailEl = document.getElementById('contact-email');
    const phoneEl = document.getElementById('contact-phone');
    const roleEl = document.getElementById('contact-role');

    if (!nameEl.value || !emailEl.value || !phoneEl.value) {
        alert('Por favor, preencha todos os campos do contato de responsável.');
        return;
    }

    const contact = {
        id: Date.now(),
        nome: nameEl.value,
        email: emailEl.value,
        telefone: phoneEl.value,
        cargo: roleEl.value
    };

    state.rppsInfo.contacts.push(contact);
    renderContactsTable();
    
    // Limpar campos
    nameEl.value = '';
    emailEl.value = '';
    phoneEl.value = '';
    
    saveToLocalStorage();
}

function renderContactsTable() {
    const listEl = document.getElementById('contacts-list');
    listEl.innerHTML = '';

    if (state.rppsInfo.contacts.length === 0) {
        listEl.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="5">Nenhum responsável cadastrado ainda. Use o formulário acima para adicionar.</td>
            </tr>
        `;
        return;
    }

    state.rppsInfo.contacts.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.nome}</td>
            <td class="font-mono">${c.email}</td>
            <td class="font-mono">${c.telefone}</td>
            <td><span class="badge" style="background-color: var(--border-color); color: var(--text-primary); border: 1px solid var(--border-color);">${c.cargo}</span></td>
            <td style="text-align: center;">
                <button type="button" class="btn btn-outline btn-sm btn-danger-outline btn-delete" data-id="${c.id}" style="padding: 4px 8px;">Excluir</button>
            </td>
        `;
        listEl.appendChild(tr);
    });

    // Adiciona listener nos botões de excluir
    listEl.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            state.rppsInfo.contacts = state.rppsInfo.contacts.filter(c => c.id !== id);
            renderContactsTable();
            saveToLocalStorage();
        });
    });
}

// Handler de Usuários e Perfis
function addUserHandler() {
    const nameEl = document.getElementById('user-name');
    const emailEl = document.getElementById('user-email');
    const profileEl = document.getElementById('user-profile');

    if (!nameEl.value || !emailEl.value) {
        alert('Por favor, insira o nome e e-mail corporativo do usuário.');
        return;
    }

    const user = {
        nome: nameEl.value,
        email: emailEl.value,
        perfil: profileEl.value,
        status: 'Convite Enviado (Pendente)'
    };

    state.users.push(user);
    renderUsersTable();

    // Limpar campos
    nameEl.value = '';
    emailEl.value = '';
    
    saveToLocalStorage();
}

function renderUsersTable() {
    const listEl = document.getElementById('users-list');
    listEl.innerHTML = '';

    if (state.users.length === 0) {
        listEl.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="5">Nenhum usuário convidado ainda. Cadastre acima.</td>
            </tr>
        `;
        return;
    }

    state.users.forEach((u, index) => {
        const isMock = index < 2; // Simulação de usuários fixos
        const tr = document.createElement('tr');
        
        let statusBadgeClass = u.status === 'Ativo' ? 'pill-success' : 'pill-warning';
        
        tr.innerHTML = `
            <td><strong>${u.nome}</strong></td>
            <td class="font-mono">${u.email}</td>
            <td><span class="badge" style="background-color: var(--border-color); color: var(--text-primary); border: 1px solid var(--border-color);">${u.perfil}</span></td>
            <td><span class="pill ${statusBadgeClass}">${u.status}</span></td>
            <td style="text-align: center;">
                ${isMock ? `<span class="text-muted" style="font-size:11px;">Fixado</span>` : 
                `<button type="button" class="btn btn-outline btn-sm btn-danger-outline btn-delete-user" data-index="${index}" style="padding: 4px 8px;">Excluir</button>`}
            </td>
        `;
        listEl.appendChild(tr);
    });

    listEl.querySelectorAll('.btn-delete-user').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'));
            state.users.splice(idx, 1);
            renderUsersTable();
            saveToLocalStorage();
        });
    });
}

// Passo 3: Importação de Ativos e Simulação
function setupAssetUpload() {
    const zone = document.getElementById('upload-zone');
    const input = document.getElementById('file-input');
    const progressContainer = document.getElementById('upload-progress-container');
    const progressBar = document.getElementById('upload-progress-bar');
    const percentEl = document.getElementById('upload-percent');
    const statusText = document.getElementById('upload-status-text');
    const previewContainer = document.getElementById('assets-preview-container');
    const btnDownload = document.getElementById('btn-download-template');

    btnDownload.addEventListener('click', (e) => {
        e.preventDefault();
        // Dispara o download de um arquivo CSV fictício
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Nome do Ativo;CNPJ;Plano Vinculado;Saldo Atual (R$);Enquadramento Sugerido\n"
            + "Tesouro IPCA+ 2035;Direto;Plano Previdenciario;25000000.00;Art. 7 I a\n"
            + "BB Previdenciario RF IRF-M1;11328882000135;Plano Previdenciario;12500000.00;Art. 7 I b\n"
            + "XP Debentures FI RF;23948109000115;Plano Previdenciario;1800000.00;Art. 7 IV";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "modelo_ativos_rpps.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    zone.addEventListener('click', () => {
        input.click();
    });

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.style.borderColor = 'var(--success-color)';
    });

    zone.addEventListener('dragleave', () => {
        zone.style.borderColor = 'var(--border-color)';
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.style.borderColor = 'var(--border-color)';
        if (e.dataTransfer.files.length > 0) {
            handleFileUploadSimulate(e.dataTransfer.files[0]);
        }
    });

    input.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUploadSimulate(e.target.files[0]);
        }
    });

    function handleFileUploadSimulate(file) {
        document.getElementById('uploaded-file-name').textContent = file.name;
        progressContainer.classList.remove('hidden');
        previewContainer.classList.add('hidden');
        
        let progress = 0;
        progressBar.style.width = '0%';
        percentEl.textContent = '0%';
        statusText.textContent = 'Lendo cabeçalhos da planilha...';

        const interval = setInterval(() => {
            progress += 10;
            progressBar.style.width = `${progress}%`;
            percentEl.textContent = `${progress}%`;

            if (progress === 30) {
                statusText.textContent = 'Validando CNPJs no Cadastro de Fundos da CVM...';
            } else if (progress === 60) {
                statusText.textContent = 'Cruzando enquadramentos legais do Artigo 7º e 8º...';
            } else if (progress === 90) {
                statusText.textContent = 'Analisando distribuição por planos de custódia...';
            }

            if (progress >= 100) {
                clearInterval(interval);
                statusText.textContent = 'Importação concluída com sucesso!';
                
                // Mapeia e renderiza
                state.assetsImported = true;
                state.assets = MOCK_IMPORTED_ASSETS;
                renderAssetsPreview();
                saveToLocalStorage();

                // Mostra a prévia
                setTimeout(() => {
                    progressContainer.classList.add('hidden');
                    previewContainer.classList.remove('hidden');
                }, 500);
            }
        }, 150);
    }
}

function renderAssetsPreview() {
    const listEl = document.getElementById('assets-preview-list');
    listEl.innerHTML = '';

    let okCount = 0;
    let warnCount = 0;

    state.assets.forEach(a => {
        const tr = document.createElement('tr');
        
        let statusBadge = '';
        if (a.status === 'OK') {
            okCount++;
            statusBadge = '<span class="pill pill-success">✓ Válido</span>';
        } else if (a.status === 'WARNING') {
            warnCount++;
            statusBadge = '<span class="pill pill-warning">! Alerta</span>';
        } else {
            statusBadge = '<span class="pill" style="background-color: var(--danger-bg); color: var(--danger-color); border: 1px solid var(--danger-color);">✗ Crítico</span>';
        }

        // Formatação do Saldo R$
        const formattedSaldo = a.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        tr.innerHTML = `
            <td><strong>${a.nome}</strong></td>
            <td class="font-mono text-muted" style="font-size: 12px;">${a.cnpj}</td>
            <td><span class="badge" style="background-color: var(--border-color); color: var(--text-primary); border: 1px solid var(--border-color); font-size:11px;">${a.plano}</span></td>
            <td class="font-mono text-right">${formattedSaldo}</td>
            <td><span class="font-mono" style="font-weight:600;">${a.art}</span></td>
            <td style="text-align: center;">${statusBadge}</td>
        `;
        listEl.appendChild(tr);
    });

    document.getElementById('assets-count').textContent = state.assets.length;
    document.getElementById('count-assets-ok').textContent = `${okCount} Válidos`;
    document.getElementById('count-assets-warning').textContent = `${warnCount} Pendentes`;
}

// Passo 4: Cálculo e limites da PAI
function setupPaiCalculation() {
    const inputs = document.querySelectorAll('.input-pai-val');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            // Garante duas casas decimais no objeto ao atualizar
            const val = parseFloat(input.value) || 0;
            const limit = parseFloat(input.getAttribute('data-limit'));
            const art = input.getAttribute('data-art');
            const msgEl = document.getElementById(`val-${art}`);

            // Valida limite CMN unitário
            if (val > limit) {
                msgEl.textContent = `✗ Excede limite CMN de ${limit}%!`;
                msgEl.className = 'validation-msg text-danger';
            } else if (val === 0) {
                msgEl.textContent = 'Sem Alocação PAI';
                msgEl.className = 'validation-msg text-muted';
            } else {
                msgEl.textContent = '✓ Dentro do limite';
                msgEl.className = 'validation-msg text-success';
            }

            const total = calculateTotalPaiSum();
            updatePaiSummaryUI(total);
        });
    });
}

function calculateTotalPaiSum() {
    let sum = 0;
    document.querySelectorAll('.input-pai-val').forEach(input => {
        sum += parseFloat(input.value) || 0;
    });
    return sum;
}

function updatePaiSummaryUI(total) {
    const sumEl = document.getElementById('pai-total-sum');
    const badgeEl = document.getElementById('pai-status-badge');

    sumEl.textContent = `${total.toFixed(2)}%`;

    if (Math.abs(total - 100) < 0.01) {
        badgeEl.textContent = 'Alinhado (100%)';
        badgeEl.className = 'value-badge badge-success';
    } else {
        badgeEl.textContent = 'Soma deve ser 100%';
        badgeEl.className = 'value-badge badge-warning';
    }
}

// Passo 5: Cadastro de Contas Correntes com validação S1/S2 (CMN 5.272)
function setupAccountFormWithValidation() {
    const bankEl = document.getElementById('acc-bank');
    const eligWarning = document.createElement('div');
    eligWarning.id = 'acc-bank-warning';
    eligWarning.className = 'bank-eligibility-warning hidden';
    eligWarning.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;flex-shrink:0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span id="acc-bank-warning-text"></span>
    `;
    bankEl.closest('.form-group').appendChild(eligWarning);

    bankEl.addEventListener('change', () => {
        validateBankEligibility(bankEl.value);
    });

    // Popular o select com os bancos do catálogo
    populateAccountBankSelect();

    const btnAddAccount = document.getElementById('btn-add-account');
    btnAddAccount.addEventListener('click', addAccountHandler);
}

function populateAccountBankSelect() {
    const bankEl = document.getElementById('acc-bank');
    bankEl.innerHTML = '<option value="">Selecione a instituição...</option>';

    // Separa elegíveis (S1/S2) dos vedados (S3-S5)
    const eligible = BANK_CATALOG.filter(b => b.eligible);
    const blocked = BANK_CATALOG.filter(b => !b.eligible);

    const optgroupElig = document.createElement('optgroup');
    optgroupElig.label = '✅ Elegíveis (S1/S2) — CMN 5.272';
    eligible.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.razaoSocial;
        opt.dataset.segmento = b.segmento;
        opt.dataset.eligible = 'true';
        opt.textContent = `[${b.compe}] ${b.razaoSocial}`;
        optgroupElig.appendChild(opt);
    });

    const optgroupBlocked = document.createElement('optgroup');
    optgroupBlocked.label = '⛔ Vedados (S3/S4/S5) — CMN 5.272';
    blocked.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.razaoSocial;
        opt.dataset.segmento = b.segmento;
        opt.dataset.eligible = 'false';
        opt.textContent = `[${b.compe}] ${b.razaoSocial} — ${b.segmento}`;
        optgroupBlocked.appendChild(opt);
    });

    bankEl.appendChild(optgroupElig);
    bankEl.appendChild(optgroupBlocked);
}

function validateBankEligibility(bankName) {
    const bankEl = document.getElementById('acc-bank');
    const warningEl = document.getElementById('acc-bank-warning');
    const warningText = document.getElementById('acc-bank-warning-text');
    const btnAdd = document.getElementById('btn-add-account');

    if (!bankName) {
        warningEl.classList.add('hidden');
        warningEl.classList.remove('warning-block', 'warning-ok');
        btnAdd.disabled = false;
        return;
    }

    const selectedOpt = bankEl.querySelector(`option[value="${bankName}"]`);
    const isEligible = selectedOpt?.dataset.eligible === 'true';
    const segmento = selectedOpt?.dataset.segmento || '';
    const bank = BANK_CATALOG.find(b => b.razaoSocial === bankName);

    warningEl.classList.remove('hidden');

    if (isEligible) {
        warningEl.classList.remove('warning-block');
        warningEl.classList.add('warning-ok');
        warningText.textContent = `\u2713 ${bank?.razaoSocial} (${segmento}) é elegível para receber recursos de RPPS conforme CMN 5.272/2025.`;
        btnAdd.disabled = false;
    } else {
        warningEl.classList.remove('warning-ok');
        warningEl.classList.add('warning-block');
        warningText.textContent = `Vedado: ${bank?.razaoSocial} é classificada como ${segmento} pelo BCB e não pode receber aportes de recursos previdenciários (CMN 5.272/2025).`;
        btnAdd.disabled = true;
    }
}

function addAccountHandler() {
    const bankEl = document.getElementById('acc-bank');
    const agencyEl = document.getElementById('acc-agency');
    const numberEl = document.getElementById('acc-number');
    const planEl = document.getElementById('acc-plan');
    const balanceEl = document.getElementById('acc-balance');

    if (!bankEl.value || !agencyEl.value || !numberEl.value || !balanceEl.value) {
        alert('Por favor, preencha todos os campos da conta corrente.');
        return;
    }

    // Verifica elegibilidade antes de permitir cadastro
    const selectedOpt = bankEl.querySelector(`option[value="${bankEl.value}"]`);
    if (selectedOpt?.dataset.eligible === 'false') {
        alert(`Não é possível registrar conta em instituição vedada (${selectedOpt.dataset.segmento}). Por favor, selecione um banco S1 ou S2 conforme CMN 5.272/2025.`);
        return;
    }

    // Converter string de saldo para número float
    let cleanBalance = balanceEl.value.replace(/\./g, '').replace(',', '.');
    const balanceVal = parseFloat(cleanBalance) || 0;

    const bank = BANK_CATALOG.find(b => b.razaoSocial === bankEl.value);
    const account = {
        id: Date.now(),
        banco: bankEl.value,
        compe: bank?.compe || '',
        segmento: bank?.segmento || '',
        agencia: agencyEl.value,
        conta: numberEl.value,
        recurso: planEl.value,
        saldo: balanceVal
    };

    state.accounts.push(account);
    renderAccountsTable();

    // Limpar campos
    bankEl.value = '';
    agencyEl.value = '';
    numberEl.value = '';
    balanceEl.value = '';
    validateBankEligibility('');

    saveToLocalStorage();
}

function renderAccountsTable() {
    const listEl = document.getElementById('accounts-list');
    listEl.innerHTML = '';

    if (state.accounts.length === 0) {
        listEl.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="6">Nenhuma conta bancária registrada ainda. Cadastre acima.</td>
            </tr>
        `;
        document.getElementById('sum-accounts-balance').textContent = 'R$ 0,00';
        return;
    }

    let sum = 0;

    state.accounts.forEach(acc => {
        sum += acc.saldo;
        const tr = document.createElement('tr');
        const formattedSaldo = acc.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        const segBadge = acc.segmento
            ? `<span class="reg-badge ${acc.segmento.toLowerCase()}" style="font-size:11px;padding:2px 8px;margin-right:4px;">${acc.segmento}</span>`
            : '';

        tr.innerHTML = `
            <td><strong>${acc.banco}</strong> ${segBadge}</td>
            <td class="font-mono">${acc.agencia}</td>
            <td class="font-mono">${acc.conta}</td>
            <td><span class="badge" style="background-color: var(--border-color); color: var(--text-primary); border: 1px solid var(--border-color); font-size:11px;">${acc.recurso}</span></td>
            <td class="font-mono text-right" style="font-weight: 600;">${formattedSaldo}</td>
            <td style="text-align: center;">
                <button type="button" class="btn btn-outline btn-sm btn-danger-outline btn-delete-acc" data-id="${acc.id}" style="padding: 4px 8px;">Excluir</button>
            </td>
        `;
        listEl.appendChild(tr);
    });

    document.getElementById('sum-accounts-balance').textContent = sum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    listEl.querySelectorAll('.btn-delete-acc').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            state.accounts = state.accounts.filter(a => a.id !== id);
            renderAccountsTable();
            saveToLocalStorage();
        });
    });
}

/* ==========================================================================
   PASSO 6: MOTOR DE CONFORMIDADE E RELATÓRIO
   ========================================================================== */
function generateValidationReport() {
    // 1. Atualizar Metadados Básicos do RPPS
    document.getElementById('report-rpps-name').textContent = state.rppsInfo.nome || 'Não Informado';
    document.getElementById('report-rpps-cnpj').textContent = state.rppsInfo.cnpj || 'Não Informado';
    document.getElementById('report-rpps-ente').textContent = `${state.rppsInfo.enteMunicipio} - ${state.rppsInfo.enteEstado}` || 'Não Informado';
    document.getElementById('report-rpps-progestao').textContent = state.rppsInfo.progestao || 'Não Informado';
    document.getElementById('report-current-date').textContent = new Date().toLocaleDateString('pt-BR');

    // 2. Análise de Carteira Importada em Relação ao CMN & PAI
    let sumTotalEquity = 0;
    state.assets.forEach(a => sumTotalEquity += a.saldo);

    // Calcular alocações reais por Artigo
    const allocationsReais = {
        '7-1-a': 0, '7-1-b': 0, '7-3-a': 0, '7-4': 0, '8-1': 0, '8-2': 0, '9-a': 0
    };

    state.assets.forEach(a => {
        if (allocationsReais[a.art] !== undefined) {
            allocationsReais[a.art] += a.saldo;
        }
    });

    // Classificação de Ativos e Alertas
    let enquadradosCount = 0;
    let warnCount = 0;
    let dangerCount = 0;
    const alertItems = [];

    // Checa erros críticos nos ativos cadastrados
    state.assets.forEach(a => {
        if (a.status === 'OK') {
            // Verifica se a carteira real por artigo ultrapassa o limite da PAI proposta
            const percentReal = sumTotalEquity > 0 ? (a.saldo / sumTotalEquity) * 100 : 0;
            const metaPai = state.pai.allocations[a.art] || 0;

            if (metaPai === 0) {
                // Alerta: Ativo alocado em artigo sem provisão na PAI
                a.statusReport = 'WARNING';
                a.statusReportMsg = `Alerta PAI: Ativo importado sob Artigo ${a.art.replace(/-/g, ' ')}, porém a PAI aprovada tem meta de 0.00% para este segmento.`;
            } else {
                a.statusReport = 'OK';
            }
        } else {
            a.statusReport = a.status; // WARNING ou DANGER
            a.statusReportMsg = a.msg;
        }

        if (a.statusReport === 'OK') enquadradosCount++;
        if (a.statusReport === 'WARNING') warnCount++;
        if (a.statusReport === 'DANGER') dangerCount++;
    });

    // 3. Montar Lista Físicas de Alertas do Relatório
    const alertsContainer = document.getElementById('report-alerts-list');
    alertsContainer.innerHTML = '';

    // Adiciona alertas baseados nos enquadramentos reais vs meta
    // Exemplo: se meta proposta na PAI é 10%, e real alocado é 15%
    for (const art in allocationsReais) {
        const valReal = sumTotalEquity > 0 ? (allocationsReais[art] / sumTotalEquity) * 100 : 0;
        const metaPai = state.pai.allocations[art] || 0;

        if (valReal > metaPai && metaPai > 0) {
            warnCount++;
            alertItems.push({
                tipo: 'warning',
                titulo: `Excesso de Alocação PAI - Art. ${art.replace(/-/g, ' ')}`,
                msg: `A alocação real da carteira neste artigo está em ${valReal.toFixed(2)}%, superando a meta limite fixada na PAI (${metaPai.toFixed(2)}%). É recomendável rebalanceamento de carteira.`
            });
        }
    }

    // Adiciona os erros críticos individuais dos ativos
    state.assets.forEach(a => {
        if (a.statusReport === 'DANGER') {
            alertItems.push({
                tipo: 'danger',
                titulo: `Irregularidade Crítica: ${a.nome}`,
                msg: `${a.statusReportMsg} (Saldo: ${a.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`
            });
        } else if (a.statusReport === 'WARNING') {
            alertItems.push({
                tipo: 'warning',
                titulo: `Revisão Necessária: ${a.nome}`,
                msg: `${a.statusReportMsg || a.msg} (Saldo: ${a.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`
            });
        }
    });

    // Renderizar Alertas na UI
    if (alertItems.length === 0) {
        alertsContainer.innerHTML = `
            <div class="alert alert-success" style="border: 1px solid var(--success-color); background-color: var(--success-bg); border-left-width:4px; border-left-color:var(--success-color);">
                <div class="alert-content" style="color: var(--success-color);">
                    <strong>Conformidade Plena:</strong> A carteira importada está em total conformidade com a PAI aprovada e com os limites máximos da Resolução CMN 4.963. Pronto para ativação.
                </div>
            </div>
        `;
    } else {
        alertItems.forEach(item => {
            const div = document.createElement('div');
            div.className = `report-alert-item ${item.tipo}`;
            div.innerHTML = `
                <span class="alert-badge">${item.tipo === 'danger' ? 'Crítico' : 'Alerta'}</span>
                <div>
                    <strong>${item.titulo}</strong>
                    <p style="margin-top: 4px; color: var(--text-secondary);">${item.msg}</p>
                </div>
            `;
            alertsContainer.appendChild(div);
        });
    }

    // Atualizar Contadores de Validação
    document.getElementById('summary-ok-count').textContent = enquadradosCount;
    document.getElementById('summary-warn-count').textContent = warnCount;
    document.getElementById('summary-danger-count').textContent = dangerCount;
}

function triggerOnboardingFinalization() {
    // Calcula o patrimônio total alocado
    let sumTotalEquity = 0;
    state.assets.forEach(a => sumTotalEquity += a.saldo);

    // Atualiza modal com informações
    document.getElementById('modal-rpps-name').textContent = state.rppsInfo.nome;
    document.getElementById('modal-rpps-assets').textContent = `${state.assets.length} ativos cadastrados`;
    document.getElementById('modal-rpps-equity').textContent = sumTotalEquity.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Exibe Modal de Sucesso
    document.getElementById('success-modal').classList.remove('hidden');
}

/* ==========================================================================
   PERSISTÊNCIA E STORAGE (Local Storage Core)
   ========================================================================== */
function saveToLocalStorage() {
    localStorage.setItem('rpps_wizard_state', JSON.stringify({
        currentStep: state.currentStep,
        theme: state.theme,
        rppsInfo: state.rppsInfo,
        users: state.users,
        assetsImported: state.assetsImported,
        assets: state.assets,
        pai: state.pai,
        accounts: state.accounts
    }));
}

function loadFromLocalStorage() {
    const rawData = localStorage.getItem('rpps_wizard_state');
    if (!rawData) {
        // Inicializa com dados fictícios mínimos para facilitação da implantação
        state.accounts = [
            { id: 101, banco: 'Banco do Brasil', agencia: '1234-5', conta: '98765-4', recurso: 'Plano Previdenciário', saldo: 150000.00 }
        ];
        renderContactsTable();
        renderUsersTable();
        renderAccountsTable();
        return;
    }

    try {
        const data = JSON.parse(rawData);
        state.currentStep = data.currentStep || 1;
        state.theme = data.theme || 'high-fidelity-mode';
        state.rppsInfo = data.rppsInfo || state.rppsInfo;
        state.users = data.users || state.users;
        state.assetsImported = data.assetsImported || false;
        state.assets = data.assets || [];
        state.pai = data.pai || state.pai;
        state.accounts = data.accounts || [];

        // Atualiza UI
        applyThemeUI();

        // Passo 1
        document.getElementById('rpps-nome').value = state.rppsInfo.nome;
        document.getElementById('rpps-cnpj').value = state.rppsInfo.cnpj;
        document.getElementById('rpps-ente-estado').value = state.rppsInfo.enteEstado;
        document.getElementById('rpps-ente-municipio').value = state.rppsInfo.enteMunicipio;
        document.getElementById('rpps-progestao').value = state.rppsInfo.progestao;
        document.getElementById('plano-civil').checked = state.rppsInfo.planos.civil;
        document.getElementById('plano-militar').checked = state.rppsInfo.planos.militar;
        document.getElementById('plano-taxa').checked = state.rppsInfo.planos.taxa;
        renderContactsTable();

        // Passo 2
        renderUsersTable();

        // Passo 3
        if (state.assetsImported) {
            document.getElementById('assets-preview-container').classList.remove('hidden');
            renderAssetsPreview();
        }

        // Passo 4
        document.getElementById('pai-ano').value = state.pai.ano;
        document.querySelectorAll('.input-pai-val').forEach(input => {
            const art = input.getAttribute('data-art');
            const savedVal = state.pai.allocations[art] || 0;
            input.value = savedVal.toFixed(2);
            
            // Simula input para disparar validação visual de limite unitário
            input.dispatchEvent(new Event('input'));
        });

        // Passo 5
        renderAccountsTable();

        // Passo 6
        if (state.currentStep === 6) {
            generateValidationReport();
        }

        // Habilitar botões na barra lateral para os passos salvos
        for (let i = 1; i <= state.currentStep; i++) {
            const btn = document.getElementById(`step-nav-${i}`);
            btn.classList.remove('locked');
            btn.removeAttribute('disabled');
        }

    } catch (e) {
        console.error('Falha ao restaurar estado do LocalStorage:', e);
    }
}

function resetWizard() {
    localStorage.removeItem('rpps_wizard_state');
    
    // Reset do estado
    state.currentStep = 1;
    state.rppsInfo = {
        nome: '', cnpj: '', enteEstado: '', enteMunicipio: '',
        progestao: 'Não Aderido',
        planos: { civil: true, militar: false, taxa: true },
        contacts: []
    };
    state.users = [
        { nome: 'Ana Souza', email: 'ana.souza@rpps.gov.br', perfil: 'Administrador', status: 'Ativo' },
        { nome: 'Carlos Silva', email: 'carlos.silva@rpps.gov.br', perfil: 'Gestor', status: 'Ativo' }
    ];
    state.assetsImported = false;
    state.assets = [];
    state.pai = {
        ano: '2026',
        allocations: { '7-1-a': 0, '7-1-b': 0, '7-3-a': 0, '7-4': 0, '8-1': 0, '8-2': 0, '9-a': 0 }
    };
    state.accounts = [
        { id: 101, banco: 'Banco do Brasil', agencia: '1234-5', conta: '98765-4', recurso: 'Plano Previdenciário', saldo: 150000.00 }
    ];

    // Recarregar os formulários vazios e mostrar passo 1
    document.getElementById('form-step-1').reset();
    
    // Reset de campos no DOM que não são resetados pelo form.reset()
    document.querySelectorAll('.input-pai-val').forEach(input => {
        input.value = "0.00";
        input.dispatchEvent(new Event('input'));
    });

    document.getElementById('assets-preview-container').classList.add('hidden');
    document.getElementById('upload-progress-container').classList.add('hidden');
    
    // Bloquear passos 2-6
    for (let i = 2; i <= 6; i++) {
        const btn = document.getElementById(`step-nav-${i}`);
        btn.classList.add('locked');
        btn.setAttribute('disabled', 'true');
    }

    showStep(1);
}
