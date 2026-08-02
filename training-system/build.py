#!/usr/bin/env python3
"""Inline the woff2 files into source.html and write index.html.

index.html has to be a single self-contained file: it is published as an
Artifact, where a strict CSP blocks font CDNs and any other external request.
Edit source.html, then run this.
"""
import base64
import pathlib

HERE = pathlib.Path(__file__).parent
FACES = [
    ("Bebas Neue", "400", "BebasNeue-400.woff2"),
    ("IBM Plex Mono", "400", "IBMPlexMono-400.woff2"),
    ("IBM Plex Mono", "600", "IBMPlexMono-600.woff2"),
    ("Inter", "100 900", "Inter-400.woff2"),  # variable font, one file covers every weight
]

faces = []
for family, weight, filename in FACES:
    b64 = base64.b64encode((HERE / filename).read_bytes()).decode()
    faces.append(
        "@font-face{font-family:'%s';font-style:normal;font-weight:%s;"
        "font-display:swap;src:url(data:font/woff2;base64,%s) format('woff2')}"
        % (family, weight, b64)
    )

source = (HERE / "source.html").read_text()
if "/*@FONTS@*/" not in source:
    raise SystemExit("source.html is missing the /*@FONTS@*/ placeholder")
(HERE / "index.html").write_text(source.replace("/*@FONTS@*/", "\n".join(faces)))
print("wrote index.html")
