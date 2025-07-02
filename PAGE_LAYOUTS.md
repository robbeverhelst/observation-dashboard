# 🎨 Observation Explorer 2.0 - Page Layouts

## 📐 **Visual Layout Specifications**

This document defines the layout structure for all pages in the Observation Explorer application.

---

## **🏠 Home Page (Tool Dashboard)**

```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR                        MAIN CONTENT AREA                │
│ ┌─────────────────┐ ┌─────────────────────────────────────────┐ │
│ │ 🌍 Observation  │ │              OVERVIEW                   │ │
│ │    Explorer     │ │                                         │ │
│ │                 │ │  Platform Statistics                    │ │
│ │ 📍 Observations │ │  ┌─────────┐ ┌─────────┐ ┌─────────┐    │ │
│ │ 🦋 Species      │ │  │ 24,891  │ │  156    │ │  89     │    │ │
│ │ 👤 Dashboard    │ │  │Species  │ │Countries│ │Regions  │    │ │
│ │                 │ │  │Observed │ │ Covered │ │ Active  │    │ │
│ │ ──────────────  │ │  └─────────┘ └─────────┘ └─────────┘    │ │
│ │                 │ │                                         │ │
│ │ 🔍 Quick Search │ │  Recent Activity Feed                   │ │
│ │ [Search...]     │ │  ┌─────────────────────────────────────┐ │ │
│ │                 │ │  │ 📍 American Robin - Central Park   │ │ │
│ │ 📊 Filters      │ │  │ 📍 Monarch Butterfly - Gardens     │ │ │
│ │ □ Birds         │ │  │ 📍 Red Oak - Forest Trail          │ │ │
│ │ □ Plants        │ │  │ 📍 Gray Squirrel - City Park       │ │ │
│ │ □ Mammals       │ │  │ 📍 House Sparrow - Downtown        │ │ │
│ │ □ Insects       │ │  │                       [View All]   │ │ │
│ │                 │ │  └─────────────────────────────────────┘ │ │
│ │ 🌍 Location     │ │                                         │ │
│ │ [📍 All Areas]  │ │  Quick Actions                          │ │ │
│ │                 │ │  ┌─────────────────────────────────────┐ │ │
│ │ ──────────────  │ │  │ 🗺️ [Open Map View]                 │ │ │
│ │                 │ │  │ 📊 [Browse Species]                │ │ │
│ │ [@username]     │ │  │ 📈 [View Statistics]               │ │ │
│ │ [⚙️ Settings]   │ │  │ 📋 [Export Data]                   │ │ │
│ │ [🔓 Logout]     │ │  └─────────────────────────────────────┘ │ │
│ └─────────────────┘ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## **📍 Observations Page**

```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR                        MAIN CONTENT AREA                │
│ ┌─────────────────┐ ┌─────────────────────────────────────────┐ │
│ │ 🌍 Observation  │ │             OBSERVATIONS                │ │
│ │    Explorer     │ │                         [🔄 Refresh]    │ │
│ │                 │ │                                         │ │
│ │ 📍 Observations │ │  View Mode: [🗺️ Map] [📋 Table]        │ │
│ │ 🦋 Species      │ │                                         │ │
│ │ 👤 Dashboard    │ │  ┌─────────────────────────────────────┐ │ │
│ │                 │ │  │                                     │ │ │
│ │ ──────────────  │ │  │         🗺️ MAP AREA               │ │ │
│ │                 │ │  │                                     │ │ │
│ │ 🔍 Search       │ │  │   📍 📍    Observation pins        │ │ │
│ │ [Search obs...] │ │  │      📍 📍📍  with clustering       │ │ │
│ │                 │ │  │                                     │ │ │
│ │ 📅 Date Range   │ │  │   Color-coded by species group     │ │ │
│ │ [Last 30 days]  │ │  │                                     │ │ │
│ │                 │ │  │   📊 Stats overlay                 │ │ │
│ │ 🦋 Species      │ │  │   🎛️ Map controls                  │ │ │
│ │ □ Birds         │ │  └─────────────────────────────────────┘ │ │
│ │ □ Plants        │ │                                         │ │
│ │ □ Mammals       │ │           OR TABLE VIEW                 │ │
│ │ □ Insects       │ │  ┌─────────────────────────────────────┐ │ │
│ │                 │ │  │Species│Observer│Date │Location│Acts│ │ │
│ │ 🌍 Location     │ │  ├───────┼────────┼─────┼────────┼────┤ │ │
│ │ [📍 All Areas]  │ │  │🐦Robin│@obs1   │Today│Park A  │👁️❤️│ │ │
│ │                 │ │  │🦋Monrch│@obs2  │2h   │Garden B│👁️❤️│ │ │
│ │ 👤 Observer     │ │  │🌸Rose │@obs3   │1d   │Trail C │👁️❤️│ │ │
│ │ [All observers] │ │  │...    │...     │...  │...     │... │ │ │
│ │                 │ │  └─────────────────────────────────────┘ │ │
│ │ 📊 Quality      │ │  [Load More] [Export CSV]               │ │
│ │ ⭐ All Quality   │ │                                         │ │
│ │                 │ │                                         │ │
│ │ ──────────────  │ │                                         │ │
│ │                 │ │                                         │ │
│ │ [@username]     │ │                                         │ │
│ │ [⚙️ Settings]   │ │                                         │ │
│ │ [🔓 Logout]     │ │                                         │ │
│ └─────────────────┘ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## **🔍 Observation Detail Modal**

