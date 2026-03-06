/**
 * Firestore 履歴・設定の読み書き
 */
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

const CONFIG_COLLECTION = 'config';
const CONFIG_WORKSPACE = 'workspace';
const HISTORY_COLLECTION = 'history';

/** 設定（オーナーUID）を取得 */
export async function getConfig() {
  if (!db) return null;
  const ref = doc(db, CONFIG_COLLECTION, CONFIG_WORKSPACE);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/** オーナーを設定（初回のみ推奨） */
export async function setOwner(ownerUid) {
  if (!db) throw new Error('Firebase が無効です');
  const ref = doc(db, CONFIG_COLLECTION, CONFIG_WORKSPACE);
  await setDoc(ref, { ownerUid, approvedEmails: [], pendingAccess: [] }, { merge: true });
}

/** アクセス承認待ちを1件追加（新規登録者がログインしたときに呼ぶ） */
export async function addPendingAccess(uid, email) {
  if (!db) throw new Error('Firebase が無効です');
  const ref = doc(db, CONFIG_COLLECTION, CONFIG_WORKSPACE);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const pending = data.pendingAccess || [];
  if (pending.some((p) => p.email === email)) return;
  await updateDoc(ref, {
    pendingAccess: [...pending, { uid, email, requestedAt: new Date().toISOString() }],
  });
}

/** 承認待ちから1件削除（拒否時） */
export async function removePendingAccess(email) {
  if (!db) throw new Error('Firebase が無効です');
  const ref = doc(db, CONFIG_COLLECTION, CONFIG_WORKSPACE);
  const snap = await getDoc(ref);
  const data = snap.data() || {};
  const pending = (data.pendingAccess || []).filter((p) => p.email !== email);
  await updateDoc(ref, { pendingAccess: pending });
}

/** メールアドレスを承認（approvedEmails に追加し、pending から削除） */
export async function approveAccess(email) {
  if (!db) throw new Error('Firebase が無効です');
  const ref = doc(db, CONFIG_COLLECTION, CONFIG_WORKSPACE);
  const snap = await getDoc(ref);
  const data = snap.data() || {};
  const approved = [...(data.approvedEmails || []).filter((e) => e !== email), email];
  const pending = (data.pendingAccess || []).filter((p) => p.email !== email);
  await updateDoc(ref, { approvedEmails: approved, pendingAccess: pending });
}

/** メールアドレスのアクセスを無効化（approvedEmails から削除） */
export async function revokeAccess(email) {
  if (!db) throw new Error('Firebase が無効です');
  const ref = doc(db, CONFIG_COLLECTION, CONFIG_WORKSPACE);
  const snap = await getDoc(ref);
  const data = snap.data() || {};
  const approved = (data.approvedEmails || []).filter((e) => e !== email);
  await updateDoc(ref, { approvedEmails: approved });
}

/** 履歴一覧をリアルタイム購読 */
export function subscribeHistory(callback) {
  if (!db) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, HISTORY_COLLECTION),
    orderBy('createdAtOrder', 'desc')
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => {
      const data = d.data();
      const createdAt = data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAtOrder ?? data.createdAt;
      const updatedAt = data.updatedAt?.toDate?.()?.toISOString?.() ?? data.updatedAtOrder ?? data.updatedAt;
      const { createdAtOrder, updatedAtOrder, ...rest } = data;
      return {
        id: d.id,
        ...rest,
        createdAt,
        updatedAt,
      };
    });
    callback(items);
  });
  return unsubscribe;
}

/** 履歴を1件追加（createdAt をクライアント日時でも持たせてソート可能に） */
export async function addHistoryItem(item, createdBy) {
  if (!db) throw new Error('Firebase が無効です');
  const now = new Date().toISOString();
  const payload = {
    ...item,
    createdBy: createdBy || null,
    createdAt: serverTimestamp(),
    createdAtOrder: now,
    updatedAt: serverTimestamp(),
    updatedAtOrder: now,
  };
  const ref = await addDoc(collection(db, HISTORY_COLLECTION), payload);
  return ref.id;
}

/** 履歴を更新 */
export async function updateHistoryItem(id, updates) {
  if (!db) throw new Error('Firebase が無効です');
  const ref = doc(db, HISTORY_COLLECTION, id);
  const { updatedAt: _u, ...rest } = updates;
  await updateDoc(ref, {
    ...rest,
    updatedAt: serverTimestamp(),
    updatedAtOrder: new Date().toISOString(),
  });
}

/** 履歴を1件削除 */
export async function deleteHistoryItem(id) {
  if (!db) throw new Error('Firebase が無効です');
  await deleteDoc(doc(db, HISTORY_COLLECTION, id));
}

/** 履歴を全件削除 */
export async function clearHistoryItems() {
  if (!db) throw new Error('Firebase が無効です');
  const snapshot = await getDocs(collection(db, HISTORY_COLLECTION));
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
