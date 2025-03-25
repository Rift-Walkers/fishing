# Fishing

Initial Goals:
3/19

3/26

- Create Supabase to have ready for auth
- Have a base framework for the application
  - basic movements, visible environment

4/2

4/9

4/16


# 🎣 Krish - A Simple Web-Based Fishing Game

Welcome to **Krish**, a fun and casual fishing game built for the web. Players cast a line, catch various types of fish (some common, some rare), and collect them in their personal inventory. Future expansions may include quests, loot systems, or trading mechanics.

---

## 🧠 ERD Sketch (Initial)

Basic entities:

- **Player**
  - id (PK)
  - username
  - inventory (List of FK to FishCaught)

- **Fish**
  - id (PK)
  - name
  - rarity (common, rare, legendary)
  - image_url
  - value

- **FishCaught**
  - id (PK)
  - player_id (FK)
  - fish_id (FK)
  - caught_at (timestamp)

*Relationships:*
- Players can catch many fish
- Fish have a rarity/type system
- Each fish caught is tracked individually

---

## 🛠 System Design Sketch

Simple web stack:
    Frontend (React + Tailwind) | v Backend (Flask or FastAPI) | v Database (SQLite or PostgreSQL)


- Cast a line → Randomized result from backend
- Save fish caught to player’s inventory
- Frontend updates game UI (animation, modal, inventory)

---

## 🗓 Timeline Goals

| Date   | Goal |
|--------|------|
| **3/19** | Project repo setup, ERD drafted, frontend structure created |
| **3/26** | Backend API for casting line, fish data model, random catch logic |
| **4/2**  | Basic game UI working (cast button, fish shows up), data saves to backend |
| **4/9**  | Add inventory screen, fish collection tracking, rarity styling |
| **4/16** | Polish animations, deploy online, optional sound or quest hooks |

---

## 🕹 UX Sketch (Rough Ideas)

- **Game Screen**
  - Cast button → triggers animation + random fish catch
  - Pop-up shows caught fish (image, name, rarity)

- **Inventory Page**
  - Grid of fish caught
  - Hover to see details (name, rarity, value)

---

## ✅ Notes

- Keep the logic simple but expandable (loot tables, daily rewards, etc.)
- Optional: Add animated water background and smooth cast/reel animations
- Optional: Use local storage or session ID for player save before login system
