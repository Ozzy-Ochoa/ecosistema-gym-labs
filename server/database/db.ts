import fs from 'fs';
import path from 'path';

export type ServerUserRole = 'USER' | 'COACH' | 'NUTRITIONIST' | 'GYM' | 'ADMIN' | 'ATHLETE';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // scrypt salt:hash
  recoveryKeyHash: string;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  pinHash?: string;
  role: ServerUserRole;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserDatabasePartition {
  user: UserRecord;
  workouts: any[];
  nutrition: any[];
  sleep: any[];
  body: any[];
  auditLogs: any[];
  vault: Record<string, string>;
  relationships?: any[];
  invitations?: any[];
  messages?: any[];
}

const DATA_DIR = path.join(process.cwd(), 'data_store');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getUserFilePath(userId: string): string {
  // Sanitize user ID to prevent path traversal
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(DATA_DIR, `user_${safeId}.json`);
}

function getIndexFilePath(): string {
  return path.join(DATA_DIR, 'users_index.json');
}

// Atomic file write using temporary file and rename to avoid corruption
export function writeAtomic(filePath: string, data: any): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tmpPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 8)}`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpPath, filePath);
}

// User Index Management (for email lookup & tenant routing)
export interface UserIndexEntry {
  id: string;
  email: string;
  createdAt: string;
}

export function readUsersIndex(): UserIndexEntry[] {
  const file = getIndexFilePath();
  if (!fs.existsSync(file)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading users index:', err);
    return [];
  }
}

export function writeUsersIndex(index: UserIndexEntry[]): void {
  writeAtomic(getIndexFilePath(), index);
}

// Read Tenant Data
export function readUserPartition(userId: string): UserDatabasePartition | null {
  const file = getUserFilePath(userId);
  if (!fs.existsSync(file)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading partition for user ${userId}:`, err);
    return null;
  }
}

// Write Tenant Data atomically
export function writeUserPartition(userId: string, data: UserDatabasePartition): void {
  const file = getUserFilePath(userId);
  writeAtomic(file, data);
}

// Delete Tenant Data (LGPD Right to be Forgotten / Expurgo Atômico)
export function deleteUserPartition(userId: string): boolean {
  const file = getUserFilePath(userId);
  let deleted = false;
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    deleted = true;
  }

  // Update index
  const index = readUsersIndex();
  const filtered = index.filter((u) => u.id !== userId);
  writeUsersIndex(filtered);

  return deleted;
}
