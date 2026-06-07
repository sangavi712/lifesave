import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use DATABASE_URL for deployment (Render, Heroku, Supabase, Neon) or individual env variables for local dev
const connectionString = process.env.DATABASE_URL;

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: {
        rejectUnauthorized: false // Required for most cloud PostgreSQL hosts (Supabase, Neon, Render)
      }
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'blood_bank',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432', 10),
    };

const pool = new Pool(poolConfig);
let useMock = false;

// In-Memory Database State
let mockUsers = [
  { id: 1, name: 'System Administrator', email: 'admin@bloodbank.com', password: '$2a$10$bh5bykyCrnhz.i5kn6PeF.GKaoi95.4O/c9NM7nDAdqWqmdoGAGgC', role: 'admin', created_at: new Date() },
  { id: 2, name: 'Dorian Vance', email: 'dorian@example.com', password: '$2a$10$oF4NYBFC2NJ.nDf6DbPAs.PRshJsyFM5haAnrxrXN8IyGAlOAMh56', role: 'user', created_at: new Date() },
  { id: 3, name: 'Clara Sterling', email: 'clara@example.com', password: '$2a$10$oF4NYBFC2NJ.nDf6DbPAs.PRshJsyFM5haAnrxrXN8IyGAlOAMh56', role: 'user', created_at: new Date() },
  { id: 4, name: 'Demo User', email: 'user@bloodbank.com', password: '$2a$10$oF4NYBFC2NJ.nDf6DbPAs.PRshJsyFM5haAnrxrXN8IyGAlOAMh56', role: 'user', created_at: new Date() }
];

let mockDonors = [
  { id: 1, name: 'Declan Vance', age: 34, blood_group: 'O+', phone: '555-0101', city: 'Hill Valley', last_donation: '2026-03-15', user_id: null, created_at: new Date() },
  { id: 2, name: 'Clara Sterling', age: 28, blood_group: 'A+', phone: '555-0102', city: 'Metro City', last_donation: '2026-02-10', user_id: 3, created_at: new Date() },
  { id: 3, name: 'Julian Mercer', age: 45, blood_group: 'B+', phone: '555-0103', city: 'River Heights', last_donation: '2025-11-20', user_id: null, created_at: new Date() },
  { id: 4, name: 'Fiona Beckett', age: 22, blood_group: 'AB-', phone: '555-0104', city: 'Emerald Bay', last_donation: null, user_id: null, created_at: new Date() },
  { id: 5, name: 'Gideon Cross', age: 31, blood_group: 'O-', phone: '555-0105', city: 'Silverpine', last_donation: '2026-04-01', user_id: null, created_at: new Date() }
];

let mockRequests = [
  { id: 1, hospital: 'Metro City Station', blood_group: 'O+', units: 5, status: 'approved', user_id: 2, created_at: new Date() },
  { id: 2, hospital: 'Aether Bio-Network', blood_group: 'A-', units: 2, status: 'pending', user_id: 3, created_at: new Date() },
  { id: 3, hospital: 'Nova Care Station', blood_group: 'B+', units: 3, status: 'rejected', user_id: 2, created_at: new Date() },
  { id: 4, hospital: 'Mercy Outpost Node', blood_group: 'AB+', units: 1, status: 'pending', user_id: 2, created_at: new Date() }
];

let mockInventory = [
  { id: 1, blood_group: 'A+', units: 15, updated_at: new Date() },
  { id: 2, blood_group: 'A-', units: 5, updated_at: new Date() },
  { id: 3, blood_group: 'B+', units: 20, updated_at: new Date() },
  { id: 4, blood_group: 'B-', units: 4, updated_at: new Date() },
  { id: 5, blood_group: 'AB+', units: 8, updated_at: new Date() },
  { id: 6, blood_group: 'AB-', units: 2, updated_at: new Date() },
  { id: 7, blood_group: 'O+', units: 25, updated_at: new Date() },
  { id: 8, blood_group: 'O-', units: 10, updated_at: new Date() }
];

