
import { Site, Worker, Attendance, Transaction, AppState, TransactionType, User, UserRole } from '../types';

const STORAGE_KEY = 'civic_logix_db_v3';

const INITIAL_DATA: AppState = {
  adminPhone: '0000000000',
  adminPassword: 'admin',
  sites: [
    { id: 's1', name: 'Emerald Heights', location: 'North Wing', lat: 34.0522, lng: -118.2437, clientName: 'Vertex Corp', budget: 1200000, status: 'ongoing' },
    { id: 's2', name: 'River Terminal', location: 'East Quay', lat: 34.0622, lng: -118.2537, clientName: 'Port Authority', budget: 450000, status: 'ongoing' }
  ],
  workers: [
    { id: 'w1', name: 'Alex Thompson', role: 'Chief Engineer', dailyRate: 450, assignedSiteId: 's1', phone: '1234567890', password: '123' },
    { id: 'w2', name: 'Jordan Lee', role: 'Site Supervisor', dailyRate: 320, assignedSiteId: 's2', phone: '0987654321', password: '123' }
  ],
  attendance: [],
  transactions: [
    { id: 't1', siteId: 's1', type: TransactionType.INCOME, amount: 250000, description: 'Q3 Milestone Deposit', date: new Date() }
  ]
};

const getDB = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return INITIAL_DATA;
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    attendance: (parsed.attendance || []).map((a: any) => ({
      ...a,
      punchIn: new Date(a.punchIn),
      punchOut: a.punchOut ? new Date(a.punchOut) : undefined
    })),
    transactions: (parsed.transactions || []).map((t: any) => ({
      ...t,
      date: new Date(t.date)
    }))
  };
};

const saveDB = (db: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const ApiService = {
  async getInitialState(): Promise<AppState> {
    await delay(800);
    return getDB();
  },

  async login(phone: string, password: string): Promise<User> {
    await delay(1000);
    const db = getDB();
    
    // Check Admin
    if (phone === db.adminPhone && password === db.adminPassword) {
      return { id: 'admin-1', name: 'Master Engineer', role: UserRole.ADMIN, phone: db.adminPhone };
    }

    // Check Worker
    const worker = db.workers.find(w => w.phone === phone && w.password === password);
    if (worker) {
      return { 
        id: `u-${worker.id}`, 
        name: worker.name, 
        role: UserRole.WORKER, 
        phone: worker.phone, 
        workerId: worker.id 
      };
    }

    throw new Error('Invalid phone number or password');
  },

  async resetPassword(phone: string): Promise<string> {
    await delay(1000);
    const db = getDB();
    const exists = phone === db.adminPhone || db.workers.some(w => w.phone === phone);
    if (!exists) throw new Error('Phone number not registered');
    return 'OTP sent to your mobile device';
  },

  async addSite(site: Site): Promise<Site> {
    await delay();
    const db = getDB();
    const newSite = { ...site, id: 's-' + Math.random().toString(36).substr(2, 5) };
    db.sites.push(newSite);
    saveDB(db);
    return newSite;
  },

  async updateSite(site: Site): Promise<Site> {
    await delay();
    const db = getDB();
    db.sites = db.sites.map(s => s.id === site.id ? site : s);
    saveDB(db);
    return site;
  },

  async addWorker(worker: Worker): Promise<Worker> {
    await delay();
    const db = getDB();
    // Default password for new workers
    const newWorker = { ...worker, id: 'w-' + Math.random().toString(36).substr(2, 5), password: '123' };
    db.workers.push(newWorker);
    saveDB(db);
    return newWorker;
  },

  async updateWorker(worker: Worker): Promise<Worker> {
    await delay();
    const db = getDB();
    db.workers = db.workers.map(w => w.id === worker.id ? worker : w);
    saveDB(db);
    return worker;
  },

  async punchIn(attendance: Attendance): Promise<Attendance> {
    await delay();
    const db = getDB();
    const newAtt = { ...attendance, id: 'att-' + Date.now() };
    db.attendance.push(newAtt);
    saveDB(db);
    return newAtt;
  },

  async punchOut(attendance: Attendance): Promise<Attendance> {
    await delay();
    const db = getDB();
    db.attendance = db.attendance.map(a => a.id === attendance.id ? attendance : a);
    saveDB(db);
    return attendance;
  },

  async addTransaction(transaction: Transaction): Promise<Transaction> {
    await delay();
    const db = getDB();
    const newTx = { ...transaction, id: 'tx-' + Date.now() };
    db.transactions.push(newTx);
    saveDB(db);
    return newTx;
  }
};
