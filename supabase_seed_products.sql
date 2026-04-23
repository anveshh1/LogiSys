-- ============================================================
-- Insert products across 4+ categories
-- Linked to admin user so they show up everywhere
-- Run in Supabase SQL Editor
-- ============================================================

INSERT INTO products (name, category, description, total_quantity, available_quantity, status, created_by)
VALUES
  -- Category: RAM
  ('DDR4 16GB RAM',   'RAM',        'High-performance DDR4 memory module',       50, 50, 'active',
    (SELECT id FROM auth.users WHERE email = 'adithyask45@gmail.com')),
  ('DDR5 64GB RAM',   'RAM',        'Next-gen DDR5 for workstations',            30, 30, 'active',
    (SELECT id FROM auth.users WHERE email = 'adithyask45@gmail.com')),

  -- Category: Storage
  ('1TB NVMe SSD',    'Storage',    'PCIe Gen4 NVMe solid state drive',          40, 40, 'active',
    (SELECT id FROM auth.users WHERE email = 'adithyask45@gmail.com')),
  ('2TB SATA SSD',    'Storage',    'Reliable SATA SSD for everyday use',        25, 25, 'active',
    (SELECT id FROM auth.users WHERE email = 'adithyask45@gmail.com')),

  -- Category: Processors
  ('Intel i7-14700K', 'Processors', '20-core desktop processor',                 15, 15, 'active',
    (SELECT id FROM auth.users WHERE email = 'adithyask45@gmail.com')),
  ('AMD Ryzen 9 7950X','Processors','16-core high-end desktop CPU',              10, 10, 'active',
    (SELECT id FROM auth.users WHERE email = 'adithyask45@gmail.com')),

  -- Category: Graphics
  ('RTX 4070 Ti',     'Graphics',   'NVIDIA GeForce RTX 4070 Ti 12GB',           20, 20, 'active',
    (SELECT id FROM auth.users WHERE email = 'adithyask45@gmail.com')),
  ('RX 7800 XT',      'Graphics',   'AMD Radeon RX 7800 XT 16GB',               18, 18, 'active',
    (SELECT id FROM auth.users WHERE email = 'adithyask45@gmail.com')),

  -- Category: Peripherals
  ('Mechanical Keyboard', 'Peripherals', 'Cherry MX Brown switches, RGB',        60, 60, 'active',
    (SELECT id FROM auth.users WHERE email = 'adithyask45@gmail.com')),
  ('Gaming Mouse',    'Peripherals', 'Lightweight wireless gaming mouse 25K DPI', 45, 45, 'active',
    (SELECT id FROM auth.users WHERE email = 'adithyask45@gmail.com'));

-- Verify
SELECT name, category, available_quantity, status FROM products ORDER BY category, name;
