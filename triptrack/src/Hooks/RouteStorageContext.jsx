// src/Hooks/RouteStorageContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/Auth/AuthContext';
import { db } from '../firebase';
import {
    collection, addDoc, deleteDoc, doc, onSnapshot, query,
    updateDoc, Timestamp, getDocs,
    // 💥 Potřebujeme 'setDoc' a 'getDoc' pro práci s oblíbenými ID
    setDoc, getDoc
} from 'firebase/firestore';
import toast from 'react-hot-toast';

const appId = 'triptrack-700a4';

const RouteContext = createContext();

export function useRoutesStorage() {
  return useContext(RouteContext);
}

export function RouteStorageProvider({ children }) {
  const { currentUser } = useAuth();
  const [userRoutes, setUserRoutes] = useState([]);
  const [publicRoutes, setPublicRoutes] = useState([]);
  // 💥 NOVÝ STAV: Set ID oblíbených VEŘEJNÝCH tras
  const [favoritePublicRouteIds, setFavoritePublicRouteIds] = useState(new Set());
  const [loadingUserRoutes, setLoadingUserRoutes] = useState(true);
  const [loadingPublicRoutes, setLoadingPublicRoutes] = useState(false);
  // 💥 NOVÝ STAV: Načítání oblíbených ID
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // Efekt pro načítání SOUKROMÝCH tras (beze změny)
  useEffect(() => {
    // ... (kód zůstává stejný) ...
    if (!currentUser) { setUserRoutes([]); setLoadingUserRoutes(false); return; }
    setLoadingUserRoutes(true);
    const userRoutesCollectionPath = `user_routes/${currentUser.uid}/routes`;
    const q = query(collection(db, userRoutesCollectionPath));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const routesData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data(); routesData.push({ id: doc.id, ...data, savedDate: data.savedDate instanceof Timestamp ? data.savedDate.toDate().toLocaleDateString('cs-CZ') : data.savedDate, points: typeof data.points === 'string' ? JSON.parse(data.points) : data.points || [] });
      });
      setUserRoutes(routesData); setLoadingUserRoutes(false);
    }, (error) => { console.error("Error fetching user routes:", error); toast.error(`Nepodařilo se načíst vaše trasy: ${error.code}`); setLoadingUserRoutes(false); });
    return () => unsubscribe();
  }, [currentUser]);

  // 💥 Efekt pro načítání ID OBLÍBENÝCH VEŘEJNÝCH tras
  useEffect(() => {
    if (!currentUser) {
      setFavoritePublicRouteIds(new Set()); // Vyčistit při odhlášení
      setLoadingFavorites(false);
      return;
    }
    setLoadingFavorites(true);
    const favoritesCollectionPath = `user_favorites/${currentUser.uid}/favorite_public_routes`;
    const q = query(collection(db, favoritesCollectionPath));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const favoriteIds = new Set();
      querySnapshot.forEach((doc) => {
        favoriteIds.add(doc.id); // ID dokumentu je ID oblíbené trasy
      });
      setFavoritePublicRouteIds(favoriteIds);
      setLoadingFavorites(false);
    }, (error) => {
      console.error("Error fetching favorite public route IDs:", error);
      toast.error("Nepodařilo se načíst oblíbené veřejné trasy.");
      setLoadingFavorites(false);
    });

    return () => unsubscribe();
  }, [currentUser]);


  // Načtení VEŘEJNÝCH tras (beze změny)
  const fetchPublicRoutes = useCallback(async () => {
    // ... (kód zůstává stejný) ...
    setLoadingPublicRoutes(true);
    const publicRoutesCollectionPath = `public_routes`;
    const q = query(collection(db, publicRoutesCollectionPath));
    try {
        const querySnapshot = await getDocs(q); const routesData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data(); routesData.push({ id: doc.id, ...data, savedDate: data.savedDate instanceof Timestamp ? data.savedDate.toDate().toLocaleDateString('cs-CZ') : data.savedDate, points: typeof data.points === 'string' ? JSON.parse(data.points) : data.points || [] });
        });
        setPublicRoutes(routesData);
    } catch (error) { console.error("Error fetching public routes:", error); toast.error(`Nepodařilo se načíst veřejné trasy: ${error.code}`); }
    finally { setLoadingPublicRoutes(false); }
  }, []);

  // Uložení trasy (beze změny)
  const saveRoute = useCallback(async (routeData, makePublic = false) => {
    // ... (kód zůstává stejný) ...
    if (!currentUser) { toast.error("Pro uložení trasy se musíte přihlásit."); return null; }
    const privateCollectionPath = `user_routes/${currentUser.uid}/routes`;
    const publicCollectionPath = `public_routes`;
    let privateDocId = null; let publicDocId = null;
    const dataToSave = { ...routeData, points: JSON.stringify(routeData.points || []), savedDate: Timestamp.fromDate(new Date()), isFavorite: false, userId: currentUser.uid, isPublic: makePublic };
    try {
      const privateDocRef = await addDoc(collection(db, privateCollectionPath), { ...dataToSave, isFavorite: false });
      privateDocId = privateDocRef.id;
      if (makePublic) {
        const publicData = { ...dataToSave }; delete publicData.isFavorite;
        const publicDocRef = await addDoc(collection(db, publicCollectionPath), publicData);
        publicDocId = publicDocRef.id;
        const newPublicRouteForState = { id: publicDocId, ...publicData, savedDate: publicData.savedDate.toDate().toLocaleDateString('cs-CZ'), points: typeof publicData.points === 'string' ? JSON.parse(publicData.points) : publicData.points || [] };
        setPublicRoutes((prevPublicRoutes) => [...prevPublicRoutes, newPublicRouteForState]);
      }
      toast.success(`Trasa "${routeData.name}" úspěšně uložena! ${makePublic ? '(i veřejně)' : ''}`);
      return privateDocId;
    } catch (error) { console.error(`[saveRoute] ERROR saving route:`, error); toast.error(`Nepodařilo se uložit trasu: ${error.message}`); return null; }
  }, [currentUser, setPublicRoutes]);

  // Smazání trasy (beze změny)
  const deleteRoute = useCallback(async (id, isPublic = false) => {
    // ... (kód zůstává stejný) ...
     if (!currentUser) return;
    const collectionName = isPublic ? `public_routes` : `user_routes/${currentUser.uid}/routes`;
    const routeDocPath = `${collectionName}/${id}`;
    // TODO: Lepší kontrola oprávnění pro veřejné mazání
    try { await deleteDoc(doc(db, routeDocPath)); toast.success("Trasa smazána."); if (isPublic) { setPublicRoutes(prev => prev.filter(r => r.id !== id)); } }
    catch (error) { console.error("[deleteRoute] Error deleting route:", error); toast.error(`Nepodařilo se smazat trasu: ${error.message}`); }
  }, [currentUser, setPublicRoutes]);

  // Získání trasy podle ID (beze změny)
  const getRouteById = useCallback((id) => {
    // ... (kód zůstává stejný) ...
     let route = userRoutes.find(route => route.id === id); if (!route) { route = publicRoutes.find(route => route.id === id); } return route;
  }, [userRoutes, publicRoutes]);

  // 💥 UPRAVENÁ FUNKCE: Přepnutí oblíbenosti (pro soukromé i veřejné)
  const toggleFavorite = useCallback(async (id, isPublicRoute = false) => {
    if (!currentUser) return;

    if (isPublicRoute) {
      // --- Logika pro VEŘEJNÉ trasy ---
      const favoriteDocPath = `user_favorites/${currentUser.uid}/favorite_public_routes/${id}`;
      const isCurrentlyFavorite = favoritePublicRouteIds.has(id);
      console.log(`[toggleFavorite] Public route ${id}. Currently favorite: ${isCurrentlyFavorite}`);

      try {
        if (isCurrentlyFavorite) {
          // Odebrat z oblíbených (smazat dokument)
          await deleteDoc(doc(db, favoriteDocPath));
          toast.success("Trasa odebrána z oblíbených.");
        } else {
          // Přidat do oblíbených (vytvořit dokument - může být prázdný)
          await setDoc(doc(db, favoriteDocPath), { addedAt: Timestamp.now() });
          toast.success("Trasa přidána do oblíbených.");
        }
        // onSnapshot pro favoritePublicRouteIds se postará o aktualizaci stavu
      } catch (error) {
        console.error("[toggleFavorite] Error updating public favorite status:", error);
        toast.error("Nepodařilo se změnit stav oblíbenosti.");
      }

    } else {
      // --- Logika pro SOUKROMÉ trasy (zůstává stejná) ---
      const routeDocPath = `user_routes/${currentUser.uid}/routes/${id}`;
      const routeToUpdate = userRoutes.find(route => route.id === id);
      if (!routeToUpdate) return;
      const newFavoriteState = !routeToUpdate.isFavorite;
      console.log(`[toggleFavorite] Private route ${id}. Setting favorite to ${newFavoriteState}`);
      try {
        await updateDoc(doc(db, routeDocPath), {
          isFavorite: newFavoriteState
        });
        // onSnapshot pro userRoutes se postará o aktualizaci stavu
      } catch (error) {
        console.error("[toggleFavorite] Error updating private favorite status:", error);
        toast.error("Nepodařilo se změnit stav oblíbenosti.");
      }
    }
  }, [currentUser, userRoutes, favoritePublicRouteIds]); // Přidána závislost

  const value = {
    userRoutes,
    publicRoutes,
    favoritePublicRouteIds, // 💥 Poskytneme ID oblíbených veřejných
    loadingUserRoutes,
    loadingPublicRoutes,
    loadingFavorites, // 💥 Poskytneme stav načítání oblíbených
    fetchPublicRoutes,
    saveRoute,
    deleteRoute,
    getRouteById,
    toggleFavorite,
  };

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}