/**
 * ============================================================================
 * CONSULTA CEP LEOPOLDINA - VERSÃO 0.1
 * JavaScript Vanilla Puro (Sem frameworks ou bibliotecas externas)
 * Disciplina: Programação 2 - Sistemas de Informação (UEMG Carangola)
 * ============================================================================
 */

(function () {
  "use strict";

  // Estado da Aplicação
  const state = {
    cepsData: [],
    filteredResults: [],
    selectedIndex: -1,
    isLoading: true
  };

  // Elementos do DOM - Busca e Resultados
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("cep-search-input");
  const clearBtn = document.getElementById("clear-search-btn");
  const searchActionBtn = document.getElementById("search-action-btn");
  const autocompleteList = document.getElementById("autocomplete-results");
  const dataStatusBadge = document.getElementById("data-status-badge");
  const searchHint = document.getElementById("search-hint");
  const resultContainer = document.getElementById("result-container");
  const noResultsMsg = document.getElementById("no-results-msg");

  // Elementos do DOM - Detalhes do Logradouro
  const resCep = document.getElementById("res-cep");
  const resLogradouro = document.getElementById("res-logradouro");
  const resBairro = document.getElementById("res-bairro");
  const resLocalidadeUf = document.getElementById("res-localidade-uf");
  const resComplemento = document.getElementById("res-complemento");
  const resTipoLogradouro = document.getElementById("res-tipo-logradouro");
  const copyCepBtn = document.getElementById("copy-cep-btn");
  const copyBtnText = document.getElementById("copy-btn-text");
  const newSearchBtn = document.getElementById("new-search-btn");
  const toast = document.getElementById("toast");

  // Elementos dos Modais
  const modalTriggers = document.querySelectorAll("[data-modal-target]");
  const modalCloseButtons = document.querySelectorAll("[data-close-modal]");
  let activeModal = null;
  let previousActiveElement = null;

  /* ==========================================================================
     1. CARREGAMENTO DOS DADOS LOCAIS (FETCH JSON + FALLBACK OFFLINE)
     ========================================================================== */
  async function loadCepsData() {
    state.isLoading = true;

    // 1º: Tentativa padrão via fetch API (conforme exigido na Seção 2 do edital)
    try {
      const response = await fetch("./data/ceps.json");
      if (response.ok) {
        state.cepsData = await response.json();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      // 2º: Fallback automático caso aberto via duplo clique direto (protocolo file:// onde o navegador bloqueia CORS)
      if (window.CEPS_DATA && Array.isArray(window.CEPS_DATA) && window.CEPS_DATA.length > 0) {
        console.info("Base carregada via dados locais de contingência (protocolo file://).");
        state.cepsData = window.CEPS_DATA;
      } else {
        console.error("Falha ao carregar dados de CEPs:", error);
      }
    } finally {
      state.isLoading = false;
      atualizarBadgeStatus();
    }
  }

  function atualizarBadgeStatus() {
    if (!dataStatusBadge) return;
    const total = state.cepsData.length;
    if (total > 0) {
      dataStatusBadge.textContent = `${total} logradouros disponíveis`;
      dataStatusBadge.classList.add("loaded");
      dataStatusBadge.title = `Base local carregada com ${total} logradouros de Leopoldina/MG.`;
    } else {
      dataStatusBadge.textContent = "Erro ao carregar base";
      dataStatusBadge.classList.remove("loaded");
      dataStatusBadge.title = "Execute via Live Server ou verifique a pasta data/";
    }
  }

  /* ==========================================================================
     2. UTILITÁRIOS DE TEXTO E NORMALIZAÇÃO
     ========================================================================== */
  function normalizeText(text) {
    if (!text) return "";
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function highlightMatch(fullText, query) {
    if (!query || !fullText) return fullText || "";
    const normFull = normalizeText(fullText);
    const normQuery = normalizeText(query);
    const matchIndex = normFull.indexOf(normQuery);

    if (matchIndex === -1) return escapeHtml(fullText);

    const before = fullText.slice(0, matchIndex);
    const matched = fullText.slice(matchIndex, matchIndex + query.length);
    const after = fullText.slice(matchIndex + query.length);

    return `${escapeHtml(before)}<mark>${escapeHtml(matched)}</mark>${escapeHtml(after)}`;
  }

  function escapeHtml(text) {
    if (!text) return "";
    return text
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /* ==========================================================================
     3. FILTRAGEM INTELIGENTE DOS DADOS
     ========================================================================== */
  function filterLogradouros(query) {
    const normQuery = normalizeText(query);
    if (!normQuery || normQuery.length < 3) return [];

    const digitsOnlyQuery = normQuery.replace(/\D/g, "");
    const terms = normQuery.split(/\s+/).filter(Boolean);

    return state.cepsData.filter(function (item) {
      const logradouroNorm = normalizeText(item.logradouro);
      const bairroNorm = normalizeText(item.bairro);
      const cepRaw = (item.cep || "").toLowerCase();
      const cepDigits = cepRaw.replace(/\D/g, "");

      // Busca por dígitos de CEP
      if (digitsOnlyQuery.length >= 3 && cepDigits.includes(digitsOnlyQuery)) {
        return true;
      }

      // Busca textual por múltiplos termos (ex.: "praca ferez")
      return terms.every(function (term) {
        return (
          logradouroNorm.includes(term) ||
          bairroNorm.includes(term) ||
          cepRaw.includes(term)
        );
      });
    });
  }

  /* ==========================================================================
     4. MECANISMO DE BUSCA REATIVA E AUTOCOMPLETE (>= 3 CARACTERES)
     ========================================================================== */
  function handleSearchInput() {
    const rawValue = searchInput.value;
    const trimmed = rawValue.trim();

    // Controle do botão limpar (X)
    clearBtn.hidden = trimmed.length === 0;

    // Regra da Seção 3.3: O disparo do filtro só deve ocorrer após 3 ou mais caracteres
    if (trimmed.length === 0) {
      closeAutocomplete();
      noResultsMsg.hidden = true;
      if (searchHint) {
        searchHint.innerHTML = "* Digite pelo menos <strong>3 caracteres</strong> para listar sugestões.";
      }
      return;
    }

    if (trimmed.length < 3) {
      closeAutocomplete();
      noResultsMsg.hidden = true;
      const faltam = 3 - trimmed.length;
      if (searchHint) {
        searchHint.innerHTML = `* Digite mais <strong>${faltam} caractere${faltam > 1 ? "s" : ""}</strong> para iniciar a busca.`;
      }
      return;
    }

    if (searchHint) {
      searchHint.innerHTML = "* A busca inteligente está ativa!";
    }

    // Executa a filtragem
    const matches = filterLogradouros(trimmed);
    state.filteredResults = matches;
    state.selectedIndex = -1;

    if (matches.length > 0) {
      renderAutocomplete(matches, trimmed);
      noResultsMsg.hidden = true;
    } else {
      closeAutocomplete();
      noResultsMsg.hidden = false;
      resultContainer.hidden = true;
    }
  }

  function renderAutocomplete(items, query) {
    autocompleteList.innerHTML = "";

    // Exibe até 15 resultados no dropdown
    const slice = items.slice(0, 15);

    slice.forEach(function (item, index) {
      const li = document.createElement("li");
      li.className = "autocomplete-item";
      li.setAttribute("role", "option");
      li.setAttribute("id", `cep-option-${index}`);
      li.dataset.index = index;

      const highlightedName = highlightMatch(item.logradouro || "Logradouro não informado", query);
      const bairro = escapeHtml(item.bairro || "Bairro não informado");

      li.innerHTML = `
        <div class="autocomplete-text-group">
          <div class="autocomplete-main-text">${highlightedName}</div>
          <div class="autocomplete-sub-text">${bairro} • Leopoldina - MG</div>
        </div>
        <span class="autocomplete-cep-badge">${escapeHtml(item.cep || "")}</span>
      `;

      li.addEventListener("click", function () {
        selectItem(item);
      });

      autocompleteList.appendChild(li);
    });

    autocompleteList.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");
  }

  function closeAutocomplete() {
    autocompleteList.innerHTML = "";
    autocompleteList.hidden = true;
    state.selectedIndex = -1;
    searchInput.setAttribute("aria-expanded", "false");
  }

  /* ==========================================================================
     5. APRESENTAÇÃO DE DADOS & DESTAQUE ABSOLUTO AO CEP
     ========================================================================== */
  function selectItem(item) {
    if (!item) return;

    // Preenche campo de busca e ajusta botões
    searchInput.value = item.logradouro || "";
    clearBtn.hidden = false;
    closeAutocomplete();
    noResultsMsg.hidden = true;

    // Renderiza dados completos com destaque no CEP (Seção 3.3)
    resCep.textContent = item.cep || "Não informado";
    resLogradouro.textContent = item.logradouro || "Não informado";
    resBairro.textContent = item.bairro || "Não informado";
    resLocalidadeUf.textContent = `${item.localidade || "Leopoldina"} / ${item.uf || "MG"}`;
    resComplemento.textContent = item.complemento && item.complemento.trim().length > 0 
      ? item.complemento 
      : "Sem complemento específico";

    // Tipo de logradouro
    const primeiroNome = (item.logradouro || "").split(" ")[0] || "Logradouro";
    resTipoLogradouro.textContent = primeiroNome;

    // Exibe o painel de resultados com animação suave
    resultContainer.hidden = false;
    resultContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* ==========================================================================
     6. SUBMISSÃO DO FORMULÁRIO (BOTÃO BUSCAR OU TECLA ENTER)
     ========================================================================== */
  function executeSearch() {
    const rawValue = searchInput.value.trim();

    if (rawValue.length < 3) {
      if (searchHint) {
        searchHint.innerHTML = "<strong style='color: var(--danger-color);'>* Digite pelo menos 3 caracteres para buscar.</strong>";
      }
      searchInput.focus();
      return;
    }

    const matches = filterLogradouros(rawValue);

    if (state.selectedIndex >= 0 && state.filteredResults[state.selectedIndex]) {
      selectItem(state.filteredResults[state.selectedIndex]);
    } else if (matches.length > 0) {
      // Seleciona automaticamente o primeiro resultado mais relevante
      selectItem(matches[0]);
    } else {
      closeAutocomplete();
      noResultsMsg.hidden = false;
      resultContainer.hidden = true;
    }
  }

  /* ==========================================================================
     7. NAVEGAÇÃO POR TECLADO
     ========================================================================== */
  function handleKeyDown(e) {
    const items = autocompleteList.querySelectorAll(".autocomplete-item");

    if (e.key === "Enter") {
      e.preventDefault();
      executeSearch();
      return;
    }

    if (!items.length || autocompleteList.hidden) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      state.selectedIndex = (state.selectedIndex + 1) % items.length;
      updateActiveItem(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      state.selectedIndex = (state.selectedIndex - 1 + items.length) % items.length;
      updateActiveItem(items);
    } else if (e.key === "Escape") {
      closeAutocomplete();
    }
  }

  function updateActiveItem(items) {
    items.forEach(function (el, idx) {
      if (idx === state.selectedIndex) {
        el.classList.add("active");
        el.setAttribute("aria-selected", "true");
        el.scrollIntoView({ block: "nearest" });
      } else {
        el.classList.remove("active");
        el.setAttribute("aria-selected", "false");
      }
    });
  }

  /* ==========================================================================
     8. CÓPIA DO CEP E NOTIFICAÇÃO (TOAST)
     ========================================================================== */
  function copyCepToClipboard() {
    const cepText = resCep.textContent.trim();
    if (!cepText || cepText === "36700-000") return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cepText).then(showToastFeedback).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      const tempInput = document.createElement("input");
      tempInput.value = cepText;
      document.body.appendChild(tempInput);
      tempInput.select();
      try {
        document.execCommand("copy");
        showToastFeedback();
      } catch (err) {
        console.error("Falha ao copiar:", err);
      } finally {
        document.body.removeChild(tempInput);
      }
    }
  }

  function showToastFeedback() {
    if (!toast) return;
    toast.textContent = `CEP ${resCep.textContent} copiado para a área de transferência!`;
    toast.hidden = false;

    if (copyBtnText) {
      copyBtnText.textContent = "Copiado!";
      setTimeout(function () {
        copyBtnText.textContent = "Copiar CEP";
      }, 2000);
    }

    setTimeout(function () {
      toast.hidden = true;
    }, 3200);
  }

  /* ==========================================================================
     9. GERENCIAMENTO DE JANELAS FLUTUANTES (MODAIS)
     ========================================================================== */
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    previousActiveElement = document.activeElement;
    activeModal = modal;
    modal.hidden = false;
    document.body.style.overflow = "hidden";

    const closeBtn = modal.querySelector(".modal-close-btn");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!activeModal) return;

    activeModal.hidden = true;
    document.body.style.overflow = "";
    activeModal = null;

    if (previousActiveElement && typeof previousActiveElement.focus === "function") {
      previousActiveElement.focus();
    }
  }

  /* ==========================================================================
     10. REGISTRO DE EVENTOS GLOBAIS
     ========================================================================== */
  function initEvents() {
    // Eventos de digitação (input e keyup)
    searchInput.addEventListener("input", handleSearchInput);
    searchInput.addEventListener("keyup", function (e) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Enter" && e.key !== "Escape") {
        handleSearchInput();
      }
    });
    searchInput.addEventListener("keydown", handleKeyDown);

    // Submissão do formulário
    if (searchForm) {
      searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        executeSearch();
      });
    }

    // Botão Buscar
    if (searchActionBtn) {
      searchActionBtn.addEventListener("click", function (e) {
        e.preventDefault();
        executeSearch();
      });
    }

    // Botão de limpar busca
    clearBtn.addEventListener("click", function () {
      searchInput.value = "";
      clearBtn.hidden = true;
      closeAutocomplete();
      resultContainer.hidden = true;
      noResultsMsg.hidden = true;
      if (searchHint) {
        searchHint.innerHTML = "* Digite pelo menos <strong>3 caracteres</strong> para listar sugestões.";
      }
      searchInput.focus();
    });

    // Botão de nova busca no resultado
    if (newSearchBtn) {
      newSearchBtn.addEventListener("click", function () {
        searchInput.value = "";
        clearBtn.hidden = true;
        resultContainer.hidden = true;
        searchInput.focus();
      });
    }

    // Copiar CEP
    if (copyCepBtn) {
      copyCepBtn.addEventListener("click", copyCepToClipboard);
    }

    // Fechar autocomplete ao clicar fora
    document.addEventListener("click", function (e) {
      if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
        closeAutocomplete();
      }
    });

    // Modais
    modalTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        const targetId = this.dataset.modalTarget;
        openModal(targetId);
      });
    });

    modalCloseButtons.forEach(function (btn) {
      btn.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && activeModal) {
        closeModal();
      }
    });
  }

  // Inicialização
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initEvents();
      loadCepsData();
    });
  } else {
    initEvents();
    loadCepsData();
  }
})();
