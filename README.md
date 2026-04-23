# LogiSys — Priority-Based Order Distribution System

> A full-stack logistics platform that manages product listings, order queues, and time-slot-based delivery allocation. Built with React, Supabase, and Tailwind CSS.

---

## Problem Statement

In high-demand product scenarios (RAM shortages, limited stock releases, etc.), fair distribution is critical. Without a structured system, orders become chaotic — some customers get served multiple times while others wait indefinitely.

**LogiSys solves this by:**
- Assigning every order a priority rank based on submission timestamp (FIFO)
- Distributing orders across available time slots by capacity
- Giving admins the ability to override priority when needed
- Providing real-time visibility into slot utilization and queue position

---

## Features

### User Features
| Page | What it does | Why it matters |
|------|-------------|----------------|
| **Overview (Dashboard)** | Shows total orders, pending count, slot utilization chart | At-a-glance system health |
| **Products** | Browse and list products for sale | Marketplace layer — users can both buy and sell |
| **New Order** | Place an order, select product, choose order type | Core action — triggers FIFO queue assignment |
| **My Orders** | View all your orders, queue position, status | Transparency — user knows exactly where they stand |
| **Time Slots** | See capacity across all delivery windows | Helps users choose optimal ordering time |

### Admin Features
| Page | What it does | Why it matters |
|------|-------------|----------------|
| **Admin Control** | Overview stats + priority override table | Full control over the queue |
| **All Orders** | View and change status of every order | Operational management |
| **Product Listings** | Activate, deactivate, or remove listings | Quality control over marketplace |

---

## Priority System

Orders are distributed using **FIFO (First In, First Out)**:

```
order_time → priority_rank → slot_assignment
```

1. User submits order → `order_time` is recorded as `now()`
2. Orders are ranked by `order_time` ascending → earliest = rank 1
3. System scans time slots sequentially, fills by capacity
4. Once a slot is full → overflow goes to next available slot
5. Admin can manually override `priority_rank` to bump or demote orders

**Why FIFO?**
It's the fairest model for limited-supply distribution. No favoritism, no gaming the system. First come, first served — transparent and auditable.

---

## Tech Stack

| Tool | Role | Why |
|------|------|-----|
| **React** | UI framework | Component-based, reactive state — perfect for real-time data |
| **Vite** | Build tool | Fast HMR, minimal config |
| **Tailwind CSS** | Styling | Utility-first, no CSS bloat |
| **Supabase** | Auth + Database | PostgreSQL + instant REST API + real-time subscriptions |
| **React Router** | Navigation | Client-side routing between pages |
| **Recharts** | Charts | React-native bar charts for slot utilization |

---

## Database Schema

```sql
-- Users (managed by Supabase Auth)
profiles
  id          uuid  (references auth.users)
  email       text
  name        text
  role        text  (default: 'user' | 'admin')
  created_at  timestamptz

-- Products listed in the marketplace
products (future: currently mock data)
  id          uuid
  seller_id   uuid  (references profiles)
  name        text
  quantity    int
  status      text  ('active' | 'inactive')
  created_at  timestamptz

-- Orders placed by users
orders
  id          uuid
  user_id     uuid  (references profiles)
  product_id  uuid  (references products)
  order_time  timestamptz
  priority_rank int
  status      text  ('pending' | 'allocated' | 'cancelled')

-- Delivery time windows
time_slots
  id               uuid
  slot_start       time
  slot_end         time
  max_capacity     int
  current_capacity int

-- Links orders to slots
order_allocations
  id           uuid
  order_id     uuid  (references orders)
  slot_id      uuid  (references time_slots)
  allocated_at timestamptz
```

---

## Supabase Integration

### Auth
```js
// Sign up
await supabase.auth.signUp({ email, password, options: { data: { name } } })

// Sign in
await supabase.auth.signInWithPassword({ email, password })

// Session listener
supabase.auth.onAuthStateChange((_event, session) => { ... })
```

### Database
```js
// Fetch time slots
const { data } = await supabase.from('time_slots').select('*')

// Insert order
const { data } = await supabase.from('orders').insert({ user_id, product_id, order_time: new Date(), priority_rank, status: 'pending' })

// Allocate to slot (increment capacity)
await supabase.from('order_allocations').insert({ order_id, slot_id })
await supabase.from('time_slots').update({ current_capacity: slot.current_capacity + 1 }).eq('id', slot_id)

// Cancel order
await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order_id)

// Admin override priority
await supabase.from('orders').update({ priority_rank: newRank }).eq('id', order_id)
```

### Role-based access
```js
// Profiles table stores role
const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

// Set admin
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## How to Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/logisys
cd logisys

# 2. Install dependencies
npm install

# 3. Create .env file in root
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# 4. Run Supabase SQL setup
# Copy contents of /sql/schema.sql into Supabase SQL Editor and run

# 5. Start dev server
npm run dev
```

---

## Future Improvements

- [ ] Real-time order queue updates using Supabase subscriptions
- [ ] Email notifications when order is allocated
- [ ] Weighted priority (Express orders get higher rank)
- [ ] Order history with delivery tracking
- [ ] Mobile-responsive layout
- [ ] Analytics dashboard with historical data
- [ ] Webhook integration for inventory sync

---

## Design

LogiSys uses a **Nothing OS × Notion** design language:
- Stark black/white with a single red accent (`#ff3c3c`)
- `DM Mono` for data and labels, `Syne` for headings
- Dot-grid backgrounds, thin borders, no heavy shadows
- Terminal-style labels (`order_confirmed`, `time_slot`, etc.)

---

*Built as a DBMS portfolio project demonstrating real-world order distribution logic with full-stack authentication and role-based access control.*
