---
name: user-research-animations
description: >
  Analyze web animations and interactions from a technical perspective. Use this skill whenever the
  user shares a URL and asks about animations, says "analyze this site's animations", "find out what
  technologies are being used", "describe the animations in words", "explain the motion", "how is
  this animation built", "what CSS/JS drives this", "how to implement this motion", or "study the
  animations on this site". Also use when researching animation techniques, CSS animation patterns,
  scroll-driven animations, GSAP, Three.js, or WebGL effects. Provides implementation approach,
  tech stack identification, and UX evaluation.
---

# Web Animation Analysis Skill

## Role

Act as a frontend engineer and motion designer. Analyze website animations and interactions using precise, technical language. Provide comprehensive analysis that includes technical background, UX perspective, and implementation examples.

---

## Objective

Describe website animations not as vague impressions, but in technical and quantitative terms. This supports planning implementation approaches and aligning understanding between designers and engineers. Use this for studying competitor sites, learning implementations, and making technology decisions.

---

## Iron Law

1. Do not guess at technology without checking the actual DOM.

## Input

Accept any of the following:

1. **Website URL**
2. **Screen capture video**
3. **Code snippet** (HTML/CSS/JavaScript)
4. **Verbal description of an animation**

---

## Output Format

### 1. Animation Description

Break down the animation or interaction using the following elements:

#### Trigger

What causes the motion to occur.

**Examples:**
- Scroll (Y axis)
- Hover
- Click
- Page load
- Timer (after 3 seconds)
- IntersectionObserver (when element enters the viewport)

#### Property Changes

What changes and how.

**Examples:**
- `opacity: 0 → 1` (fade in)
- `transform: translateY(50px) → 0` (slide from bottom to top)
- `transform: scale(1) → 1.1` (enlarge on hover)
- `background-position: 0% 0% → 100% 100%` (gradient movement)

#### Easing

The quality and feel of the motion.

**Examples:**
- `ease-out`: starts fast, ends slow
- `cubic-bezier(0.34, 1.56, 0.64, 1)`: overshoot (goes past the target, then returns)
- `linear`: constant speed
- `spring`: physics-based spring effect

#### Timing

Duration and delay of the motion.

**Examples:**
- `duration: 600ms`
- `delay: 200ms`
- `stagger: 100ms` (multiple elements in sequence)

#### Physical Behavior (optional)

Physics simulations such as inertia, friction, and rebound.

**Examples:**
- Inertia scrolling (continues a bit after scrolling stops)
- Parallax (creates a sense of depth)
- Spring animation (oscillates and settles)

---

### 2. Tech Stack Inference

List the libraries and technologies that appear to be in use.

#### Candidate List

| Technology | Use | Characteristics |
|------|------|------|
| **CSS Animations** | Basic animations | High performance, GPU acceleration |
| **CSS Transitions** | Hover, state changes | Simple, declarative |
| **GSAP** | Complex timelines, scroll-linked | High performance, fine-grained control |
| **Framer Motion** | React animations | Declarative API, gesture support |
| **Three.js** | 3D, WebGL | 3D objects, shaders |
| **Lottie** | Adobe After Effects animations | Vector animations, lightweight |
| **Lenis / Locomotive Scroll** | Smooth scrolling | Inertia scrolling, parallax |
| **Scroll-driven Animations** | Scroll-linked (native) | CSS only, high performance |
| **View Transitions API** | Page transition animations | Native API, SPA support |

#### Basis for Inference

- **Smooth 60FPS**: CSS Animations or GSAP
- **Multiple elements in sequence**: GSAP TimelineMax
- **3D rotation, parallax effects**: Three.js
- **Scroll-linked step changes**: Scroll-driven Animations or Lenis
- **Morphing during page transitions**: View Transitions API

**Important:** When you cannot check the code directly, always state that this is an inference.

---

### 3. UX / UI Evaluation

Consider the impact the animations have on the user experience.

#### Evaluation Points

**Visual guidance:**
- Does it direct the user's attention to important elements?
- Does it visually express the information hierarchy?

**Feedback:**
- Is there immediate feedback for user actions?
- Does it communicate loading states clearly?

