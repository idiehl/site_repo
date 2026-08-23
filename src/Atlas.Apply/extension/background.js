chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "atlas.apply.capture") {
    return;
  }

  fetch("https://apply.atlasuniversalis.com/api/v2/ingestion/extension", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(message.payload)
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      sendResponse({ ok: response.ok, status: response.status, data });
    })
    .catch((error) => {
      sendResponse({ ok: false, error: String(error) });
    });

  return true;
});
