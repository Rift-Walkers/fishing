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
    Frontend (React + Tailwind) | Backend (FastAPI) | Database (PostgreSQL)

|     Software/Service    | Free Tier Details                             | Paid Costs After Free Tier                         |
|-------------------------|-----------------------------------------------|----------------------------------------------------|
| PostgreSQL             | Supabase: 500MB; AWS RDS: 20GB SSD + t2.micro | $25/month (Supabase Pro); ~$15/month (AWS RDS)    |
| AWS S3                 | 5GB storage + free requests                   | $0.023/GB/month; alternatives cheaper             |
| Redis                  | Upstash: Free up to 10K requests/day          | $5–$10/month depending on usage                   |
| Backend Framework      | FastAPI/Express.js are free                   | No additional cost                                |
| Hosting                | AWS EC2 t2.micro free (750 hours)             | ~$5–$10/month on VPS after free tier              |


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
