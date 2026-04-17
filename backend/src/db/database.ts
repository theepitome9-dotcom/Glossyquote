import { Database } from 'bun:sqlite';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'glossy.db');

let db: Database;

export function getDb(): Database {
  if (!db) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    db = new Database(DB_PATH, { create: true });
    db.exec('PRAGMA journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS job_postings (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT NOT NULL,
      trade_category TEXT NOT NULL,
      description TEXT NOT NULL,
      postcode TEXT,
      estimate_paid INTEGER DEFAULT 0,
      estimate_min_price REAL,
      estimate_max_price REAL,
      image_count INTEGER DEFAULT 0,
      posted_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS app_users (
      id TEXT PRIMARY KEY,
      user_type TEXT NOT NULL CHECK(user_type IN ('customer', 'professional')),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      trade_categories TEXT,
      is_premium INTEGER DEFAULT 0,
      registered_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lead_purchases (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      professional_id TEXT NOT NULL,
      professional_name TEXT NOT NULL,
      professional_email TEXT NOT NULL,
      professional_phone TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT NOT NULL,
      trade_category TEXT NOT NULL,
      postcode TEXT,
      credits_spent INTEGER NOT NULL,
      is_premium INTEGER DEFAULT 0,
      purchased_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS credit_purchases (
      id TEXT PRIMARY KEY,
      professional_id TEXT NOT NULL,
      professional_name TEXT NOT NULL,
      professional_email TEXT NOT NULL,
      package_id TEXT NOT NULL,
      package_name TEXT NOT NULL,
      credits_granted INTEGER NOT NULL DEFAULT 0,
      is_subscription INTEGER DEFAULT 0,
      amount_gbp REAL,
      purchased_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS professional_profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      trade_categories TEXT NOT NULL,
      profile_description TEXT,
      rating REAL DEFAULT 0,
      total_reviews INTEGER DEFAULT 0,
      reviews_json TEXT DEFAULT '[]',
      portfolio_json TEXT DEFAULT '[]',
      is_premium INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migration: make customer_email nullable in existing databases
  try {
    db.exec(`ALTER TABLE job_postings ADD COLUMN _email_nullable TEXT`);
  } catch { /* column already exists or table already correct */ }

  // Migration: ensure professional_profiles table exists on existing databases
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS professional_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        trade_categories TEXT NOT NULL,
        profile_description TEXT,
        rating REAL DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        reviews_json TEXT DEFAULT '[]',
        portfolio_json TEXT DEFAULT '[]',
        is_premium INTEGER DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  } catch { /* already exists */ }
}
