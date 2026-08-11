# Kent Nakai Website - Agent Context

## Main objective

Show credible evidence that Kent has strong research and problem-solving skills.

Do this through the robotics work itself: what Kent built, what was difficult, how he investigated it, what he changed, and what evidence showed that the change worked. The site is not a place to brag or make unsupported claims.

Assume a visitor already heard that Kent earned high placements in international competitive robotics. Their question is now: **How does he think and solve problems?**

## Visitor journey

1. Understand what the robot does and the main problem within a few seconds.
2. See real evidence: the robot, field runs, diagrams, tests, and outcomes.
3. Follow the reasoning in order: observation -> ruled-out causes -> comparison -> finding -> change -> validation.
4. Open the robot page when they want more technical depth.

Use progressive disclosure. The home page tells the clearest research story; detail pages support it without overwhelming the first visit.

## Page roles

- `index.html`: the main **What + How** story. Lead with the problem-solving process and enough evidence to make it believable.
- `robot.html`: a deeper explanation of the robot: mechanics, electronics, software, diagrams, and supporting decisions. Avoid turning it into a list of specifications.
- `simple.css`: the active shared visual system for the home and robot pages.
- `index.archive.html`, `styles.css`, and `script.js`: older design work. Do not use or edit them unless the task explicitly asks to restore something from that version.

## Writing

- Write in a clear, human, first-person voice.
- Prefer short sentences, concrete details, and plain words.
- Explain technical terms only when a general technical reader may need them.
- Put evidence before conclusions. Show the test, comparison, or observation behind a claim.
- Describe setbacks and ruled-out ideas when they reveal useful reasoning.
- Never invent a result, number, award, role, or technical contribution.
- Avoid resume language and hype such as "groundbreaking," "world-class," or "exceptional." Let the work demonstrate ability.
- Keep UI labels and agent handoff explanations short and direct.

## Visual direction

The reference mood is warm, calm, natural, and editorial: cream, olive green, wood tones, generous space, and honest materials.

- Burnt orange is welcome as a small accent because it connects to the robot.
- Use orange for focus, actions, or small markers, not as a dominant background.
- Avoid glossy startup styling, dark sci-fi themes, neon colors, and crowded dashboards.
- Let images and diagrams carry evidence, but always give them a clear purpose and caption.
- Prefer subtle motion. Respect `prefers-reduced-motion`.

## Experience rules

- Design from the visitor's reading order, not from a list of available content.
- Keep one main idea per section and make the next step obvious.
- Make the page understandable without requiring the videos to play.
- Preserve semantic HTML, keyboard access, useful alt text, readable contrast, and mobile layouts.
- Do not add decoration that competes with the research story.

## Before finishing a change

- Can a new visitor quickly say what Kent built and why it was hard?
- Does each important claim have visible evidence or a clear explanation?
- Is the reasoning easy to follow in order?
- Does the robot detail page add depth instead of repeating the home page?
- Is the next action clear on desktop and mobile?
- Did you verify the affected links, media, keyboard behavior, and responsive layout?
