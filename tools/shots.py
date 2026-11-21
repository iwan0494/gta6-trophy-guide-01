"""Leonida Ledger R3 screenshot runner (fresh): serves app/, seeds 9 earned
trophies, captures the 4 judging shots at 1280x800 JPEG q82."""
import json
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "app"
SHOTS = ROOT / "screenshots"
PORT = 8123
SEED = [2, 3, 8, 9, 20, 28, 35, 42, 44]

def main():
    from playwright.sync_api import sync_playwright

    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT), "--directory", str(APP)],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={"width": 1280, "height": 800})
            page.goto(f"http://127.0.0.1:{PORT}/", wait_until="networkidle")
            page.evaluate(
                "ids => localStorage.setItem('leonida-ledger-v3', JSON.stringify({earned: ids}))",
                SEED,
            )
            page.reload(wait_until="networkidle")
            page.wait_for_timeout(600)
            # 1: checklist, detail open on the missable trophy (default selection)
            page.screenshot(path=str(SHOTS / "1-checklist.jpg"), type="jpeg", quality=82)
            # 2: roadmap
            page.click("button.tab[data-view='roadmap']")
            page.wait_for_timeout(400)
            page.screenshot(path=str(SHOTS / "2-roadmap.jpg"), type="jpeg", quality=82)
            # 3: Leonida map
            page.click("button.tab[data-view='map']")
            page.wait_for_timeout(400)
            page.screenshot(path=str(SHOTS / "3-missables.jpg"), type="jpeg", quality=82)
            # 4: back to checklist, earn trophy 4 and catch the toast + new count
            page.click("button.tab[data-view='checklist']")
            page.wait_for_timeout(400)
            page.click("button[data-trophy-id='4'] input[type='checkbox']")
            page.wait_for_timeout(500)
            page.screenshot(path=str(SHOTS / "4-detail.jpg"), type="jpeg", quality=82)
            browser.close()
    finally:
        server.terminate()
    for name in ["1-checklist.jpg", "2-roadmap.jpg", "3-missables.jpg", "4-detail.jpg"]:
        f = SHOTS / name
        print(name, f.stat().st_size, "bytes", "OK" if f.stat().st_size <= 262144 else "TOO BIG")

if __name__ == "__main__":
    main()
