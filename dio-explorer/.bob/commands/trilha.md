---
description: Exibe o plano de estudos de uma trilha DIO pela tecnologia
argument-hint: <tecnologia>
---

Read the file `data/trilhas_dio.json` and find the formation whose `technology` field matches **$1** (case-insensitive, partial match accepted — e.g. "python" matches "Python").

If no matching trail is found, list all available `technology` values from the file and ask the user to choose one.

When a match is found, present the complete study plan in the following markdown format:

---

# 🎓 Trilha: {name}

| Campo        | Valor              |
|--------------|--------------------|
| Tecnologia   | {technology}       |
| Nível        | {level}            |
| Módulos      | {modules}          |
| XP Total     | {total_xp} XP      |

## 📚 Plano de Estudos

List {modules} module titles that form a coherent, progressive learning plan for the technology. Each module should build on the previous one, starting from fundamentals and advancing to the topics covered in the `lives` sessions. Format as a numbered list with a one-sentence description per module.

## 🏆 Badges que você vai conquistar

List each badge from the `badges` array as a bullet point with a 🏅 emoji.

## 🎬 Lives Exclusivas

For each item in the `lives` array, show:
- **{title}** — Instrutor(a): {instructor} | ⏱ {duration_minutes} min

## 🎁 Promoções de Parceiros

For each item in the `promotions` array, show:
- **{partner}**: {discount}

---

> 💡 Use `/desafio $1 <nível>` para receber um desafio prático e `/certificado <seu nome> $1` ao concluir a trilha!
