#!/usr/bin/env python3
"""Like mktest.py, but for app.html (the published page with Glow inside):
unwraps the tracker's IIFE so a browser test can reach S and the functions."""
import sys, pathlib
src = pathlib.Path('app.html').read_text()
out = src.replace("<script>\n(function(){\n'use strict';", "<script>\n/*unwrapped for tests*/", 1)
assert out != src, "IIFE opener not found"
assert out.count("})();\n</script>") == 1
out = out.replace("})();\n</script>", "</script>", 1)
dest = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/app.test.html')
dest.write_text(out)
print("wrote", dest, len(out), "bytes")
