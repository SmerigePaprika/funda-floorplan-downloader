chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "floorplan-found" && sender.tab) {
    chrome.action.setBadgeText({ tabId: sender.tab.id, text: "✓" });
    chrome.action.setBadgeBackgroundColor({
      tabId: sender.tab.id,
      color: "#4caf50",
    });
  }
});
