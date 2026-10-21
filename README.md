# TerraSim — Autonomous Civilization

A standalone browser-based civilization simulation with 50 simulated agents on a 16×16 tile world. Agents change roles in response to food, materials, housing, and knowledge needs. The simulation builds farms, homes, roads, workshops, and civic buildings.

## Run locally
- Requires Node.js 20+
- Run \`npm start\`
- Open \`http://localhost:3000\`

## Deploy on Render
Create a **new Web Service** using only this repository: \`https://github.com/maazxhasan-hue/terrasim-autonomous-city\`.
- Runtime: Node
- Build command: leave blank
- Start command: \`npm start\`
- Region: Singapore
- Plan: Free

## Optional AI planning
Set these as private Render environment variables (never commit secrets):
- \`AI_API_KEY\` — secret API key from your provider
- \`AI_BASE_URL\` — optional; defaults to \`https://api.openai.com/v1\`
- \`AI_MODEL\` — optional; defaults to \`gpt-4.1-mini\`

Without a key, the app still runs its built-in simulation and honestly reports that model-based planning is not connected.

## Boundaries
This is a game simulation, not a real-world autonomous agent. Agent roles and city growth use heuristic rules, not 50 independent human-level AI minds. No payment integration, UPI transfers, trading, or external-world actions are enabled.

**Project separation:** TerraSim must stay separate from Trading Agent and TradingLab03.
