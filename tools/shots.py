# Leonida Ledger R2 — regenerate the 4 entry screenshots (1280x800, JPEG q82).
# Run with the app served locally (node serve.ts --port 8080), from the repo root:
#   python3 tools/shots.py
import json, os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "http://localhost:8080"
OUT = os.path.join(ROOT, "screenshots")
os.makedirs(OUT, exist_ok=True)

trophies = json.load(open(os.path.join(ROOT, "app/data/trophies.json")))["trophies"]
# an early unearned trophy for the "just earned" action shot (demo seed earns 2,3,8,10,15,21,35,44,46)
ACTION_ID = next(t["id"] for t in trophies if t["id"] not in (2, 3, 8, 10, 15, 21, 35, 44, 46) and t["id"] > 3)
ACTION_NAME = next(t["name"] for t in trophies if t["id"] == ACTION_ID)
print("action trophy:", ACTION_ID, ACTION_NAME)

def shot(page, url, name):
    page.goto(url, wait_until="networkidle")
    page.wait_for_timeout(400)
    page.evaluate("window.scrollTo(0,0)")
    page.wait_for_timeout(150)
    path = os.path.join(OUT, name)
    page.screenshot(path=path, type="jpeg", quality=82)
    print(name, os.path.getsize(path), "bytes")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    # 1 — cover: checklist, a short guide open with its sources visible
    shot(page, f"{BASE}/?seed=demo&trophy=2", "1-checklist.jpg")
    # 2 — roadmap to platinum
    shot(page, f"{BASE}/?view=roadmap&seed=demo", "2-roadmap.jpg")
    # 3 — missables + hand-drawn Leonida map
    shot(page, f"{BASE}/?view=missables&seed=demo", "3-missables.jpg")
    # 4 — tracker in action: check a trophy, counter rises, toast + highlight show
    page.goto(f"{BASE}/?seed=demo", wait_until="networkidle")
    page.wait_for_timeout(400)
    page.evaluate("window.scrollTo(0,0)")
    row = page.locator("button.trophy-row", has_text=ACTION_NAME).first
    row.locator("input[type=checkbox]").click()
    page.wait_for_timeout(500)
    path = os.path.join(OUT, "4-detail.jpg")
    page.screenshot(path=path, type="jpeg", quality=82)
    print("4-detail.jpg", os.path.getsize(path), "bytes")
    browser.close()
print("done")
