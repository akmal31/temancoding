import { Pool } from 'pg';

let pool: Pool | undefined;

if (!pool && process.env.DATABASE_URL) {
  const config: any = {
    connectionString: process.env.DATABASE_URL,
  };

  // Only enable SSL if it is not explicitly disabled via URL or ENV
  const disableSsl = process.env.DATABASE_URL.includes('sslmode=disable') || process.env.DISABLE_DB_SSL === 'true';

  if (process.env.NODE_ENV === 'production' && !disableSsl) {
    config.ssl = { rejectUnauthorized: false };
  }

  pool = new Pool(config);
}

// In-memory fallback for local development
const mockDb: Record<string, any[]> = {
  users: [
    { user_id: 'local-dev-user-id', name: 'Akil (Local Dev)', email: 'localdev@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=localdev', credits: 8 }
  ],
  projects: [],
  transactions: []
};

function parseQueryAndMock(text: string, params?: any[]) {
  const t = text.toLowerCase();
  
  // Create / Insert Project
  if (t.includes('insert into public.projects') && t.includes('user_id, title, idea')) {
    // INSERT INTO public.projects (user_id, title, idea, status) VALUES ((SELECT user_id FROM public.users WHERE email = $1), $2, $3, 'draft')
    const project = { id: Math.random().toString(36).substring(7), user_id: 'local-dev-user-id', email: params![0], title: params![1], idea: params![2], status: 'draft', answers: null, prd_result: null, generated_code: null, created_at: new Date() };
    mockDb.projects.push(project);
    return { rows: [{ id: project.id }], rowCount: 1 };
  }
  
  // Upsert Project
  if (t.includes('insert into public.projects') && t.includes('id, user_id, title, idea, answers')) {
    const existing = mockDb.projects.findIndex(p => p.id === params![0]);
    if (existing >= 0) {
      mockDb.projects[existing].answers = params![4];
      return { rows: [{ id: params![0] }], rowCount: 1 };
    }
    const project = { id: params![0], user_id: 'local-dev-user-id', email: params![1], title: params![2], idea: params![3], answers: params![4], status: 'draft', prd_result: null, generated_code: null, created_at: new Date() };
    mockDb.projects.push(project);
    return { rows: [{ id: project.id }], rowCount: 1 };
  }
  
  // List Projects
  if (t.includes('select') && t.includes('public.projects') && t.includes('join public.users')) {
    // SELECT p.id, p.title, p.status ... JOIN ... WHERE u.email = $1
    return { rows: mockDb.projects.filter(p => p.email === params![0] || p.user_id === 'local-dev-user-id'), rowCount: mockDb.projects.length };
  }

  // Get project generic
  if (t.includes('select') && t.includes('public.projects') && t.includes('where p.id')) {
    const p = mockDb.projects.find(p => p.id === params![0]);
    return { rows: p ? [p] : [], rowCount: p ? 1 : 0 };
  }

  // Get project by simple id
  if (t.includes('select * from public.projects where id')) {
    const p = mockDb.projects.find(p => p.id === params![0]);
    return { rows: p ? [p] : [], rowCount: p ? 1 : 0 };
  }

  // Update Dynamic (PUT)
  if (t.includes('update public.projects set') && !t.includes('generated_code')) {
     const id = params![params!.length - 1]; // id is last param
     const idx = mockDb.projects.findIndex(p => p.id === id);
     if (idx !== -1) {
       if (t.includes('idea =')) mockDb.projects[idx].idea = params![0];
       // basic mock, not mapping exact params to order
       return { rows: [mockDb.projects[idx]], rowCount: 1 };
     }
  }

  // Update generated code specifically
  if (t.includes('update public.projects set generated_code')) {
    const idx = mockDb.projects.findIndex(p => p.id === params![2]);
    if (idx !== -1) {
      mockDb.projects[idx].generated_code = params![0];
      mockDb.projects[idx].status = params![1];
      return { rows: [mockDb.projects[idx]], rowCount: 1 };
    }
  }
  
  // Get credits
  if (t.includes('select credits from public.users')) {
    const u = mockDb.users.find(u => u.user_id === params![0]) || mockDb.users[0];
    return { rows: [u], rowCount: 1 };
  }
  
  // User select
  if (t.includes('from public.users where email')) {
    return { rows: [mockDb.users[0]], rowCount: 1 };
  }

  // Update credits
  if (t.includes('update public.users set credits')) {
    const idx = mockDb.users.findIndex(u => u.user_id === params![1]);
    if (idx !== -1) {
      mockDb.users[idx].credits = params![0];
      return { rows: [mockDb.users[idx]], rowCount: 1 };
    }
  }

  // Fallback for CREATE TABLE or other commands
  return { rows: [], rowCount: 0 };
}

export async function query(text: string, params?: any[]) {
  if (!pool || process.env.NODE_ENV !== 'production') {
    // If not in production, try to use real DB if URL is provided, but fallback to mock on failure
    if (pool) {
      try {
        return await pool.query(text, params);
      } catch (err) {
        // console.log('Real DB query failed in local dev, falling back to mock DB:', err);
        return parseQueryAndMock(text, params);
      }
    } else {
      return parseQueryAndMock(text, params);
    }
  }
  
  // Production requires a real DB
  return pool.query(text, params);
}
