const status = document.getElementById("status");
const extractButton = document.getElementById("extract");
let currentProjectId = null;

const BASE_URL = "https://fmlpub.s3-eu-west-1.amazonaws.com";

function updateStatus(message, type = "") {
  status.textContent = message;
  status.classList.remove("success", "error");
  if (type) status.classList.add(type);
}

async function scanForProjectId(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const findProjectId = (obj) => {
        const seen = new Set();
        const search = (node) => {
          if (!node || typeof node !== "object" || seen.has(node)) return null;
          seen.add(node);
          if (typeof node.projectId === "string" && /^\d{8,}$/.test(node.projectId)) return node.projectId;
          if (typeof node.projectId === "number" && node.projectId > 1000000) return node.projectId.toString();
          for (const key in node) {
            const result = search(node[key]);
            if (result) return result;
          }
          return null;
        };
        return search(obj);
      };

      const scripts = document.querySelectorAll("script[type='application/json']");
      for (const script of scripts) {
        try {
          const json = JSON.parse(script.textContent.replace(/^\uFEFF/, ''));
          let projectId = findProjectId(json);

          if (!projectId && Array.isArray(json)) {
            const data = json.flat ? json.flat(Infinity) : [].concat(...json);
            for (let i = 0; i < data.length - 1; i++) {
              const current = data[i];
              const next = data[i + 1];
              if (
                current &&
                typeof current === "object" &&
                current.projectId !== undefined &&
                (typeof next === "string" || typeof next === "number") &&
                /^\d{8,}$/.test(String(next))
              ) {
                return String(next);
              }
            }
          }

          if (projectId) return projectId;
        } catch (_) {}
      }

      return null;
    },
  });

  return result;
}

function downloadFmlWithOverlay(tabId, projectId) {
  extractButton.disabled = true;
  chrome.scripting.executeScript({
    target: { tabId },
    args: [projectId, BASE_URL],
    func: (projectId, BASE_URL) => {
      const showInfo = (message, isError = false) => {
        const existing = document.getElementById("fml-extract-overlay");
        if (existing) existing.remove();

        const div = document.createElement("div");
        div.id = "fml-extract-overlay";
        div.style.position = "fixed";
        div.style.top = "20px";
        div.style.right = "20px";
        div.style.zIndex = "99999";
        div.style.padding = "12px 16px";
        div.style.backgroundColor = isError ? "#ff4d4f" : "#4caf50";
        div.style.color = "white";
        div.style.borderRadius = "8px";
        div.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
        div.style.fontSize = "14px";
        div.style.whiteSpace = "pre-line";
        div.textContent = message;

        document.body.appendChild(div);
        setTimeout(() => div.remove(), 6000);
      };

      const url = `${BASE_URL}/${projectId}.fml`;
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = objectUrl;
          a.download = `floorplan-${projectId}.fml`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(objectUrl);
          showInfo("Your floorplan has been downloaded.");
        })
        .catch(() => {
          showInfo("Something went wrong while downloading.", true);
        });
    },
  });
  setTimeout(() => extractButton.disabled = false, 3000);
}

chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
  if (tab && tab.url.includes("funda.nl")) {
    updateStatus("Looking for a floorplan on this page…");

    const projectId = await scanForProjectId(tab.id);

    if (projectId) {
      currentProjectId = projectId;
      extractButton.classList.remove("hidden");
      updateStatus("We found a floorplan! Click below to download it.", "success");
    } else {
      extractButton.classList.add("hidden");
      updateStatus("We couldn't find a floorplan on this page.", "error");
    }
  } else {
    extractButton.classList.add("hidden");
    updateStatus("This tool only works on funda.nl property pages.", "error");
  }

  extractButton.addEventListener("click", () => {
    if (currentProjectId) {
      downloadFmlWithOverlay(tab.id, currentProjectId);
    }
  });
});