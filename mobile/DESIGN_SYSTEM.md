# 🎨 GLOSSY Design System

## Overview

GLOSSY features a modern, inclusive design with soft green tones, warm accents, and full dark mode support. The design is optimized for broad appeal while maintaining a professional, trustworthy aesthetic.

---

## 🌈 Color Palette

### Primary Colors (Soft Green - Mint/Sage)

Our primary color is a **soft, welcoming green** that conveys freshness, growth, and trust.

| Shade | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| **Primary** | `#22c55e` | `#4ade80` | Main brand color, primary buttons, key elements |
| **Primary Light** | `#bbf7d0` | `#86efac` | Backgrounds, subtle highlights |
| **Primary Dark** | `#15803d` | `#16a34a` | Icons, hover states, emphasis |

**Tailwind Classes:**
```tsx
className="bg-primary-500"      // Primary background
className="text-primary-500"    // Primary text
className="border-primary-500"  // Primary border
```

### Accent Colors (Soft Pink/Coral)

Used sparingly for **status indicators, warnings, and calls-to-attention**.

| Shade | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| **Accent** | `#ef4444` | `#f87171` | Error states, important alerts |
| **Accent Light** | `#fecaca` | `#fca5a5` | Error backgrounds |

### Warm Accent (Muted Yellow/Peach)

Adds **warmth and energy** to the interface.

| Shade | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| **Warm** | `#f59e0b` | `#fbbf24` | Warnings, highlights, badges |
| **Warm Light** | `#fde68a` | `#fcd34d` | Warm backgrounds |

### Neutral Colors

**Light Mode:**
- Background: `#ffffff`
- Surface: `#f8fafc`
- Card: `#ffffff`
- Border: `#e2e8f0`

**Dark Mode:**
- Background: `#0f172a` (slate-900)
- Surface: `#1e293b` (slate-800)
- Card: `#334155` (slate-700)
- Border: `#475569` (slate-600)

### Text Colors

| Type | Light Mode | Dark Mode |
|------|------------|-----------|
| **Primary Text** | `#0f172a` | `#f1f5f9` |
| **Secondary Text** | `#64748b` | `#cbd5e1` |
| **Muted Text** | `#94a3b8` | `#94a3b8` |

---

## 🔤 Typography

### Font Families

**Poppins** - Headlines, buttons, emphasis
- Friendly, modern, and professional
- Slightly rounded for approachability
- Used for: Headings, buttons, important text

**Nunito** - Body text, descriptions
- Warm and readable
- Excellent legibility at all sizes
- Used for: Paragraphs, captions, secondary text

### Font Usage

```tsx
// Headlines
<Text style={{ fontFamily: 'Poppins', fontWeight: 'bold' }}>
  Heading Text
</Text>

// Body text
<Text style={{ fontFamily: 'Nunito' }}>
  Body text goes here
</Text>
```

### Font Sizes

| Size | Value | Usage |
|------|-------|-------|
| `text-xs` | 10px | Small labels, captions |
| `text-sm` | 12px | Secondary text, metadata |
| `text-base` | 14px | Body text (default) |
| `text-lg` | 18px | Large body text, subheadings |
| `text-xl` | 20px | Small headings |
| `text-2xl` | 24px | Medium headings |
| `text-3xl` | 32px | Large headings |
| `text-4xl` | 40px | Extra large headings |
| `text-5xl` | 48px | Hero text |

### Font Weights

- **Light**: 300 - Subtle emphasis
- **Regular**: 400 - Body text (default)
- **Medium**: 500 - Slightly emphasized
- **Semibold**: 600 - Buttons, labels
- **Bold**: 700 - Headings, emphasis

---

## 🌓 Dark Mode

### Enabling Dark Mode

Users can toggle dark mode via:
1. **Settings button** (moon/sun icon in top-right)
2. **System preference** (optional auto-detection)

### Implementation

```tsx
import { useTheme } from '../utils/theme';

function MyComponent() {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>
        This text adapts to dark mode!
      </Text>
      
      <Pressable onPress={toggleDarkMode}>
        <Text style={{ color: colors.primary }}>
          Toggle Dark Mode
        </Text>
      </Pressable>
    </View>
  );
}
```

### Color Variables

The `useTheme()` hook provides:

```typescript
const { colors } = useTheme();

colors.background      // Main background
colors.surface         // Card/surface background
colors.card            // Card background
colors.primary         // Primary brand color
colors.primaryLight    // Light primary
colors.primaryDark     // Dark primary
colors.accent          // Accent color (pink/coral)
colors.accentLight     // Light accent
colors.warm            // Warm accent (yellow/peach)
colors.warmLight       // Light warm
colors.text            // Primary text
colors.textSecondary   // Secondary text
colors.textMuted       // Muted/disabled text
colors.border          // Border color
colors.borderLight     // Subtle borders
colors.success         // Success states
colors.error           // Error states
colors.warning         // Warning states
colors.info            // Info states
```

---

## 🎯 Component Patterns

### Buttons

**Primary Button:**
```tsx
<Pressable
  className="py-4 px-6 rounded-2xl active:opacity-80"
  style={{ backgroundColor: colors.primary }}
>
  <Text 
    className="text-white text-center text-lg font-semibold"
    style={{ fontFamily: 'Poppins' }}
  >
    Get Started
  </Text>
</Pressable>
```

**Secondary Button:**
```tsx
<Pressable
  className="py-4 px-6 rounded-2xl active:opacity-80"
  style={{ backgroundColor: colors.surface }}
>
  <Text 
    className="text-center text-lg font-semibold"
    style={{ color: colors.text, fontFamily: 'Poppins' }}
  >
    Learn More
  </Text>
</Pressable>
```

