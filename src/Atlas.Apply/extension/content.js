function buildPayload() {
  const title = document.querySelector("h1")?.innerText?.trim() || document.title;
  const companyHint = document.querySelector("[data-company], .company, [class*='company']")?.textContent?.trim() || null;
  const description = document.body?.innerText?.slice(0, 6000) || "";

  return {
    sourceDomain: window.location.hostname,
    pageUrl: window.location.href,
    roleTitle: title,
    company: companyHint,
    location: null,
    rawDescription: description,
    metadataJson: JSON.stringify({ capturedAt: new Date().toISOString() })
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "atlas.apply.capture.now") {
    return;
  }

  sendResponse({ ok: true, payload: buildPayload() });
});