```
┌─────────────────────────────────────────────────────────────────┐
│                    OBSERVATION DETAIL                      [✕]  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    OBSERVATION INFO                    │
│  │                     │    🦋 American Robin                   │
│  │    📸 PHOTO         │    Turdus migratorius                  │
│  │    GALLERY          │    📅 March 15, 2024 at 2:30 PM       │
│  │                     │    📍 Central Park, New York           │
│  │  [◀] [Image] [▶]    │    👤 @naturelover2024                │
│  └─────────────────────┘    ⭐ Quality: High                    │
│                                                                 │
│  SPECIES DETAILS              OBSERVATION NOTES                 │
│  🏷️ Taxonomy: Aves > ...      "Spotted near the pond,         │
│  📊 Rarity: Common            singing beautifully in           │
│  🗺️ Range: North America      the morning light"               │
│  📈 Activity: Peak Spring                                      │
│                             LOCATION MAP                       │
│  RELATED OBSERVATIONS        ┌─────────────────┐                │
│  📍 Similar nearby (12)      │   🗺️ Mini Map   │                │
│  🦋 Same species (156)       │   📍 Pin        │                │
│  👤 Same observer (89)       │                 │                │
│                             └─────────────────┘                │
│                                                                 │
│  [🔗 Share] [❤️ Favorite] [📊 View Species] [👤 View Observer]  │
└─────────────────────────────────────────────────────────────────┘
```

---

## **🦋 Species Browser Page**

