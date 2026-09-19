#!/usr/bin/env python3
"""Build a test copy of the page with the IIFE unwrapped, so a browser test can
reach the internals. The shipped page keeps its wrapper; nothing here is
published."""
import re, sys, pathlib
src = pathlib.Path('index.html').read_text()
out = src.replace("<script>\n(function(){\n'use strict';", "<script>\n/*unwrapped for tests*/", 1)
assert out != src, "IIFE opener not found"
n = out.count("})();\n</script>")
assert n == 1, f"expected one IIFE closer, found {n}"
out = out.replace("})();\n</script>", "</script>", 1)
dest = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/cb71.test.html')
dest.write_text(out)
print("wrote", dest, len(out), "bytes")
