// src/Hooks/RouteStorageContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/Auth/AuthContext';
import { db } from '../firebase';
import {
    collection, addDoc, deleteDoc, doc, onSnapshot, query,
    updateDoc, Timestamp, getDocs, setDoc, getDoc, orderBy
} from 'firebase/firestore';
import toast from 'react-hot-toast';

const RouteContext = createContext();

export function useRoutesStorage() {
  return useContext(RouteContext);
}

export function RouteStorageProvider({ children }) {
  const { currentUser } = useAuth();
  const [userRoutes, setUserRoutes] = useState([]);
  const [publicRoutes, setPublicRoutes] = useState([]);
  const [favoritePublicRouteIds, setFavoritePublicRouteIds] = useState(new Set());
  const [loadingUserRoutes, setLoadingUserRoutes] = useState(true);
  const [loadingPublicRoutes, setLoadingPublicRoutes] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // Načítání soukromých tras (real-time)
  useEffect(() => {
    if (!currentUser) { setUserRoutes([]); setLoadingUserRoutes(false); return; }
    setLoadingUserRoutes(true);
    const unsubscribe = onSnapshot(collection(db, `user_routes/${currentUser.uid}/routes`), (snap) => {
      setUserRoutes(snap.docs.map(doc => ({
        id: doc.id, ...doc.data(),
        savedDate: doc.data().savedDate?.toDate().toLocaleDateString('cs-CZ'),
        points: typeof doc.data().points === 'string' ? JSON.parse(doc.data().points) : doc.data().points || []
      })));
      setLoadingUserRoutes(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Načítání oblíbených (real-time)
  useEffect(() => {
    if (!currentUser) { setFavoritePublicRouteIds(new Set()); setLoadingFavorites(false); return; }
    setLoadingFavorites(true);
    const unsubscribe = onSnapshot(collection(db, `user_favorites/${currentUser.uid}/favorite_public_routes`), (snap) => {
      const ids = new Set();
      snap.forEach(doc => ids.add(doc.id));
      setFavoritePublicRouteIds(ids);
      setLoadingFavorites(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Načtení veřejných tras
  const fetchPublicRoutes = useCallback(async () => {
    setLoadingPublicRoutes(true);
    try {
      const snap = await getDocs(collection(db, 'public_routes'));
      setPublicRoutes(snap.docs.map(doc => ({
        id: doc.id, ...doc.data(),
        savedDate: doc.data().savedDate?.toDate().toLocaleDateString('cs-CZ'),
        points: typeof doc.data().points === 'string' ? JSON.parse(doc.data().points) : doc.data().points || [],
        avgRating: doc.data().avgRating || 0,
        reviewCount: doc.data().reviewCount || 0
      })));
    } catch (e) { console.error(e); }
    finally { setLoadingPublicRoutes(false); }
  }, []);

  // Přidání recenze
  const addReview = useCallback(async (routeId, rating, comment) => {
    if (!currentUser) return null;
    try {
      const reviewData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        rating: Number(rating),
        comment: comment,
        createdAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, `public_routes/${routeId}/reviews`), reviewData);

      try {
        const routeRef = doc(db, `public_routes/${routeId}`);
        const snap = await getDoc(routeRef);
        if (snap.exists()) {
          const d = snap.data();
          const nCount = (d.reviewCount || 0) + 1;
          const nAvg = (((d.avgRating || 0) * (d.reviewCount || 0)) + rating) / nCount;
          await updateDoc(routeRef, { avgRating: nAvg, reviewCount: nCount });
          setPublicRoutes(prev => prev.map(r => r.id === routeId ? { ...r, avgRating: nAvg, reviewCount: nCount } : r));
        }
      } catch (e) { console.warn("Průměr neaktualizován - chybí práva"); }
      
      toast.success("Recenze odeslána!");
      return { id: docRef.id, ...reviewData };
    } catch (e) { 
      toast.error("Chyba při hodnocení."); 
      return null;
    }
  }, [currentUser]);

  // Načtení recenzí
  const getReviews = useCallback(async (routeId) => {
    try {
      const q = query(collection(db, `public_routes/${routeId}/reviews`), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() 
      }));
    } catch (e) {
      console.error("Chyba při načítání:", e);
      return [];
    }
  }, []);

  // Uložení trasy
  const saveRoute = useCallback(async (routeData, makePublic = false) => {
    if (!currentUser) return null;
    const data = { ...routeData, points: JSON.stringify(routeData.points), savedDate: Timestamp.now(), userId: currentUser.uid, avgRating: 0, reviewCount: 0 };
    const ref = await addDoc(collection(db, `user_routes/${currentUser.uid}/routes`), { ...data, isFavorite: false });
    if (makePublic) await addDoc(collection(db, 'public_routes'), data);
    return ref.id;
  }, [currentUser]);

  // Přepnutí oblíbené trasy
  const toggleFavorite = useCallback(async (id, isPublic = false) => {
    if (!currentUser) return;
    const ref = doc(db, isPublic ? `user_favorites/${currentUser.uid}/favorite_public_routes/${id}` : `user_routes/${currentUser.uid}/routes/${id}`);
    if (isPublic) {
        favoritePublicRouteIds.has(id) ? await deleteDoc(ref) : await setDoc(ref, { at: Timestamp.now() });
    } else {
        const r = userRoutes.find(r => r.id === id);
        await updateDoc(ref, { isFavorite: !r.isFavorite });
    }
  }, [currentUser, userRoutes, favoritePublicRouteIds]);

  // 💥 OPRAVENO: Mazání trasy (přidána závislost [currentUser])
  const deleteRoute = useCallback(async (id, isPublic = false) => {
    if (!currentUser) return;
    
    try {
        const docRef = doc(db, isPublic ? `public_routes/${id}` : `user_routes/${currentUser.uid}/routes/${id}`);
        await deleteDoc(docRef);
        
        if (isPublic) {
            setPublicRoutes(prev => prev.filter(r => r.id !== id));
        }
        toast.success("Trasa smazána.");
    } catch (error) {
        console.error("Chyba mazání:", error);
        toast.error("Nepodařilo se smazat trasu.");
    }
  }, [currentUser]); // Důležité: currentUser musí být v závislostech

  const value = { 
    userRoutes, 
    publicRoutes, 
    favoritePublicRouteIds, 
    loadingUserRoutes, 
    loadingPublicRoutes, 
    loadingFavorites, 
    fetchPublicRoutes, 
    saveRoute, 
    deleteRoute, 
    toggleFavorite, 
    addReview, 
    getReviews, 
    getRouteById: (id) => userRoutes.find(r => r.id === id) || publicRoutes.find(r => r.id === id) 
  };
  
  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}