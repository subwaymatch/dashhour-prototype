"""Generate one image with OpenAI GPT Image 2.5 (text-to-image) at quality "low".

The images in public/images were made with gpt-image-2.5-sunburst: branch scenes at 1536x1024 (opaque)
and spot illustrations at 1024x1024 (transparent), then converted to WebP.

Usage:
    OPENAI_API_KEY=... python3 scripts/generate_image.py <model> <out.png> <WxH> <transparent|opaque> "<prompt>"
"""
import base64
import json
import os
import sys
import urllib.error
import urllib.request

model, dst, size, background, prompt = sys.argv[1:6]

body = json.dumps(
    {
        "model": model,
        "prompt": prompt,
        "quality": "low",
        "size": size,
        "background": background,
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