### Cards

```tsx
<View 
  className="rounded-2xl p-6 mb-4"
  style={{ backgroundColor: colors.card, borderColor: colors.border }}
>
  <Text style={{ color: colors.text, fontFamily: 'Poppins', fontWeight: 'bold' }}>
    Card Title
  </Text>
  <Text style={{ color: colors.textSecondary, fontFamily: 'Nunito' }}>
    Card description text
  </Text>
</View>
```

### Icons with Background

```tsx
<View 
  className="rounded-full p-3"
  style={{ backgroundColor: colors.primaryLight }}
>
  <Ionicons name="checkmark" size={24} color={colors.primaryDark} />
</View>
```

---

## 🎨 Design Principles

### 1. Inclusivity First
- **Soft greens** appeal to all demographics
- **Warm accents** add approachability
- **High contrast** ensures accessibility
- **Clear typography** for easy reading

### 2. Modern & Professional
- **Rounded corners** (8-24px) for friendliness
- **Ample whitespace** for clarity
- **Consistent spacing** (4px grid)
- **Subtle shadows** for depth

### 3. Gender-Neutral
- **Balanced color palette** (green + warm tones)
- **Universal fonts** (Poppins + Nunito)
- **Professional imagery**
- **Inclusive language**

### 4. Accessibility
- **WCAG AA contrast ratios** (min 4.5:1 for text)
- **Touch targets** minimum 44x44pt
- **Keyboard navigation** support
- **Screen reader** compatibility

---

## 📐 Spacing System

Based on a **4px grid**:

| Class | Size | Usage |
|-------|------|-------|
| `p-1` | 4px | Tight spacing |
| `p-2` | 8px | Compact spacing |
| `p-3` | 12px | Small spacing |
| `p-4` | 16px | Default spacing |
| `p-6` | 24px | Medium spacing |
| `p-8` | 32px | Large spacing |
| `p-12` | 48px | Extra large spacing |

### Margin & Padding Examples

```tsx
<View className="p-6">           {/* 24px padding all sides */}
<View className="px-6 py-4">    {/* 24px horizontal, 16px vertical */}
<View className="mb-4">          {/* 16px bottom margin */}
```

---

## 🔲 Border Radius

| Class | Size | Usage |
|-------|------|-------|
| `rounded-lg` | 8px | Small elements, tags |
| `rounded-xl` | 12px | Cards, inputs |
| `rounded-2xl` | 16px | Buttons, large cards |
| `rounded-3xl` | 24px | Hero elements |
| `rounded-full` | 9999px | Circles, pills |

---

## 🎭 Visual Hierarchy

### Primary → Secondary → Tertiary

1. **Primary**: Headings, key CTAs
   - Poppins Bold
   - Primary color
   - Larger size

2. **Secondary**: Subheadings, descriptions
   - Nunito Regular/Medium
   - Text secondary color
   - Medium size

3. **Tertiary**: Metadata, captions
   - Nunito Regular
   - Muted color
   - Smaller size

---

## 🌟 Special Effects

### Shadows (Light Mode)

```tsx
style={{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 2,
}}
```

### Shadows (Dark Mode)

Reduced or removed shadows in dark mode for better appearance.

### Active States

```tsx
className="active:opacity-80"  // Buttons
className="active:opacity-60"  // Text links
```

---

## 📱 Responsive Design

### Safe Areas

Always use `SafeAreaView` for proper insets:

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
  {/* Content */}
</SafeAreaView>
```

### Keyboard Handling

```tsx
<KeyboardAvoidingView behavior="padding">
  {/* Form inputs */}
</KeyboardAvoidingView>
```

---

## 🎨 Example Screens

### Light Mode
- Clean white backgrounds
- Soft green primary color (`#22c55e`)
- Warm accents for highlights
- High contrast text

### Dark Mode
- Deep slate backgrounds (`#0f172a`)
- Brighter green primary (`#4ade80`)
- Reduced shadows
- Softer text colors

---

## 🚀 Getting Started

### 1. Import Theme Hook

```tsx
import { useTheme } from '../utils/theme';
```

### 2. Use in Component

```tsx
function MyScreen() {
  const { colors, isDarkMode } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello!</Text>
    </View>
  );
}
```

### 3. Add Dark Mode Toggle

```tsx
<Pressable onPress={toggleDarkMode}>
  <Ionicons 
    name={isDarkMode ? 'sunny' : 'moon'} 
    size={24} 
    color={colors.primary} 
  />
</Pressable>
```

---

## 🎯 Best Practices

### DO ✅
- Use theme colors via `useTheme()` hook
- Apply appropriate font families (Poppins/Nunito)
- Maintain consistent spacing (4px grid)
- Test both light and dark modes
- Ensure sufficient color contrast
- Use semantic color names

### DON'T ❌
- Hardcode colors (e.g., `#22c55e`)
- Mix font families inconsistently
- Use arbitrary spacing values
- Test only in light mode
- Use low-contrast text
- Override theme colors unnecessarily

---

## 📚 Resources

**Color Palette Tool:** Generate additional shades
**Tailwind Docs:** https://tailwindcss.com/docs
**Poppins Font:** Google Fonts
**Nunito Font:** Google Fonts

---

**Design Version:** 2.0
**Last Updated:** Current
**Status:** ✅ Implemented

Enjoy the new GLOSSY design! 🎨✨
