# Component Architecture — Code Examples

## SectionWrapper Component with Slot Placeholder

```js
const comp = figma.createComponent();
comp.name = 'SectionWrapper';
comp.layoutMode = 'VERTICAL';
comp.primaryAxisSizingMode = 'AUTO';
comp.counterAxisSizingMode = 'FIXED';
comp.resize(1440, 100);
comp.itemSpacing = 48;
comp.paddingTop = 96; comp.paddingBottom = 96;
comp.counterAxisAlignItems = 'CENTER';

// Slot placeholder (user converts this to a real slot via ⌘⇧S)
const slotFrame = figma.createFrame();
slotFrame.name = '[SLOT] body'; // naming convention: [SLOT] prefix
slotFrame.layoutMode = 'VERTICAL';
slotFrame.primaryAxisSizingMode = 'AUTO';
slotFrame.counterAxisSizingMode = 'FIXED';
slotFrame.resize(1200, 100);
slotFrame.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 1 }, opacity: 0.1 }];
comp.appendChild(slotFrame);
slotFrame.layoutSizingHorizontal = 'FILL'; // set AFTER appendChild
```

## Adding Content to a Slot (confirmed working)

```js
// 1. Find the component
const comp = page.findOne(n => n.name === 'DM/Common/SectionWrapper' && n.type === 'COMPONENT');

// 2. Create an instance
const instance = comp.createInstance();
targetPage.appendChild(instance);

// 3. Find the slot in the instance
const slot = instance.children.find(c => c.type === 'SLOT');

// 4. Append content to the slot
const myContent = figma.createFrame();
// ... build content ...
slot.appendChild(myContent);
```

## Component Naming Convention

```
{project}/{category}/{name}/{variant}

Examples:
  DM/Common/SectionWrapper/Default
  DM/Common/Button/Primary
  DM/Common/Button/Secondary
  DM/Navigation/Header/PC
  DM/Navigation/Header/SP
```

## Slot Detection After User Conversion

```js
const slotFrame = comp.children.find(c => c.name.includes('[SLOT]'));
// After conversion: slotFrame.type === 'SLOT'  ✅
// Before conversion: slotFrame.type === 'FRAME' ❌
```

## Cross-page Instance Limitation

`importComponentByKeyAsync` fails for same-file components (not in a published library).
Workaround: build page content directly with the same Auto Layout helper functions.
