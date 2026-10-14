# RPPS Onboarder — Wizard de Implantação de Novo Cliente (MVP)

Protótipo interativo, 100% front-end, para validar o fluxo de **onboarding e implantação de clientes RPPS** (Regime Próprio de Previdência Social). Ele guia o consultor por 6 passos, do cadastro do instituto até um relatório de conformidade da carteira com a Política Anual de Investimentos (PAI) e os limites da Resolução CMN.

> Este é um MVP: não há back-end. As consultas à CVM, a importação da carteira e a sincronização com o ConsigPrev são **simuladas** com dados fictícios embutidos em `app.js`.

## Como rodar

Não precisa instalar nada nem fazer build.

**Opção 1: abrir direto no navegador**

Dê dois cliques em `index.html` (ou arraste o arquivo para o Chrome, Edge ou Firefox).

**Opção 2: servidor HTTP local (recomendado)**

```bash
# Python 3
python -m http.server 8080

# ou Node.js
npx http-server -p 8080
```

Depois acesse <http://localhost:8080>.

> As fontes (Plus Jakarta Sans e Fira Code) vêm do Google Fonts. Sem internet, a página funciona normalmente, só com as fontes padrão do sistema.

## Estrutura do projeto

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Toda a interface: cabeçalho, barra lateral de passos, os 6 painéis do wizard, os módulos de cadastro e o modal de conclusão |
| `styles.css` | Estilos dos dois temas visuais (Wireframe e Alta Fidelidade), controlados por variáveis CSS |
| `app.js` | Estado da aplicação, navegação, validações, regras regulatórias, dados simulados e persistência |
| `Especificacao_Tecnica_Software_RPPS*.docx` | Especificação técnica do software que serviu de referência para o protótipo |

## O fluxo do wizard

Cada passo é validado antes de liberar o próximo. Os passos seguintes ficam bloqueados na barra lateral até isso acontecer.

| Passo | O que faz | Para avançar |
|---|---|---|
| **1. Configuração do RPPS** | Nome, CNPJ, ente federativo (UF/município), nível Pró-Gestão, planos (civil, militar, taxa de administração) e contatos dos responsáveis | Campos obrigatórios preenchidos e pelo menos 1 contato |
| **2. Usuários e Perfis** | Cadastro de usuários com perfil de acesso (já vem com 2 usuários de exemplo) | Pelo menos 1 usuário |
| **3. Importação de Ativos** | Área de arrastar e soltar a planilha da carteira. Simula a leitura e o cruzamento com a base CVM, carregando uma carteira de exemplo com ativos classificados como OK, alerta ou crítico. Oferece uma planilha modelo para download | Importação realizada |
| **4. PAI Vigente** | Define a meta de alocação por artigo da Resolução CMN e soma em tempo real | Soma exatamente 100% e nenhum artigo acima do teto |
| **5. Contas Correntes** | Cadastro das contas do RPPS. Só aceita bancos dos segmentos **S1/S2** do BCB; bancos S3 em diante são bloqueados com aviso (CMN 5.272/2025) | Pelo menos 1 conta |
| **6. Validação Final** | Relatório consolidado: dados do RPPS, contagem de ativos enquadrados, com alerta e críticos, excesso de alocação real frente à meta da PAI. Ao concluir, exibe o modal de sucesso com o patrimônio total | — |

### Tetos de alocação aplicados no Passo 4

| Artigo | Teto |
|---|---|
| Art. 7º I-a e I-b (títulos públicos e fundos de títulos públicos) | 100% |
| Art. 7º III-a (renda fixa crédito privado) | 60% |
| Art. 7º IV | 20% |
| Art. 8º I (renda variável) | 30% |
| Art. 8º II (multimercado) | 15% |
| Art. 9º-a | 10% |

Os tetos ficam no atributo `data-limit` de cada campo em `index.html`.

## Módulos de cadastro (barra lateral)

- **CAD-01: Bancos e Instituições Financeiras.** Catálogo de bancos (código COMPE, ISPB, CNPJ, segmento BCB) com indicação de elegibilidade para receber recursos de RPPS. É a base usada para validar as contas do Passo 5. Os dados ficam na constante `BANK_CATALOG` em `app.js`.
- **CAD-02: Ativos Financeiros.** Cadastro de ativos em quatro abas: fundos de investimento (com consulta simulada à CVM pelo CNPJ, que preenche os dados do fundo automaticamente), títulos públicos, títulos privados e consignados (com sincronização simulada com o ConsigPrev).
  - ⚠️ **Limitação conhecida:** o botão deste módulo na barra lateral ainda não está ligado em `setupModuleNavigation()` (`app.js`), que só trata o módulo de bancos. O painel existe em `index.html`, mas não abre pelo menu.

Para testar a consulta à CVM, use um dos CNPJs da constante `MOCK_CVM_FUNDS`, por exemplo `11.328.882/0001-35` (BB Previdenciário RF IRF-M1).

## Outros recursos

- **Dois temas visuais**, alternados pelo seletor no cabeçalho:
  - *Wireframe*: visual de blueprint, em tons de cinza e fonte monoespaçada, para validar fluxo e UX com stakeholders.
  - *Alta Fidelidade*: visual final, com fundo escuro, cantos arredondados e indicadores de sucesso e erro.
- **Máscaras de entrada** para CNPJ, telefone e valores em reais.
- **Retomada de sessão:** o progresso é salvo no `localStorage` do navegador (chave `rpps_wizard_state`). Dá para recarregar ou fechar a aba e continuar de onde parou.
- **Limpar dados:** o botão de reset no cabeçalho apaga o estado salvo e reinicia o wizard.

## Tecnologias

HTML5, CSS3 e JavaScript (ES6+) puros, sem frameworks, dependências ou etapa de build.
