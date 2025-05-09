(function () {
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
  
    const flatten = (arr) => arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);
    const scripts = document.querySelectorAll("script[type='application/json']");
  
    let foundProjectId = null;
    for (const script of scripts) {
      try {
        const json = JSON.parse(script.textContent.replace(/^\uFEFF/, ''));
        foundProjectId = findProjectId(json);
        if (!foundProjectId && Array.isArray(json)) {
          const data = flatten(json);
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
              foundProjectId = String(next);
              break;
            }
          }
        }
        if (foundProjectId) break;
      } catch (_) {}
    }
  
    if (foundProjectId) {
      chrome.runtime.sendMessage({ type: "floorplan-found" });
    }
  })();
  