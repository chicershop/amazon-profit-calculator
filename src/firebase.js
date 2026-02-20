/**
 * Firebase 初期化
 * .env に REACT_APP_FIREBASE_* を設定してください
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const requiredEnvKeys = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
];
const hasAllEnv = requiredEnvKeys.every((key) => process.env[key]);

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// 6つすべての環境変数が揃っているときだけ初期化（未設定・不足時はローカルのみ利用）
let app = null;
try {
  if (hasAllEnv) {
    app = initializeApp(firebaseConfig);
  }
} catch (e) {
  console.warn('Firebase 初期化エラー:', e);
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const isFirebaseEnabled = !!app;

/** 本番で Firebase が無効なとき、未設定の環境変数名の一覧（Vercel で追加する際の参考用） */
export function getMissingFirebaseEnvKeys() {
  return requiredEnvKeys.filter((key) => !process.env[key]);
}