```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR                        MAIN CONTENT AREA                │
│ ┌─────────────────┐ ┌─────────────────────────────────────────┐ │
│ │ 🌍 Observation  │ │            SPECIES EXPLORER             │ │
│ │    Explorer     │ │                         [🔄 Refresh]    │ │
│ │                 │ │                                         │ │
│ │ 📍 Observations │ │  🔍 [Search species...]                 │ │
│ │ 🦋 Species      │ │                                         │ │
│ │ 👤 Dashboard    │ │  📊 Groups: Birds (2,451) Plants (1,887)│ │
│ │                 │ │                                         │ │
│ │ ──────────────  │ │  ┌─────────┐ ┌─────────┐ ┌─────────┐  │ │
│ │                 │ │  │   📸    │ │   📸    │ │   📸    │  │ │
│ │ 🔍 Search       │ │  │         │ │         │ │         │  │ │
│ │ [Search...]     │ │  │ Robin   │ │ Monarch │ │Oak Tree │  │ │
│ │                 │ │  │T.migrat.│ │D.plexi. │ │Q.robur  │  │ │
│ │ 📊 Groups       │ │  │📊 2,341 │ │📊 1,156 │ │📊 987   │  │ │
│ │ □ Birds         │ │  │🔴Common │ │🟡Moderate│ │🔴Common │  │ │
│ │ □ Plants        │ │  └─────────┘ └─────────┘ └─────────┘  │ │
│ │ □ Mammals       │ │                                         │ │
│ │ □ Insects       │ │  ┌─────────┐ ┌─────────┐ ┌─────────┐  │ │
│ │ □ Fish          │ │  │   📸    │ │   📸    │ │   📸    │  │ │
│ │                 │ │  │         │ │         │ │         │  │ │
│ │ 🌍 Region       │ │  │   Fox   │ │ Butterfly│ │  Hawk   │  │ │
│ │ [All Regions]   │ │  │V.vulpes │ │ Species │ │ B.jam.  │  │ │
│ │                 │ │  │📊 456   │ │📊 234   │ │📊 189   │  │ │
│ │ 📈 Activity     │ │  │🟠 Rare  │ │🟡Moderate│ │🔴Common │  │ │
│ │ [All Activity]  │ │  └─────────┘ └─────────┘ └─────────┘  │ │
│ │                 │ │                                         │ │
│ │ 📋 Sort By      │ │            [Load More Species]          │ │
│ │ [Name ↕]        │ │                                         │ │
│ │                 │ │                                         │ │
│ │ ──────────────  │ │                                         │ │
│ │                 │ │                                         │ │
│ │ [@username]     │ │                                         │ │
│ │ [⚙️ Settings]   │ │                                         │ │
│ │ [🔓 Logout]     │ │                                         │ │
│ └─────────────────┘ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## **📖 Species Profile Page**

```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR                        MAIN CONTENT AREA                │
│ ┌─────────────────┐ ┌─────────────────────────────────────────┐ │
│ │ 🌍 Observation  │ │          AMERICAN ROBIN                 │ │
│ │    Explorer     │ │         Turdus migratorius              │ │
│ │                 │ │                                         │ │
│ │ 📍 Observations │ │  ┌─────────────┐  📊 Global Stats       │ │
│ │ 🦋 Species      │ │  │     📸      │  Total Obs: 45,678     │ │
│ │ 👤 Dashboard    │ │  │   PHOTO     │  Observers: 12,456     │ │
│ │                 │ │  │  GALLERY    │  Last: 2h ago          │ │
│ │ ──────────────  │ │  │ [◀][Photo][▶]│  📍 N. America        │ │
│ │                 │ │  └─────────────┘  🔴 Least Concern      │ │
│ │ 🏷️ Taxonomy     │ │                                         │ │
│ │ Kingdom: Animal │ │  [❤️ Favorite] [🔗 Share] [📊 Compare]  │ │
│ │ Class: Aves     │ │                                         │ │
│ │ Order: Passeri. │ │  Tabs: [📊 Overview] [📍 Distribution]  │ │
│ │                 │ │       [📅 Activity] [👥 Community]      │ │
│ │ 📊 Stats        │ │                                         │ │
│ │ Observations:   │ │  ┌─────────────────────────────────────┐ │ │
│ │ • Total: 45,678 │ │  │         OVERVIEW TAB                │ │ │
│ │ • This month:   │ │  │                                     │ │ │
│ │   2,341         │ │  │ RECENT OBSERVATIONS                 │ │ │
│ │ • This week:    │ │  │ 📍 Central Park - 2h ago           │ │ │
│ │   489           │ │  │ 📍 Hyde Park - 5h ago              │ │ │
│ │                 │ │  │ 📍 Golden Gate Park - 1d ago       │ │ │
│ │ 🗺️ Distribution │ │  │ [View All Observations]            │ │ │
│ │ Countries: 12   │ │  │                                     │ │ │
│ │ Regions: 156    │ │  │ SPECIES INFO    TOP CONTRIBUTORS    │ │ │
│ │                 │ │  │ Physical:       👤 @birdwatcher     │ │ │
│ │ ──────────────  │ │  │ 8-11 inches       (234 obs)        │ │ │
│ │                 │ │  │ Habitat:        👤 @naturepro       │ │ │
│ │ [@username]     │ │  │ Parks/gardens     (189 obs)        │ │ │
│ │ [⚙️ Settings]   │ │  │ Diet: Insects   👤 @wildlifefan     │ │ │
│ │ [🔓 Logout]     │ │  │ & fruits          (156 obs)        │ │ │
│ └─────────────────┘ │  └─────────────────────────────────────┘ │ │
│                     └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## **👤 User Dashboard Page** (Authenticated)

