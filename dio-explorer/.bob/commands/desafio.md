---
description: Gera um desafio de código aleatório baseado na tecnologia e nível escolhidos
argument-hint: <tecnologia> <nível>
---

Generate a **random practical coding challenge** for the technology **$1** at level **$2**.

The level must be one of: `Iniciante`, `Intermediário` or `Avançado` (accept English equivalents: `Beginner`, `Intermediate`, `Advanced`).

If the level is not provided or invalid, default to `Intermediário`.

Pick **one** challenge at random from a varied pool of challenge types (e.g. algorithm, data structure, API integration, debugging, refactoring, design pattern implementation) relevant to the technology. Make each run feel different — vary the topic even if the same command is called multiple times.

Present the challenge using the following markdown format:

---

# ⚔️ Desafio de Código — {$1}

| Campo      | Valor     |
|------------|-----------|
| Tecnologia | {$1}      |
| Nível      | {$2}      |
| Tipo       | {challenge type, e.g. "Algoritmo", "API REST", "Estrutura de Dados"} |
| XP estimado | {XP reward: 200 for Iniciante, 500 for Intermediário, 1000 for Avançado} |

## 📋 Descrição

Write 3–5 sentences describing the challenge context and the problem the user must solve. Be specific and practical.

## ✅ Requisitos

List 3 to 5 concrete, testable requirements the solution must satisfy (numbered list).

## 💡 Dicas

Provide 2–3 helpful hints without giving away the solution (bulleted list).

## 📊 Critérios de Avaliação

| Critério          | Peso |
|-------------------|------|
| Corretude         | 40%  |
| Legibilidade      | 25%  |
| Performance       | 20%  |
| Boas Práticas     | 15%  |

## 🚀 Para começar

Show a minimal starter code snippet in the appropriate language for $1 (just the skeleton/scaffold, not the solution).

---

> 💡 Ao concluir, use `/certificado <seu nome> $1` para gerar seu certificado de conclusão!
