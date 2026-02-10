## Inspiration

Simbiont was inspired by the mismatch between how people think creatively and how most AI tools force them to work. Traditional chat-based interfaces fragment ideas across scrolling conversations, making it hard to see relationships, track evolution, or work non-linearly.

Creative work like building a brand, exploring concepts, or shaping strategy is visual, iterative, and spatial. Ideas branch, merge, evolve, and reference each other. Simbiont was created to mirror that mental model by providing a persistent canvas where thinking can live and grow instead of disappearing into chat history.

---

## Gemini 3 Integration

The project leverages all three Gemini 3 models in complementary ways, with each model handling a distinct part of the workflow. Gemini 3 Pro is used for code generation and execution, using Gemini’s built-in code execution tool to run marketing campaign simulations. This allows users to validate their ideas with real, executable code that models campaign performance, optimizes budget allocation, and adjusts timelines based on different inputs and constraints.

Gemini 3 Flash is used for fast, low-latency interactions on the canvas. It interprets user sketches and generates bounding box coordinates that enable precise image placement, while the actual visuals are generated using Gemini 3 Pro Image. Gemini 3 Pro Image is also used for consistent image generation, ensuring visual coherence across assets as ideas evolve on the canvas.

The system makes use of new Gemini 3 features by dynamically adjusting thinking levels within the agent loop. Thinking levels are kept low for quick, responsive interactions and increased when deeper reasoning or higher-quality outputs are required, allowing the experience to remain both fast and deliberate depending on the task.

The Gemini 3 URL context tool is also used to fetch live content, such as real-time data from Google Trends, allowing the canvas to stay informed by current signals rather than static knowledge.

Because Simbiont is a canvas-based application, tool usage is heavy and continuous. The Gemini 3 models excel at following structured tool instructions, which is critical for coordinating code execution, sketch interpretation, image generation, layout updates, and URL-based context fetching. This makes Gemini 3 especially well suited for managing the complex, instruction-driven workflows required by a persistent visual workspace.

---

## What it does

Simbiont is a creative intelligence canvas designed to replace traditional chat-based AI interaction.

Instead of scrolling through conversations, users work inside a persistent visual workspace where ideas remain visible, connected, and contextual. Users begin by placing their own ideas on the canvas, then compare, merge, split, and structure them as their thinking evolves.

Simbiont understands the structure of the workspace itself. It tracks changes over time, maintains context without relying on long chat histories, and allows users to build complex projects without worrying about memory limits or fragmented conversations.

Visuals are first-class citizens. Users can bring in assets, browse resources, or ask Simbiont to generate visuals that fit directly into the workspace. Layouts and styles are flexible, allowing the canvas to adapt to different workflows.

Every step is tracked, enabling users to retrace how ideas evolved. Complexity is managed automatically, context is structured rather than consumed, and tools are introduced only when they are relevant.

---

## How we built it

Simbiont is built with Next.js 13, React Flow, and the AI SDK, and is deployed on Vercel.

At its core, the system is powered by Google Gemini 3, using Gemini 3 Flash, Gemini 3 Pro, and Gemini 3 Pro Image models. The project was built during the 2026 Gemini 3 Hackathon to explore how Gemini 3 can enable persistent, visual-first creative collaboration.

Our original goal was to build an AG-UI based application that would be highly suitable for canvas-driven, AI-powered workflows. However, current libraries in this space are not yet mature.

We explored multiple agent frameworks, libraries, and communication patterns to connect the agent and the UI. Ultimately, we built a custom solution using the AI SDK in TypeScript. This allowed us to tightly control how information flows between the canvas and the agent.

The application maintains state on the frontend and sends it to the agent either on a per-call basis or only when explicitly requested by the agent through tools. This avoided overloading the model with unnecessary UI data while preserving full context when needed.

---

## Challenges we ran into

The biggest challenge was managing shared state between the canvas UI and the AI agent.

Most existing agent and AG-UI libraries assume a tightly coupled environment. Agents would work correctly in the environment they were developed for but break or behave inconsistently in others. Sharing the full UI state with the agent was also impractical, as it quickly became too large and noisy.

We needed a way for the agent and the canvas to communicate selectively, without constantly syncing the entire workspace. Solving this required abandoning off-the-shelf solutions and building a custom state-handling and tool-based communication system.

---

## Accomplishments that we're proud of

We successfully built a fully functional, canvas-based AI application instead of a traditional chat interface.

Simbiont demonstrates that AI does not need to live in a conversation thread. Ideas, visuals, and structure can coexist in a shared spatial environment where context is persistent and visible.

We also built a custom agent-to-UI communication layer that allows complex creative workflows without overwhelming the model or the interface.

---

## What we learned

While building Simbiont, we discovered and explored new Gemini 3 capabilities such as object detection and code execution.

These features enabled us to prototype new creative workflows, including simulations and sketch-to-image generation directly inside the canvas. We learned that Gemini 3 is especially well suited for multi-modal, structured, and visual-first experiences when paired with the right interface.

We also learned that controlling context explicitly is far more powerful than relying on long conversational histories.

---

## What's next for Simbiont

There are endless possibilities ahead.

Simbiont’s AI does not live in a node or a chat window. It lives on the canvas itself. Because of this, the canvas becomes an active thinking space rather than a passive UI.

We plan to continue exploring new creative workflows, deeper simulations, richer visual intelligence, and new ways for ideas to evolve spatially. This is just the beginning, stay tuned.


## Development

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```