#!/usr/bin/env python3
"""Inline the woff2 files into source.html and write index.html.

index.html has to be a single self-contained file: it is published as an
Artifact, where a strict CSP blocks font CDNs and any other external request.
Edit source.html, then run this.
"""
import base64
import pathlib
import shutil
import subprocess
import tempfile

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

import datetime

source = (HERE / "source.html").read_text()
# stamp the build so the running copy can be identified at a glance
source = source.replace("/*@BUILD@*/", datetime.datetime.now().strftime("%d %b %H:%M"))
if "/*@FONTS@*/" not in source:
    raise SystemExit("source.html is missing the /*@FONTS@*/ placeholder")

# A syntax error in the inlined script leaves a page that renders its markup and
# then does nothing at all — no error visible unless the console is open. Catch
# it here rather than shipping a build where every section is silently empty.
node = shutil.which("node")
if node:
    start = source.index("<script>") + len("<script>")
    with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8") as fh:
        fh.write(source[start:source.rindex("</script>")])
        fh.flush()
        check = subprocess.run([node, "--check", fh.name], capture_output=True, text=True)
    if check.returncode:
        raise SystemExit("script does not parse:\n" + check.stderr)
else:
    print("note: node not found, skipping the syntax check")

(HERE / "index.html").write_text(source.replace("/*@FONTS@*/", "\n".join(faces)))
print("wrote index.html")
