/**
 * Firestore の履歴を購読し、useHistory と同じインターフェースを提供
 */
import { useState, useEffect, useCallback } from 'react';
import {
  subscribeHistory,
  addHistoryItem,
  updateHistoryItem,
  deleteHistoryItem,
  clearHistoryItems,
} from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';

export function useFirestoreHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }
    const unsubscribe = subscribeHistory(setHistory);
    return () => unsubscribe();
  }, [user]);

  const addHistory = useCallback(
    async (item) => {
      const id = await addHistoryItem(item, user?.uid ?? null);
      return id;
    },
    [user]
  );

  const updateHistory = useCallback(async (id, updates) => {
    await updateHistoryItem(id, updates);
  }, []);

  const deleteHistory = useCallback(async (id) => {
    await deleteHistoryItem(id);
  }, []);

  const clearHistory = useCallback(async () => {
    await clearHistoryItems();
  }, []);

  const getHistoryById = useCallback(
    (id) => history.find((item) => item.id === id),
    [history]
  );

  return {
    history,
    addHistory,
    updateHistory,
    deleteHistory,
    clearHistory,
    getHistoryById,
  };
}
