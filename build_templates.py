import json
names = ["pcmso","pgr_nr01","pgr_nr18","pgtr_nr31"]
templates = {n: open(f"templates/{n}.txt", encoding="utf-8").read() for n in names}
out = "window.TEMPLATES = " + json.dumps(templates, ensure_ascii=False) + ";\n"
open("templates.js","w",encoding="utf-8").write(out)
print("templates.js regenerado:", len(out), "bytes")
