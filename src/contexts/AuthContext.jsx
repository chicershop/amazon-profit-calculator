/**
 * 認証コンテキスト：ログイン状態・オーナー判定・アクセス承認
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isFirebaseEnabled } from '../firebase';
import { getConfig, setOwner as setOwnerInFirestore, addPendingAccess } from '../services/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ownerSetupDismissed, setOwnerSetupDismissed] = useState(false);

  const ownerUid = config?.ownerUid ?? null;
  const approvedEmails = config?.approvedEmails || [];
  const pendingAccess = config?.pendingAccess || [];

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!isFirebaseEnabled || !user) {
      setConfig(null);
      return;
    }
    let cancelled = false;
    getConfig()
      .then((c) => {
        if (!cancelled) setConfig(c || null);
      })
      .catch(() => {
        if (!cancelled) setConfig(null);
      });
    return () => { cancelled = true; };
  }, [user]);

  const signIn = useCallback(async (email, password) => {
    if (!auth) throw new Error('Firebase が無効です');
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async (email, password) => {
    if (!auth) throw new Error('Firebase が無効です');
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const signOut = useCallback(async () => {
    if (auth) await firebaseSignOut(auth);
  }, []);

  const setOwner = useCallback(async () => {
    if (!user) throw new Error('ログインしてください');
    await setOwnerInFirestore(user.uid);
    setOwnerUid(user.uid);
  }, [user]);

  const isOwner = !!user && !!ownerUid && user.uid === ownerUid;
  const isApprovedUser = !!user && (isOwner || (user.email && approvedEmails.includes(user.email)));
  const showOwnerSetup = !!user && ownerUid === null && !ownerSetupDismissed;

  /** 承認待ちリストに自分を追加（未承認ユーザーがログインしたとき1回だけ） */
  const ensurePendingRequest = useCallback(async () => {
    if (!user?.email || isOwner || isApprovedUser) return;
    if (pendingAccess.some((p) => p.email === user.email)) return;
    try {
      await addPendingAccess(user.uid, user.email);
    } catch (_) {}
  }, [user, isOwner, isApprovedUser, pendingAccess]);

  const refreshConfig = useCallback(async () => {
    if (!isFirebaseEnabled || !user) return;
    const c = await getConfig();
    setConfig(c || null);
  }, [user]);

  const value = {
    user,
    loading,
    config,
    setConfig,
    refreshConfig,
    isOwner,
    ownerUid,
    isApprovedUser,
    approvedEmails,
    pendingAccess,
    isFirebaseEnabled,
    signIn,
    signUp,
    signOut,
    setOwner,
    canSetOwner: !!user && ownerUid === null,
    showOwnerSetup,
    dismissOwnerSetup: () => setOwnerSetupDismissed(true),
    ensurePendingRequest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth は AuthProvider 内で使用してください');
  return ctx;
}
