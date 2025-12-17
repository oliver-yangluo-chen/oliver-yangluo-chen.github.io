#!/usr/bin/env python3
import os, json, re, requests
from datetime import datetime, timezone

COURSE_ID = os.getenv("COURSE_ID", "7384785")
ED_WEB_COURSE_ID = os.getenv("ED_WEB_COURSE_ID", "84647")
ED_API_TOKEN = os.getenv("ED_API_TOKEN")

TITLE_RE = re.compile(r"special\s+participation\s+a\s*:", re.I)
BASE = "https://us.edstem.org/api"

def iso():
    return datetime.now(timezone.utc).isoformat()

def headers():
    return {"Authorization": f"Bearer {ED_API_TOKEN}"}

def get(url, **params):
    r = requests.get(url, headers=headers(), params=params, timeout=30)
    r.raise_for_status()
    return r.json()

def main():
    if not ED_API_TOKEN:
        raise SystemExit("Missing ED_API_TOKEN")

    posts = []
    offset = 0
    limit = 50

    while True:
        page = get(f"{BASE}/courses/{COURSE_ID}/threads", limit=limit, offset=offset)
        threads = page.get("threads", [])
        if not threads:
            break

        for t in threads:
            title = t.get("title","")
            if not TITLE_RE.search(title):
                continue

            tid = t["id"]
            full = get(f"{BASE}/threads/{tid}")

            user = full.get("user", {})
            body = full.get("body","") or re.sub("<[^>]+>"," ",full.get("content",""))

            posts.append({
                "id": f"ed-{tid}",
                "category": "A",
                "title": title,
                "student_name": user.get("name","Unknown"),
                "created_at": full.get("created_at"),
                "body_text": body.strip(),
                "ed_url": f"https://edstem.org/us/courses/{ED_WEB_COURSE_ID}/discussion/{tid}"
            })

        offset += limit
        if offset >= page.get("total", 1e9):
            break

    with open("data/posts.json","w",encoding="utf-8") as f:
        json.dump({"generated_at": iso(), "posts": posts}, f, indent=2)

    print(f"Wrote {len(posts)} posts")

if __name__ == "__main__":
    main()