```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR                        MAIN CONTENT AREA                │
│ ┌─────────────────┐ ┌─────────────────────────────────────────┐ │
│ │ 🌍 Observation  │ │          PERSONAL DASHBOARD             │ │
│ │    Explorer     │ │                                         │ │
│ │                 │ │  👤 Welcome back, John Doe              │ │
│ │ 📍 Observations │ │  🏆 Level 15 Observer • 🔥 45-day streak│ │
│ │ 🦋 Species      │ │                                         │ │
│ │ 👤 Dashboard    │ │  ┌─────────┐ ┌─────────┐ ┌─────────┐    │ │
│ │                 │ │  │ 1,247   │ │  856    │ │   45    │    │ │
│ │ ──────────────  │ │  │ Total   │ │Species  │ │Countries│    │ │
│ │                 │ │  │  Obs    │ │Found    │ │Visited  │    │ │
│ │ 📊 My Stats     │ │  │[+2.3%]  │ │[+1.8%]  │ │[+0.2%]  │    │ │
│ │ Total: 1,247    │ │  └─────────┘ └─────────┘ └─────────┘    │ │
│ │ Species: 856    │ │                                         │ │
│ │ Streak: 45 days │ │  ┌─────────────────┐ ┌─────────────────┐ │ │
│ │                 │ │  │   LIFE LIST     │ │ RECENT ACTIVITY │ │ │
│ │ 🏆 Achievements │ │  │                 │ │                 │ │ │
│ │ 🥇 Century Club │ │  │ 🦋 Recent:      │ │ 📍 Today (3):   │ │ │
│ │ 🌍 Explorer     │ │  │ • Blackbird     │ │ • Robin         │ │ │
│ │ 📸 Photographer │ │  │ • Monarch       │ │ • Blue Jay      │ │ │
│ │                 │ │  │ • White Oak     │ │ • Sparrow       │ │ │
│ │ 🎯 Goals        │ │  │                 │ │                 │ │ │
│ │ □ 1000 Species  │ │  │ Progress:       │ │ 📅 Week: 12     │ │ │
│ │ □ 100-day Streak│ │  │ ████████░░ 85%  │ │ 📅 Month: 45    │ │ │
│ │                 │ │  │ [View Full]     │ │ [View All]      │ │ │
│ │ ──────────────  │ │  └─────────────────┘ └─────────────────┘ │ │
│ │                 │ │                                         │ │
│ │ [@username]     │ │  ┌─────────────────────────────────────┐ │ │
│ │ [⚙️ Settings]   │ │  │        OBSERVATION MAP              │ │ │
│ │ [🔓 Logout]     │ │  │                                     │ │ │
│ └─────────────────┘ │  │  🗺️ Your observation locations     │ │ │
│                     │  │                                     │ │ │
│                     │  │  📍 📍 📍 Pin clusters showing     │ │ │
│                     │  │     📍   your observation history  │ │ │
│                     │  │                                     │ │ │
│                     │  │  [View Full Map]                    │ │ │
│                     │  └─────────────────────────────────────┘ │ │
│                     └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## **🔐 Authentication Pages**

### **Login Page**
```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR                        MAIN CONTENT AREA                │
│ ┌─────────────────┐ ┌─────────────────────────────────────────┐ │
│ │ 🌍 Observation  │ │                                         │ │
│ │    Explorer     │ │            WELCOME BACK                 │ │
│ │                 │ │                                         │ │
│ │ 📍 Observations │ │         ┌─────────────────────┐         │ │
│ │ 🦋 Species      │ │         │                     │         │ │
│ │ 👤 Dashboard    │ │         │  🌍 Sign In         │         │ │
│ │                 │ │         │                     │         │ │
│ │ ──────────────  │ │         │  Access your        │         │ │
│ │                 │ │         │  personal dashboard │         │ │
│ │ 🔍 Quick Access │ │         │                     │         │ │
│ │ Browse without  │ │         │  [🔐 Sign in with   │         │ │
│ │ signing in:     │ │         │      Google]        │         │ │
│ │                 │ │         │                     │         │ │
│ │ [📍 Observations]│ │         │  ───── or ─────     │         │ │
│ │ [🦋 Species]    │ │         │                     │         │ │
│ │                 │ │         │  [🔗 Link           │         │ │
│ │                 │ │         │   waarneming.nl]    │         │ │
│ │                 │ │         │                     │         │ │
│ │                 │ │         │  Continue without   │         │ │
│ │                 │ │         │  signing in:        │         │ │
│ │                 │ │         │  [Browse as Guest]  │         │ │
│ │                 │ │         │                     │         │ │
│ │                 │ │         └─────────────────────┘         │ │
│ │                 │ │                                         │ │
│ │                 │ │                                         │ │
│ └─────────────────┘ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## **📱 Mobile Layout Considerations**

