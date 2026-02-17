/**
 * 認証コンテキスト：ログイン状態・オーナー判定
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isFirebaseEnabled } from '../firebase';
import { getConfig, setOwner as setOwnerInFirestore } from '../services/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ownerUid, setOwnerUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ownerSetupDismissed, setOwnerSetupDismissed] = useState(false);

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
      setOwnerUid(null);
      return;
    }
    let cancelled = false;
    getConfig()
      .then((config) => {
        if (!cancelled && config?.ownerUid) setOwnerUid(config.ownerUid);
        else if (!cancelled) setOwnerUid(null);
      })
      .catch(() => {
        if (!cancelled) setOwnerUid(null);
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
  const showOwnerSetup = !!user && ownerUid === null && !ownerSetupDismissed;

  const value = {
    user,
    loading,
    isOwner,
    ownerUid,
    isFirebaseEnabled,
    signIn,
    signUp,
    signOut,
    setOwner,
    canSetOwner: !!user && ownerUid === null,
    showOwnerSetup,
    dismissOwnerSetup: () => setOwnerSetupDismissed(true),
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