**Performance:**
- Is 60FPS maintained?
- Does it use GPU acceleration (`transform`, `opacity`)?
- Does it avoid Reflow / Repaint?

**Accessibility:**
- Does it support `prefers-reduced-motion`?
- Is there too much animation that could cause discomfort?

**Brand expression:**
- Does it communicate the brand's personality and tone?
- Does excessive decoration get in the way of the content?

---

### 4. Code Example

Provide a code sample for reference based on the inferred tech stack.

**Example (GSAP scroll-linked):**

```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

gsap.to('.hero-image', {
  y: 200,
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true, // sync with scroll
  },
});
```

**Example (CSS Scroll-driven Animations):**

```css
.element {
  animation: fade-in linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 50%;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Execution Flow

### Step 1: Receive and check input

- **URL**: Use `mcp__plugin_playwright_playwright__browser_snapshot` to fetch and analyze the page.
- **Video**: Observe changes frame by frame.
- **Code**: Analyze the source code directly.

### Step 2: Break down the motion

Identify and describe the trigger, property changes, easing, and timing.

### Step 3: Infer the tech stack

List the libraries and APIs that may be in use. Explain the basis for each inference.

### Step 4: UX evaluation

Evaluate from the perspective of visual guidance, feedback, performance, and accessibility.

### Step 5: Provide a code example

Generate a sample code for reference based on the inferred tech stack.

---

## Guidelines

### Use technical terms actively

**Good:**

```
The element enters from `translateY(100px)` below the screen
and settles into position while decelerating slowly,
using a `cubic-bezier(0.16, 1, 0.3, 1)` easing.
```

**Bad:**

```
The element kind of floats up from below.
```

### State when something is an inference

When you cannot check the code directly, clearly note that it is an inference.

**Good:**

```
Based on the smooth scrolling behavior, it is inferred that
Lenis or Locomotive Scroll is being used.
However, the source code needs to be verified.
```

**Bad:**

```
Lenis is being used.
```

### Use quantitative expressions

Instead of "fast" or "slow", use specific numbers.

**Good:**

```
duration: 400ms
delay: 100ms
```

**Bad:**

```
A somewhat fast animation.
```

---

## Practical Example

### Input

```
URL: https://example-animation-site.com
```

### Output

**Animation description:**

The hero section image fades in from `opacity: 0` to `opacity: 1` on page load. At the same time, it shrinks from `transform: scale(1.1)` to `scale(1)`, creating a zoom-out effect. With a `duration: 1200ms` and `cubic-bezier(0.16, 1, 0.3, 1)` easing, it gives a calm and relaxed impression.

On scroll, the background image moves to `translateY(-30%)` via a parallax effect. It moves at a different speed from the foreground text, creating a sense of depth.

The CTA button enlarges to `scale(1.05)` on hover. The `box-shadow` changes from `0 4px 10px rgba(0,0,0,0.1)` to `0 8px 20px rgba(0,0,0,0.2)`, expressing a floating effect.

**Tech stack inference:**

- **GSAP + ScrollTrigger**: Inferred from the scroll-linked parallax effect.
- **CSS Transitions**: Button enlarge and shadow change on hover.
- **Intersection Observer**: Controls the fade-in of elements that enter the viewport.

**UX / UI evaluation:**

Visual guidance is good. The hero section zoom-out effect directs the user's attention to the center of the content. The parallax creates a sense of depth and adds visual appeal.

However, the animation `duration` of 1200ms is somewhat long, which may increase the time before the initial view on page load. Also, there appears to be no support for `prefers-reduced-motion`, which leaves room for improvement from an accessibility perspective.

Performance is estimated to be good, as only `transform` and `opacity` are used, making GPU acceleration effective.

**Code example:**

```javascript
// Parallax with GSAP + ScrollTrigger
gsap.to('.hero-bg', {
  yPercent: -30,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  },
});

// CSS button hover effect
.cta-button {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.3s ease;
}

.cta-button:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}
```

---

## Constraints

- Use technical terms actively.
- Always state when something is an inference.
- Prefer quantitative expressions (ms, px, %).
- Keep UX evaluations objective.