### **Mobile Navigation**
```
┌─────────────────────────────────┐
│ 🌍 Obs Explorer        [☰ Menu] │
├─────────────────────────────────┤
│                                 │
│        MOBILE CONTENT           │
│                                 │
│  [Stacked cards and sections]   │
│  [Touch-optimized buttons]      │
│  [Collapsible filters]          │
│                                 │
├─────────────────────────────────┤
│     BOTTOM NAVIGATION           │
│ [📍 Obs] [🦋 Species] [👤 Me]   │
└─────────────────────────────────┘
```

### **Mobile Adaptations**
- **Navigation**: Hamburger menu + bottom tab bar
- **Cards**: Single column layout with larger touch targets
- **Maps**: Full-screen with overlay controls
- **Tables**: Horizontal scroll or card-based layout
- **Modals**: Full-screen on mobile
- **Filters**: Collapsible panels with bottom sheets

---

## **🎨 Design System Notes**

### **Color Coding**
- **🔴 Common Species**: Red indicators
- **🟡 Moderate Rarity**: Yellow indicators  
- **🟠 Rare Species**: Orange indicators
- **🔵 Map Pins**: Blue for birds, Green for plants, etc.

### **Component Patterns**
- **Cards**: Consistent shadowing and borders
- **Buttons**: Primary (filled) and Secondary (outline)
- **Icons**: Lucide React icons throughout
- **Typography**: Geist Sans for text, Geist Mono for code

### **Layout Principles**
- **Grid System**: 12-column responsive grid
- **Spacing**: 4px base unit (4, 8, 16, 24, 32px)
- **Breakpoints**: Mobile (768px), Tablet (1024px), Desktop (1280px+)
- **Accessibility**: WCAG 2.1 AA compliance for all layouts

This layout specification ensures consistent user experience across all pages while maintaining flexibility for future enhancements.