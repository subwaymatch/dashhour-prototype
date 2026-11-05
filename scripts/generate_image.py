"""Generate one image with OpenAI GPT Image 2.6 (text-to-image): quality "low", transparent background.

Every request uses MODEL at quality "low" with background "transparent" (see "Images" in README.md).
The images already in public/images were made earlier with gpt-image-2.5-sunburst (branch scenes at
1536x1024, opaque; spot illustrations at 1024x1024, transparent) and are not regenerated.

Usage:
    OPENAI_API_KEY=... python3 scripts/generate_image.py <out.png> <WxH> "<prompt>"
"""
import base64
import json
import os
import sys
import urllib.error
import urllib.request

MODEL = "gpt-image-2.6-sunburst"

dst, size, prompt = sys.argv[1:4]

body = json.dumps(
    {
        "model": MODEL,
        "prompt": prompt,
        "quality": "low",
        "size": size,
        "background": "transparent",
        "output_format": "png",
        "n": 1,
    }
).encode()
req = urllib.request.Request(
    "https://api.openai.com/v1/images/generations",
    data=body,
    headers={"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}", "Content-Type": "application/json"},
)
try:
    with urllib.request.urlopen(req, timeout=600) as r:
        data = json.load(r)
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.read().decode()[:2000])
    sys.exit(1)
with open(dst, "wb") as f:
    f.write(base64.b64decode(data["data"][0]["b64_json"]))
print(dst, json.dumps(data.get("usage", {})))
