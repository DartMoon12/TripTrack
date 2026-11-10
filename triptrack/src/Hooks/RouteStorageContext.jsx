// src/Hooks/RouteStorageContext.jsx
// Jedno místo, které se stará o všechna data tras ve Firestore:
// moje trasy, veřejné trasy, oblíbené a recenze.

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../components/Auth/AuthContext';
import { db } from '../firebase';
import {
  collection, addDoc, deleteDoc, doc, onSnapshot, query,
  updateDoc, Timestamp, getDocs, setDoc, getDoc, orderBy,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { parsePoints } from '../utils/routeUtils';

const RouteContext = createContext();

export function useRoutesStorage() {
  return useContext(RouteContext);
}

// Převod dokumentu z Firestore do tvaru, se kterým pracuje aplikace.
function normalizeRoute(snap, extra = {}) {
  const d = snap.data();
  const savedAt = d.savedDate?.toDate?.() ?? null;
  return {
    id: snap.id,
    ...d,
    name: d.name || 'Bez názvu',
    savedAt,
    savedDate: savedAt ? savedAt.toLocaleDateString('cs-CZ') : '',
    points: parsePoints(d.points),
    tags: Array.isArray(d.tags) ? d.tags : [],
    avgRating: d.avgRating || 0,
    reviewCount: d.reviewCount || 0,
    ...extra,
  };
}

function displayNameOf(user) {
  return user?.displayName || user?.email?.split('@')[0] || 'Anonym';
}

export function RouteStorageProvider({ children }) {
  const { currentUser } = useAuth();

  const [userRoutes, setUserRoutes] = useState([]);
  const [publicRoutes, setPublicRoutes] = useState([]);
  const [publicLoaded, setPublicLoaded] = useState(false);
  // Set = rychlé "je to v oblíbených?" přes .has(id)
  const [favoritePublicRouteIds, setFavoritePublicRouteIds] = useState(new Set());

  const [loadingUserRoutes, setLoadingUserRoutes] = useState(true);
  const [loadingPublicRoutes, setLoadingPublicRoutes] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // --- Moje trasy (živě přes onSnapshot) ---
  useEffect(() => {
    if (!currentUser) { setUserRoutes([]); setLoadingUserRoutes(false); return; }
    setLoadingUserRoutes(true);
    const unsubscribe = onSnapshot(
      collection(db, `user_routes/${currentUser.uid}/routes`),
      (snap) => {
        setUserRoutes(snap.docs.map((d) => normalizeRoute(d, { isOwn: true })));
        setLoadingUserRoutes(false);
      },
      (err) => {
        console.error('Načtení mých tras selhalo:', err);
        toast.error('Nepodařilo se načíst vaše trasy.');
        setLoadingUserRoutes(false);
      },
    );
    return unsubscribe;
  }, [currentUser]);

  // --- Oblíbené veřejné trasy (živě) ---
  useEffect(() => {
    if (!currentUser) { setFavoritePublicRouteIds(new Set()); setLoadingFavorites(false); return; }
    setLoadingFavorites(true);
    const unsubscribe = onSnapshot(
      collection(db, `user_favorites/${currentUser.uid}/favorite_public_routes`),
      (snap) => {
        setFavoritePublicRouteIds(new Set(snap.docs.map((d) => d.id)));
        setLoadingFavorites(false);
      },
      (err) => {
        console.error('Načtení oblíbených selhalo:', err);
        setLoadingFavorites(false);
      },
    );
    return unsubscribe;
  }, [currentUser]);

  // Po odhlášení zahodíme i veřejné trasy, ať se znovu načtou pro dalšího uživatele
  useEffect(() => {
    if (!currentUser) { setPublicRoutes([]); setPublicLoaded(false); }
  }, [currentUser]);

  // --- Veřejné trasy (jednorázově, při otevření záložky) ---
  const fetchPublicRoutes = useCallback(async ({ force = false } = {}) => {
    if (publicLoaded && !force) return;
    setLoadingPublicRoutes(true);
    try {
      const snap = await getDocs(collection(db, 'public_routes'));
      setPublicRoutes(snap.docs.map((d) => normalizeRoute(d, { isPublic: true })));
      setPublicLoaded(true);
    } catch (e) {
      console.error('Načtení veřejných tras selhalo:', e);
      toast.error('Nepodařilo se načíst trasy komunity.');
    } finally {
      setLoadingPublicRoutes(false);
    }
  }, [publicLoaded]);

  // --- Jedna trasa podle ID (i když ještě není načtená v seznamu) ---
  // Hodí se pro sdílený odkaz /mapa?routeId=...
  const fetchRouteById = useCallback(async (id) => {
    const local = userRoutes.find((r) => r.id === id) || publicRoutes.find((r) => r.id === id);
    if (local) return local;
    try {
      if (currentUser) {
        const own = await getDoc(doc(db, `user_routes/${currentUser.uid}/routes/${id}`));
        if (own.exists()) return normalizeRoute(own, { isOwn: true });
      }
      const pub = await getDoc(doc(db, `public_routes/${id}`));
      if (pub.exists()) return normalizeRoute(pub, { isPublic: true });
    } catch (e) {
      console.error('Načtení trasy selhalo:', e);
    }
    return null;
  }, [currentUser, userRoutes, publicRoutes]);

  // --- Recenze ---
  const addReview = useCallback(async (routeId, rating, comment) => {
    if (!currentUser) return null;
    try {
      const reviewData = {
        userId: currentUser.uid,
        userName: displayNameOf(currentUser),
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: Timestamp.now(),
      };
      const docRef = await addDoc(collection(db, `public_routes/${routeId}/reviews`), reviewData);

      // Přepočet průměru. Pokud na to pravidla Firestore nedají práva, recenze zůstane uložená.
      try {
        const routeRef = doc(db, `public_routes/${routeId}`);
        const snap = await getDoc(routeRef);
        if (snap.exists()) {
          const d = snap.data();
          const count = (d.reviewCount || 0) + 1;
          const avg = (((d.avgRating || 0) * (d.reviewCount || 0)) + Number(rating)) / count;
          await updateDoc(routeRef, { avgRating: avg, reviewCount: count });
          setPublicRoutes((prev) => prev.map((r) => (r.id === routeId ? { ...r, avgRating: avg, reviewCount: count } : r)));
        }
      } catch {
        console.warn('Průměrné hodnocení se nepodařilo aktualizovat (chybí práva).');
      }

      toast.success('Recenze odeslána!');
      return { id: docRef.id, ...reviewData, createdAt: reviewData.createdAt.toDate() };
    } catch (e) {
      console.error(e);
      toast.error('Recenzi se nepodařilo odeslat.');
      return null;
    }
  }, [currentUser]);

  const getReviews = useCallback(async (routeId) => {
    try {
      const q = query(collection(db, `public_routes/${routeId}/reviews`), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate() }));
    } catch (e) {
      console.error('Načtení recenzí selhalo:', e);
      return [];
    }
  }, []);

  // --- Uložení nové trasy ---
  // Vyhazuje chybu, aby volající mohl ukázat, že se uložení nepovedlo.
  const saveRoute = useCallback(async (routeData, makePublic = false) => {
    if (!currentUser) throw new Error('Nejste přihlášeni.');

    const data = {
      ...routeData,
      // Body ukládáme jako text (JSON) – stejně jako starší trasy, aby šly dál číst
      points: JSON.stringify(routeData.points),
      savedDate: Timestamp.now(),
      userId: currentUser.uid,
      userName: displayNameOf(currentUser),
      avgRating: 0,
      reviewCount: 0,
    };

    // 1. Vždy uložit do mých tras
    const ref = await addDoc(collection(db, `user_routes/${currentUser.uid}/routes`), { ...data, isFavorite: false });

    // 2. Případně veřejná kopie. Když selže, soukromá trasa zůstane uložená.
    if (makePublic) {
      try {
        const pubRef = await addDoc(collection(db, 'public_routes'), data);
        await updateDoc(ref, { publicId: pubRef.id });
        setPublicLoaded(false); // při příštím otevření komunity načíst znovu
      } catch (e) {
        console.error('Zveřejnění selhalo:', e);
        toast.error('Trasa je uložená, ale zveřejnit ji se nepodařilo.');
      }
    }
    return ref.id;
  }, [currentUser]);

  // --- Oblíbené ---
  const toggleFavorite = useCallback(async (id, isPublic = false) => {
    if (!currentUser) return;
    try {
      if (isPublic) {
        const ref = doc(db, `user_favorites/${currentUser.uid}/favorite_public_routes/${id}`);
        if (favoritePublicRouteIds.has(id)) {
          await deleteDoc(ref);
        } else {
          await setDoc(ref, { at: Timestamp.now() });
          toast.success('Přidáno do oblíbených');
        }
      } else {
        const route = userRoutes.find((r) => r.id === id);
        if (!route) return;
        await updateDoc(doc(db, `user_routes/${currentUser.uid}/routes/${id}`), { isFavorite: !route.isFavorite });
        if (!route.isFavorite) toast.success('Přidáno do oblíbených');
      }
    } catch (e) {
      console.error(e);
      toast.error('Oblíbené se nepodařilo změnit.');
    }
  }, [currentUser, userRoutes, favoritePublicRouteIds]);

  // --- Mazání ---
  const deleteRoute = useCallback(async (id, isPublic = false) => {
    if (!currentUser) return;
    try {
      if (isPublic) {
        await deleteDoc(doc(db, `public_routes/${id}`));
        setPublicRoutes((prev) => prev.filter((r) => r.id !== id));
        // Odebereme odkaz na veřejnou kopii z mé soukromé trasy
        const own = userRoutes.find((r) => r.publicId === id);
        if (own) await updateDoc(doc(db, `user_routes/${currentUser.uid}/routes/${own.id}`), { publicId: null });
      } else {
        await deleteDoc(doc(db, `user_routes/${currentUser.uid}/routes/${id}`));
      }
      toast.success('Trasa smazána.');
    } catch (error) {
      console.error('Chyba mazání:', error);
      toast.error('Trasu se nepodařilo smazat.');
    }
  }, [currentUser, userRoutes]);

  const value = useMemo(() => ({
    userRoutes,
    publicRoutes,
    favoritePublicRouteIds,
    loadingUserRoutes,
    loadingPublicRoutes,
    loadingFavorites,
    fetchPublicRoutes,
    fetchRouteById,
    saveRoute,
    deleteRoute,
    toggleFavorite,
    addReview,
    getReviews,
  }), [
    userRoutes, publicRoutes, favoritePublicRouteIds,
    loadingUserRoutes, loadingPublicRoutes, loadingFavorites,
    fetchPublicRoutes, fetchRouteById, saveRoute, deleteRoute, toggleFavorite, addReview, getReviews,
  ]);

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}
