export const mockOrders = [
  { id: '001', customer_name: 'Rahul Sharma', status: 'allocated', created_at: '2024-01-15 09:05', slot: '09:00 - 10:00', priority_rank: 1, product: 'DDR4 16GB RAM' },
  { id: '002', customer_name: 'Priya Menon',  status: 'pending',   created_at: '2024-01-15 09:12', slot: '10:00 - 11:00', priority_rank: 2, product: 'DDR5 32GB RAM' },
  { id: '003', customer_name: 'Arjun Nair',   status: 'allocated', created_at: '2024-01-15 09:18', slot: '09:00 - 10:00', priority_rank: 3, product: 'DDR4 16GB RAM' },
  { id: '004', customer_name: 'Sneha Rao',    status: 'pending',   created_at: '2024-01-15 10:02', slot: '11:00 - 12:00', priority_rank: 4, product: 'DDR4 8GB RAM'  },
  { id: '005', customer_name: 'Kiran Das',    status: 'cancelled', created_at: '2024-01-15 10:15', slot: '10:00 - 11:00', priority_rank: 5, product: 'DDR5 32GB RAM' },
  { id: '006', customer_name: 'Meera Pillai', status: 'allocated', created_at: '2024-01-15 10:30', slot: '13:00 - 14:00', priority_rank: 6, product: 'DDR4 8GB RAM'  },
]

export const mockSlots = [
  { id: '1', slot_start: '09:00', slot_end: '10:00', max_capacity: 10, current_capacity: 8 },
  { id: '2', slot_start: '10:00', slot_end: '11:00', max_capacity: 10, current_capacity: 10 },
  { id: '3', slot_start: '11:00', slot_end: '12:00', max_capacity: 10, current_capacity: 3 },
  { id: '4', slot_start: '13:00', slot_end: '14:00', max_capacity: 10, current_capacity: 0 },
  { id: '5', slot_start: '14:00', slot_end: '15:00', max_capacity: 10, current_capacity: 6 },
]

export const mockProducts = [
  { id: '1', name: 'DDR4 16GB RAM', seller: 'TechStore',  seller_id: 'u1', quantity: 5, created_at: '2024-01-15 08:00', status: 'active'   },
  { id: '2', name: 'DDR5 32GB RAM', seller: 'RamWorld',   seller_id: 'u2', quantity: 2, created_at: '2024-01-15 08:30', status: 'active'   },
  { id: '3', name: 'DDR4 8GB RAM',  seller: 'MemoryHub',  seller_id: 'u3', quantity: 8, created_at: '2024-01-15 09:00', status: 'active'   },
  { id: '4', name: 'DDR3 4GB RAM',  seller: 'OldTech',    seller_id: 'u4', quantity: 0, created_at: '2024-01-15 09:30', status: 'inactive' },
]
