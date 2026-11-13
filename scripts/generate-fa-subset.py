import json
import base64
import os
import subprocess

# 1. Icons to include
appendix = """
fa-align-center fa-align-left fa-align-right fa-angles-left fa-angles-right
fa-arrow-left fa-arrow-right fa-arrows-left-right fa-award fa-bolt fa-book-open
fa-bookmark fa-building-columns fa-bullhorn fa-check fa-check-circle
fa-chevron-down fa-chevron-right fa-chevron-up fa-circle-half-stroke fa-circle-notch fa-clock-rotate-left
fa-code fa-cog fa-columns fa-copy fa-dice
fa-dice-d20 fa-download fa-eraser fa-exclamation fa-exclamation-circle
fa-exclamation-triangle fa-eye fa-eye-slash fa-file-alt fa-file-arrow-up
fa-file-download fa-file-export fa-file-upload fa-floppy-disk fa-gamepad
fa-github fa-grip-lines fa-grip-lines-vertical fa-hand-pointer fa-heartbeat
fa-id-card fa-image fa-layer-group fa-minus fa-moon fa-palette fa-pencil
fa-pencil-alt fa-plus fa-print fa-question-circle fa-redo fa-rotate-right fa-save fa-search
fa-shield-alt fa-shield-halved fa-sliders fa-sun fa-tag fa-tags fa-th fa-th-large fa-times
fa-trash fa-trash-alt fa-trash-can fa-triangle-exclamation fa-undo fa-upload
fa-user fa-users fa-wand-magic-sparkles fa-window-maximize fa-xmark
""".split()

# Add rotate-left (FA6 canonical for undo)
appendix.append("fa-rotate-left")

with open("node_modules/@fortawesome/fontawesome-free/metadata/icon-families.json", "r", encoding="utf-8") as f:
    data = json.load(f)

alias_map = {}
for k, v in data.items():
    if "aliases" in v and "names" in v["aliases"]:
        for a in v["aliases"]["names"]:
            alias_map[a] = k

# Separate unicodes by style
solid_unicodes = set()
regular_unicodes = set()
brands_unicodes = set()
icon_to_unicode = {}

for icon_cls in sorted(set(appendix)):
    name = icon_cls.replace("fa-", "")
    canonical = name
    if canonical not in data:
        canonical = alias_map.get(name)
    if not canonical:
        raise ValueError(f"Unknown icon: {name}")
    entry = data[canonical]
    cp = entry["unicode"]
    icon_to_unicode[icon_cls] = cp

    if name == "github":
        brands_unicodes.add(cp)
    elif name in ("bookmark", "question-circle"):
        regular_unicodes.add(cp)
        solid_unicodes.add(cp)
    else:
        solid_unicodes.add(cp)

print(f"Total icon classes: {len(icon_to_unicode)}")
print(f"Solid unicodes: {len(solid_unicodes)}")
print(f"Regular unicodes: {len(regular_unicodes)}")
print(f"Brands unicodes: {len(brands_unicodes)}")

# 2. Subset fonts using pyftsubset
def subset(in_ttf, out_woff2, unicodes):
    u_str = ",".join(f"U+{u.upper()}" for u in unicodes)
    cmd = [
        r".venv\Scripts\pyftsubset.exe",
        in_ttf,
        f"--unicodes={u_str}",
        "--flavor=woff2",
        f"--output-file={out_woff2}"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Failed subsetting {in_ttf}: {res.stderr}")
    print(f"Generated {out_woff2} ({os.path.getsize(out_woff2)} bytes)")

subset("node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.ttf", "fonts/fa-solid-subset.woff2", solid_unicodes)
subset("node_modules/@fortawesome/fontawesome-free/webfonts/fa-regular-400.ttf", "fonts/fa-regular-subset.woff2", regular_unicodes)
subset("node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-400.ttf", "fonts/fa-brands-subset.woff2", brands_unicodes)

# 3. Generate css/fontawesome.css
css_lines = [
    "/* Font Awesome 6.5.1 Subset (Solid, Regular, Brands) */",
    "@font-face {",
    "\tfont-family: 'Font Awesome 6 Free';",
    "\tfont-style: normal;",
    "\tfont-weight: 900;",
    "\tfont-display: block;",
    "\tsrc: url('../fonts/fa-solid-subset.woff2') format('woff2');",
    "}",
    "@font-face {",
    "\tfont-family: 'Font Awesome 6 Free';",
    "\tfont-style: normal;",
    "\tfont-weight: 400;",
    "\tfont-display: block;",
    "\tsrc: url('../fonts/fa-regular-subset.woff2') format('woff2');",
    "}",
    "@font-face {",
    "\tfont-family: 'Font Awesome 6 Brands';",
    "\tfont-style: normal;",
    "\tfont-weight: 400;",
    "\tfont-display: block;",
    "\tsrc: url('../fonts/fa-brands-subset.woff2') format('woff2');",
    "}",
    "",
    ".fa,",
    ".fas,",
    ".far,",
    ".fab {",
    "\t-moz-osx-font-smoothing: grayscale;",
    "\t-webkit-font-smoothing: antialiased;",
    "\tdisplay: var(--fa-display, inline-block);",
    "\tfont-style: normal;",
    "\tfont-variant: normal;",
    "\tline-height: 1;",
    "\ttext-rendering: auto;",
    "}",
    "",
    ".fas {",
    "\tfont-family: 'Font Awesome 6 Free';",
    "\tfont-weight: 900;",
    "}",
    "",
    ".far {",
    "\tfont-family: 'Font Awesome 6 Free';",
    "\tfont-weight: 400;",
    "}",
    "",
    ".fab {",
    "\tfont-family: 'Font Awesome 6 Brands';",
    "\tfont-weight: 400;",
    "}",
    "",
    "/* Icon glyphs */"
]

for icon_cls, cp in sorted(icon_to_unicode.items()):
    css_lines.append(f".{icon_cls}:before {{")
    css_lines.append(f"\tcontent: '\\{cp}';")
    css_lines.append("}")

with open("css/fontawesome.css", "w", encoding="utf-8") as f:
    f.write("\n".join(css_lines) + "\n")

print("Generated css/fontawesome.css successfully")