// Mock SQL Query Runner
const mockQuery = async (text, params = []) => {
  const queryLower = text.toLowerCase().trim();
  
  if (queryLower.includes('select now()')) {
    return { rows: [{ now: new Date() }] };
  }

  // USERS QUERIES
  if (queryLower.includes('from users')) {
    if (queryLower.includes('where email =')) {
      const email = params[0];
      const found = mockUsers.find(u => u.email === email);
      return { rows: found ? [found] : [] };
    }
    if (queryLower.includes('where id =')) {
      const id = parseInt(params[0], 10);
      const found = mockUsers.find(u => u.id === id);
      return { rows: found ? [found] : [] };
    }
    if (queryLower.includes('count(*)')) {
      return { rows: [{ count: mockUsers.length }] };
    }
    return { rows: mockUsers };
  }

  if (queryLower.includes('insert into users')) {
    const newUser = {
      id: mockUsers.length + 1,
      name: params[0],
      email: params[1],
      password: params[2],
      role: params[3] || 'user',
      created_at: new Date()
    };
    mockUsers.push(newUser);
    return { rows: [newUser] };
  }

  // DONORS QUERIES
  if (queryLower.includes('from donors')) {
    // Check if it's a specific single donor fetch by ID
    const singleIdMatch = text.match(/where\s+(?:donors\.)?id\s*=\s*\$(\d+)/i);
    if (singleIdMatch) {
      const id = parseInt(params[parseInt(singleIdMatch[1], 10) - 1], 10);
      const found = mockDonors.find(d => d.id === id);
      return { rows: found ? [found] : [] };
    }

    // Check if it's filtering by user_id
    const userIdMatch = text.match(/where\s+(?:donors\.)?user_id\s*=\s*\$(\d+)/i);
    if (userIdMatch) {
      const userId = parseInt(params[parseInt(userIdMatch[1], 10) - 1], 10);
      const found = mockDonors.filter(d => d.user_id === userId);
      return { rows: found };
    }

    // Otherwise, parse general search/filter criteria
    let bg = null;
    let city = null;
    let search = null;

    const bgMatch = text.match(/blood_group\s*=\s*\$(\d+)/i);
    if (bgMatch) bg = params[parseInt(bgMatch[1], 10) - 1];

    const cityMatch = text.match(/LOWER\(city\)\s*=\s*LOWER\(\$(\d+)\)/i);
    if (cityMatch) city = params[parseInt(cityMatch[1], 10) - 1];

    const searchMatch = text.match(/LOWER\(name\)\s*LIKE\s*LOWER\(\$(\d+)\)/i);
    if (searchMatch) {
      const rawSearch = params[parseInt(searchMatch[1], 10) - 1];
      search = rawSearch ? rawSearch.replace(/%/g, '').toLowerCase() : '';
    }

    let filtered = [...mockDonors];
    if (bg) filtered = filtered.filter(d => d.blood_group === bg);
    if (city) filtered = filtered.filter(d => d.city.toLowerCase() === city.toLowerCase());
    if (search) filtered = filtered.filter(d => d.name.toLowerCase().includes(search) || d.phone.includes(search));

    if (queryLower.includes('count(*)')) {
      return { rows: [{ count: filtered.length }] };
    }

    // Limit & Offset
    const limitMatch = text.match(/LIMIT\s*\$(\d+)/i);
    const offsetMatch = text.match(/OFFSET\s*\$(\d+)/i);
    let limitVal = filtered.length;
    let offsetVal = 0;
    if (limitMatch) limitVal = parseInt(params[parseInt(limitMatch[1], 10) - 1], 10);
    if (offsetMatch) offsetVal = parseInt(params[parseInt(offsetMatch[1], 10) - 1], 10);

    const paginated = filtered.slice(offsetVal, offsetVal + limitVal);
    return { rows: paginated };
  }

  if (queryLower.includes('insert into donors')) {
    const newDonor = {
      id: mockDonors.length + 1,
      name: params[0],
      age: parseInt(params[1], 10),
      blood_group: params[2],
      phone: params[3],
      city: params[4],
      last_donation: params[5] || null,
      user_id: params[6] || null,
      created_at: new Date()
    };
    mockDonors.push(newDonor);
    return { rows: [newDonor] };
  }

  if (queryLower.includes('update donors')) {
    const id = parseInt(params[6], 10);
    const index = mockDonors.findIndex(d => d.id === id);
    if (index !== -1) {
      mockDonors[index] = {
        ...mockDonors[index],
        name: params[0],
        age: parseInt(params[1], 10),
        blood_group: params[2],
        phone: params[3],
        city: params[4],
        last_donation: params[5] || null
      };
      return { rows: [mockDonors[index]] };
    }
    return { rows: [] };
  }

  if (queryLower.includes('delete from donors')) {
    const id = parseInt(params[0], 10);
    mockDonors = mockDonors.filter(d => d.id !== id);
    return { rows: [] };
  }

  // REQUESTS QUERIES
  if (queryLower.includes('from requests')) {
    // Check if it's a specific single request fetch by ID
    const singleIdMatch = text.match(/where\s+(?:requests\.)?id\s*=\s*\$(\d+)/i) || text.match(/where\s+r\.id\s*=\s*\$(\d+)/i);
    if (singleIdMatch) {
      const id = parseInt(params[parseInt(singleIdMatch[1], 10) - 1], 10);
      const found = mockRequests.find(r => r.id === id);
      return { rows: found ? [found] : [] };
    }

    // Parse general search/filter criteria
    let userId = null;
    let bg = null;
    let statusVal = null;

    const userIdMatch = text.match(/user_id\s*=\s*\$(\d+)/i);
    if (userIdMatch) userId = parseInt(params[parseInt(userIdMatch[1], 10) - 1], 10);

    const bgMatch = text.match(/blood_group\s*=\s*\$(\d+)/i);
    if (bgMatch) bg = params[parseInt(bgMatch[1], 10) - 1];

    const statusMatch = text.match(/status\s*=\s*\$(\d+)/i);
    if (statusMatch) statusVal = params[parseInt(statusMatch[1], 10) - 1];

    let filtered = [...mockRequests];
    if (userId !== null) filtered = filtered.filter(r => r.user_id === userId);
    if (bg) filtered = filtered.filter(r => r.blood_group === bg);
    if (statusVal) filtered = filtered.filter(r => r.status === statusVal);

    if (queryLower.includes('count(*)')) {
      return { rows: [{ count: filtered.length }] };
    }

    // Add user_name field (join simulator)
    let joined = filtered.map(r => {
      const u = mockUsers.find(user => user.id === r.user_id);
      return {
        ...r,
        user_name: u ? u.name : 'System'
      };
    });

    // Sort by id DESC
    joined.sort((a, b) => b.id - a.id);

    // Limit & Offset
    const limitMatch = text.match(/LIMIT\s*\$(\d+)/i);
    const offsetMatch = text.match(/OFFSET\s*\$(\d+)/i);
    let limitVal = joined.length;
    let offsetVal = 0;
    if (limitMatch) limitVal = parseInt(params[parseInt(limitMatch[1], 10) - 1], 10);
    if (offsetMatch) offsetVal = parseInt(params[parseInt(offsetMatch[1], 10) - 1], 10);

    const paginated = joined.slice(offsetVal, offsetVal + limitVal);
    return { rows: paginated };
  }

  if (queryLower.includes('insert into requests')) {
    const newReq = {
      id: mockRequests.length + 1,
      hospital: params[0],
      blood_group: params[1],
      units: parseInt(params[2], 10),
      status: params[3] || 'pending',
      user_id: params[4] || null,
      created_at: new Date()
    };
    mockRequests.push(newReq);
    return { rows: [newReq] };
  }

  if (queryLower.includes('update requests')) {
    const id = parseInt(params[1], 10);
    const index = mockRequests.findIndex(r => r.id === id);
    if (index !== -1) {
      mockRequests[index].status = params[0];
      return { rows: [mockRequests[index]] };
    }
    return { rows: [] };
  }

  if (queryLower.includes('delete from requests')) {
    const id = parseInt(params[0], 10);
    mockRequests = mockRequests.filter(r => r.id !== id);
    return { rows: [] };
  }

  // INVENTORY QUERIES
  if (queryLower.includes('from inventory')) {
    if (queryLower.includes('where blood_group =')) {
      const bg = params[0];
      const found = mockInventory.find(i => i.blood_group === bg);
      return { rows: found ? [found] : [] };
    }
    if (queryLower.includes('sum(units)')) {
      const sum = mockInventory.reduce((acc, curr) => acc + curr.units, 0);
      return { rows: [{ sum: sum.toString() }] };
    }
    return { rows: mockInventory };
  }

  if (queryLower.includes('update inventory')) {
    if (queryLower.includes('units = units +') || queryLower.includes('units = units -')) {
      const amount = parseInt(params[0], 10);
      const bg = params[1];
      const index = mockInventory.findIndex(i => i.blood_group === bg);
      if (index !== -1) {
        mockInventory[index].units += amount;
        if (mockInventory[index].units < 0) mockInventory[index].units = 0;
        return { rows: [mockInventory[index]] };
      }
    } else {
      const amount = parseInt(params[0], 10);
      const bg = params[1];
      const index = mockInventory.findIndex(i => i.blood_group === bg);
      if (index !== -1) {
        mockInventory[index].units = amount;
        return { rows: [mockInventory[index]] };
      }
    }
    return { rows: [] };
  }

  return { rows: [] };
};

// Check PostgreSQL database status on boot
try {
  const client = await pool.connect();
  client.release();
  console.log('PostgreSQL database query verified successfully.');
} catch (err) {
  console.warn('[DB Fallback] PostgreSQL connection failed. Activating In-Memory Mock Database mode.');
  useMock = true;

  // Intercept all pool methods completely so no pg connections are made
  pool.query = async (text, params) => {
    return mockQuery(text, params);
  };

  pool.connect = async (cb) => {
    const client = {
      query: async (text, params, callback) => {
        const res = await mockQuery(text, params);
        if (callback) {
          callback(null, res);
        }
        return res;
      },
      release: () => {},
      on: () => {},
      once: () => {},
      emit: () => {},
      removeListener: () => {}
    };
    if (cb) {
      cb(null, client, () => {});
    }
    return client;
  };
}

export default pool;
