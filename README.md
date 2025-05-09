# Funda Floorplan Downloader

A Chrome extension that detects and downloads embedded floorplans (FML files) from real estate listings on [funda.nl](https://www.funda.nl).

---

## 🧱 Features

* Detects embedded Floorplanner project IDs on Funda listing pages
* Displays a simple popup UI
* Lets users download `.fml` files with one click
* Only runs on `funda.nl`
* No tracking, analytics, or data collection

---

## 🛠 Installation (Developer Mode)

1. Download or clone this repository:

   ```bash
   git clone https://github.com/SmerigePaprika/funda-floorplan-downloader.git
   ```

2. Open Chrome and go to:
   `chrome://extensions/`

3. Enable **Developer Mode** (top right)

4. Click **"Load unpacked"** and select the folder containing this repo

5. Visit a property listing on [funda.nl](https://www.funda.nl), then click the extension icon in your browser toolbar to check for a floorplan and download it if available.

---

## 📁 Folder Structure

```
funda-floorplan-downloader
├── background.js
├── content.js
├── icon128.png
├── manifest.json
├── popup.html
├── popup.js
├── README.md
```

---

## 🕵 Privacy

This extension does not collect, store, or transmit any personal data.
All functionality runs locally in the browser. No external APIs or tracking scripts are used.

See the [Privacy Policy](https://gist.github.com/SmerigePaprika/5c3d4f76dec49207a80d5ed8ca47a1ce) for full details.

---

## 📄 License

MIT — free for personal and commercial use.
