---
description: Gera um certificado de conclusão de trilha para o usuário
argument-hint: <seu nome> <tecnologia>
---

Read the file `data/trilhas_dio.json` and find the formation whose `technology` field matches **$2** (case-insensitive, partial match accepted).

If no matching trail is found, list all available `technology` values from the file and ask the user to choose one.

When a match is found, generate a **dummy completion certificate** using the following exact markdown format. Replace all placeholders with real values from the JSON and from the arguments:

---

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║                   🎓  DIO — Digital Innovation One                   ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║                   CERTIFICADO DE CONCLUSÃO                           ║
║                                                                      ║
║  Certificamos que                                                     ║
║                                                                      ║
║              ★  {$1}  ★                                              ║
║                                                                      ║
║  concluiu com êxito a trilha de aprendizagem                         ║
║                                                                      ║
║        {formation name from JSON}                                    ║
║                                                                      ║
║  Tecnologia : {technology}                                           ║
║  Nível      : {level}                                                ║
║  Módulos    : {modules} módulos concluídos                           ║
║  XP obtido  : {total_xp} XP                                          ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Badges conquistados:                                                ║
║  {list each badge from the badges array, one per line, with 🏅}     ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Data de emissão : {today's date in DD/MM/YYYY format}               ║
║  Código          : DIO-{formation id padded to 4 digits}-{$1 initials uppercase}-{random 6-digit hex} ║
║                                                                      ║
║        "A jornada de mil milhas começa com um único passo."          ║
║                                  — Lao Tsé                           ║
║                                                                      ║
║                    ✅  Documento válido para portfólio               ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

After the certificate block, add the following section:

## 🚀 Próximos passos

Suggest 3 concrete next steps the learner can take after completing this trail (e.g., related advanced trail from the JSON, a real project idea, a certification to pursue). Use a numbered list.

## 🎁 Suas promoções de parceiro

List the promotions from the `promotions` array of the matched formation as bullet points.

---

> 💡 Compartilhe seu certificado no LinkedIn e mostre ao mundo sua conquista! 🌟
