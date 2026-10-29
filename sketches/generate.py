"""Redraw a photographed notepad UI sketch as a clean, text-free pen sketch with OpenAI GPT Image 2.5.

Sends the photo to the Images edit endpoint with quality "low" and a transparent background.
The sketches in this folder were made with gpt-image-2.5-sunburst.

Usage:
    OPENAI_API_KEY=... python3 generate.py <model> <photo.png> <out.png> <WxH> "<what the screen shows>"
"""
import base64
import json
import os
import sys
import urllib.request
import uuid

model, src, dst, size, screen = sys.argv[1:6]

PROMPT = f"""Redraw the mobile app UI sketch from this photo of a notepad as a clean, pen-drawn sketch.

What the photo shows: {screen}

Requirements:
- Keep the same screen layout, boxes, dividers, icons, map lines, chart shapes, rings and proportions as the original sketch.
- Absolutely NO text of any kind: no letters, no words, no numbers, no Korean or English characters, no handwriting, no labels, no logos with lettering. Wherever the original has writing inside the UI, draw a few short, loose horizontal pen strokes as a placeholder instead.
- Remove everything that is not the UI screen itself: the yellow notepad paper, ruled blue lines, red margin line, shadows, the page title, the side annotations, annotation arrows and brackets.
- Draw only the UI screen(s) with a black ink pen: confident hand-drawn line work, slightly imperfect strokes, a little ink weight variation, hatching where the original uses hatching. Single ink color, no grey fills, no colour.
- Background must be fully transparent. No paper texture, no frame, no drop shadow.
"""

boundary = uuid.uuid4().hex
fields = {
    "model": model,
    "prompt": PROMPT,
    "quality": "low",
    "background": "transparent",
    "output_format": "png",
    "size": size,
    "n": "1",
}
body = b""
for k, v in fields.items():
    body += f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
with open(src, "rb") as f:
    img = f.read()
body += (
    f'--{boundary}\r\nContent-Disposition: form-data; name="image[]"; filename="{os.path.basename(src)}"\r\n'
    "Content-Type: image/png\r\n\r\n"
).encode() + img + b"\r\n"
body += f"--{boundary}--\r\n".encode()

req = urllib.request.Request(
    "https://api.openai.com/v1/images/edits",
    data=body,
    headers={
        "Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}",
        "Content-Type": f"multipart/form-data; boundary={boundary}",
    },
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
