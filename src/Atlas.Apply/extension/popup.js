const statusEl = document.getElementById("status");
const captureButton = document.getElementById("capture");
const resetButton = document.getElementById("reset-defaults");
const statusSelect = document.getElementById("status-select");
const prioritySelect = document.getElementById("priority-select");
const resumeVariantInput = document.getElementById("resume-variant");
const coverToneInput = document.getElementById("cover-tone");
const focusAreasInput = document.getElementById("focus-areas");

const STORAGE_KEY = "atlas.apply.capture.defaults";
const defaultState = {
  status: "Queued",
  priority: "Normal",
  resumeVariant: "General",
  coverTone: "Direct",
  focusAreas: "delivery,collaboration,problem-solving"
};

function setStatus(message, kind = "") {
  statusEl.textContent = message || "";
  statusEl.classList.remove("status-error", "status-success");
  if (kind) {
    statusEl.classList.add(kind);
  }
}

function readUiState() {
  return {
    status: statusSelect?.value || defaultState.status,
    priority: prioritySelect?.value || defaultState.priority,
    resumeVariant: (resumeVariantInput?.value || defaultState.resumeVariant).trim() || defaultState.resumeVariant,
    coverTone: (coverToneInput?.value || defaultState.coverTone).trim() || defaultState.coverTone,
    focusAreas: (focusAreasInput?.value || defaultState.focusAreas).trim() || defaultState.focusAreas
  };
}

function applyUiState(state) {
  statusSelect.value = state.status || defaultState.status;
  prioritySelect.value = state.priority || defaultState.priority;
  resumeVariantInput.value = state.resumeVariant || defaultState.resumeVariant;
  coverToneInput.value = state.coverTone || defaultState.coverTone;
  focusAreasInput.value = state.focusAreas || defaultState.focusAreas;
}

function persistUiState() {
  const state = readUiState();
  chrome.storage.local.set({ [STORAGE_KEY]: state });
}

chrome.storage.local.get([STORAGE_KEY], (result) => {
  const saved = result?.[STORAGE_KEY];
  applyUiState({ ...defaultState, ...(saved || {}) });
});

[statusSelect, prioritySelect, resumeVariantInput, coverToneInput, focusAreasInput].forEach((el) => {
  el?.addEventListener("change", persistUiState);
  el?.addEventListener("input", persistUiState);
});

resetButton?.addEventListener("click", () => {
  applyUiState(defaultState);
  persistUiState();
  setStatus("Defaults restored.", "status-success");
});

captureButton.addEventListener("click", async () => {
  captureButton.disabled = true;
  setStatus("Capturing page...");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    captureButton.disabled = false;
    setStatus("No active tab.", "status-error");
    return;
  }

  chrome.tabs.sendMessage(tab.id, { type: "atlas.apply.capture.now" }, (response) => {
    if (!response?.ok) {
      captureButton.disabled = false;
      setStatus("Capture failed.", "status-error");
      return;
    }

    const state = readUiState();
    const focusAreas = (state.focusAreas || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const payload = {
      ...response.payload,
      applicationStatus: state.status,
      applicationPriority: state.priority,
      applicationOptionsJson: JSON.stringify({
        resumeVariant: state.resumeVariant,
        coverLetterTone: state.coverTone,
        focusAreas: focusAreas.length ? focusAreas : ["delivery", "collaboration", "problem-solving"]
      })
    };

    chrome.runtime.sendMessage(
      {
        type: "atlas.apply.capture",
        payload
      },
      (result) => {
        captureButton.disabled = false;
        if (result?.ok) {
          setStatus("Captured and sent to Atlas Apply.", "status-success");
        } else {
          const reason = `${result?.status || ""} ${result?.error || ""}`.trim();
          setStatus(`Send failed${reason ? `: ${reason}` : "."}`, "status-error");
        }
      });
  });
});
