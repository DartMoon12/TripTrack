// src/Hooks/RouteStorageContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/Auth/AuthContext';
import { db } from '../firebase';
// Importujeme spoustu funkcí z Firebase pro práci s databází
import {
    collection, addDoc, deleteDoc, doc, onSnapshot, query,
    updateDoc, Timestamp, getDocs, setDoc, getDoc, orderBy
} from 'firebase/firestore';
import toast from 'react-hot-toast';

// 1. Vytvoříme prázdnou "krabici" pro naše data
const RouteContext = createContext();

// 2. Vytvoříme si vlastní Hook, abychom v komponentách psali jen "useRoutesStorage()"
export function useRoutesStorage() {
  return useContext(RouteContext);
}

// 3. Hlavní komponenta, která obalí celou aplikaci a bude se starat o data
export function RouteStorageProvider({ children }) {
  // Zjistíme, kdo je přihlášený (potřebujeme jeho ID pro ukládání tras)
  const { currentUser } = useAuth();

  // --- STAVY (Paměť aplikace) ---
  const [userRoutes, setUserRoutes] = useState([]); // Moje soukromé trasy
  const [publicRoutes, setPublicRoutes] = useState([]); // Veřejné trasy ostatních
  
  // Set je speciální pole, kde je každá hodnota unikátní. 
  // Používáme ho pro IDčka oblíbených tras, abychom rychle zjistili "mám to v oblíbených?" (has()).
  const [favoritePublicRouteIds, setFavoritePublicRouteIds] = useState(new Set());
  
  // Stavy načítání - abychom mohli zobrazit točící kolečko, dokud nemáme data
  const [loadingUserRoutes, setLoadingUserRoutes] = useState(true);
  const [loadingPublicRoutes, setLoadingPublicRoutes] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // --- EFEKT 1: Načítání MÝCH tras (Real-time) ---
  useEffect(() => {
    // Pokud není uživatel přihlášený, vyčistíme data a končíme
    if (!currentUser) { setUserRoutes([]); setLoadingUserRoutes(false); return; }
    
    setLoadingUserRoutes(true);
    
    // onSnapshot je "živé spojení". Jakmile se něco změní v databázi, 
    // tahle funkce se SAMA spustí a aktualizuje data v aplikaci.
    const unsubscribe = onSnapshot(collection(db, `user_routes/${currentUser.uid}/routes`), (snap) => {
      
      // Převádíme data z Firebase formátu do našeho formátu
      const routes = snap.docs.map(doc => ({
        id: doc.id, 
        ...doc.data(),
        // Převedeme divný Firebase čas na čitelný text (např. 20.1.2026)
        savedDate: doc.data().savedDate?.toDate().toLocaleDateString('cs-CZ'),
        // Body trasy jsou v DB jako text (JSON), musíme je převést zpět na pole objektů
        points: typeof doc.data().points === 'string' ? JSON.parse(doc.data().points) : doc.data().points || []
      }));
      
      setUserRoutes(routes);
      setLoadingUserRoutes(false);
    });

    // Úklid: Když se uživatel odhlásí, vypneme sledování databáze
    return () => unsubscribe();
  }, [currentUser]); // Spustí se znovu, když se změní uživatel

  // --- EFEKT 2: Načítání OBLÍBENÝCH (Real-time) ---
  useEffect(() => {
    if (!currentUser) { setFavoritePublicRouteIds(new Set()); setLoadingFavorites(false); return; }
    setLoadingFavorites(true);
    
    // Sledujeme kolekci, kde jsou jen IDčka oblíbených tras
    const unsubscribe = onSnapshot(collection(db, `user_favorites/${currentUser.uid}/favorite_public_routes`), (snap) => {
      const ids = new Set();
      snap.forEach(doc => ids.add(doc.id)); // Naplníme množinu IDčky
      setFavoritePublicRouteIds(ids);
      setLoadingFavorites(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // --- FUNKCE 1: Načtení VEŘEJNÝCH tras (Jednorázově) ---
  // Tady nepoužíváme onSnapshot, ale getDocs. Načte se to jen tehdy, 
  // když zavoláme tuto funkci (např. při kliknutí na záložku "Trasy ostatních").
  const fetchPublicRoutes = useCallback(async () => {
    setLoadingPublicRoutes(true);
    try {
      const snap = await getDocs(collection(db, 'public_routes'));
      setPublicRoutes(snap.docs.map(doc => ({
        id: doc.id, 
        ...doc.data(),
        savedDate: doc.data().savedDate?.toDate().toLocaleDateString('cs-CZ'),
        points: typeof doc.data().points === 'string' ? JSON.parse(doc.data().points) : doc.data().points || [],
        // Zajistíme, že tam budou čísla, i když v DB nic není
        avgRating: doc.data().avgRating || 0,
        reviewCount: doc.data().reviewCount || 0
      })));
    } catch (e) { console.error(e); }
    finally { setLoadingPublicRoutes(false); }
  }, []);

  // --- FUNKCE 2: Přidání recenze ---
  const addReview = useCallback(async (routeId, rating, comment) => {
    if (!currentUser) return null;
    try {
      // 1. Připravíme objekt recenze
      const reviewData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email.split('@')[0], // Jméno nebo část emailu
        rating: Number(rating),
        comment: comment,
        createdAt: Timestamp.now()
      };
      
      // 2. Uložíme recenzi do pod-kolekce 'reviews' u dané trasy
      const docRef = await addDoc(collection(db, `public_routes/${routeId}/reviews`), reviewData);

      // 3. Pokusíme se aktualizovat průměrné hodnocení trasy (matematika)
      try {
        const routeRef = doc(db, `public_routes/${routeId}`);
        const snap = await getDoc(routeRef);
        if (snap.exists()) {
          const d = snap.data();
          // Starý počet + 1
          const nCount = (d.reviewCount || 0) + 1;
          // (Starý průměr * starý počet + nové hodnocení) / nový počet
          const nAvg = (((d.avgRating || 0) * (d.reviewCount || 0)) + rating) / nCount;
          
          await updateDoc(routeRef, { avgRating: nAvg, reviewCount: nCount });
          
          // Aktualizujeme i lokální stav, aby se to na webu hned přepsalo
          setPublicRoutes(prev => prev.map(r => r.id === routeId ? { ...r, avgRating: nAvg, reviewCount: nCount } : r));
        }
      } catch (e) { console.warn("Průměr neaktualizován - chybí práva (to nevadí, recenze je uložená)"); }
      
      toast.success("Recenze odeslána!");
      return { id: docRef.id, ...reviewData }; // Vracíme data, aby se mohla hned zobrazit
    } catch (e) { 
      toast.error("Chyba při hodnocení."); 
      return null;
    }
  }, [currentUser]);

  // --- FUNKCE 3: Načtení recenzí pro jednu trasu ---
  const getReviews = useCallback(async (routeId) => {
    try {
      // Vybereme recenze a seřadíme je od nejnovějších (desc = descending)
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

  // --- FUNKCE 4: Uložení nové trasy ---
  const saveRoute = useCallback(async (routeData, makePublic = false) => {
    if (!currentUser) return null;
    
    // Body trasy musíme převést na text (JSON), protože Firestore neumí ukládat pole objektů v poli objektů moc dobře
    const data = { 
        ...routeData, 
        points: JSON.stringify(routeData.points), 
        savedDate: Timestamp.now(), 
        userId: currentUser.uid, 
        avgRating: 0, 
        reviewCount: 0 
    };

    // 1. Vždy uložit do mých soukromých tras
    const ref = await addDoc(collection(db, `user_routes/${currentUser.uid}/routes`), { ...data, isFavorite: false });
    
    // 2. Pokud uživatel chtěl, uložit kopii i do veřejných tras
    if (makePublic) await addDoc(collection(db, 'public_routes'), data);
    
    return ref.id;
  }, [currentUser]);

  // --- FUNKCE 5: Přepínání oblíbené (Srdíčko/Hvězdička) ---
  const toggleFavorite = useCallback(async (id, isPublic = false) => {
    if (!currentUser) return;
    
    // Tady je to složitější:
    // A) U veřejných tras si ukládáme jejich ID do speciální kolekce 'user_favorites'
    if (isPublic) {
        const ref = doc(db, `user_favorites/${currentUser.uid}/favorite_public_routes/${id}`);
        // Pokud už tam je -> smazat. Pokud není -> přidat.
        favoritePublicRouteIds.has(id) ? await deleteDoc(ref) : await setDoc(ref, { at: Timestamp.now() });
    } 
    // B) U mých tras jen přepneme vlastnost 'isFavorite' na true/false přímo v dokumentu trasy
    else {
        const ref = doc(db, `user_routes/${currentUser.uid}/routes/${id}`);
        const r = userRoutes.find(r => r.id === id);
        await updateDoc(ref, { isFavorite: !r.isFavorite });
    }
  }, [currentUser, userRoutes, favoritePublicRouteIds]);

  // --- FUNKCE 6: Mazání trasy ---
  const deleteRoute = useCallback(async (id, isPublic = false) => {
    if (!currentUser) return; // Bezpečnostní pojistka
    
    try {
        // Rozhodneme, odkud mazat (veřejné vs soukromé)
        const docRef = doc(db, isPublic ? `public_routes/${id}` : `user_routes/${currentUser.uid}/routes/${id}`);
        await deleteDoc(docRef);
        
        // Pokud jsme smazali veřejnou trasu, musíme ji ručně vyhodit i z lokálního seznamu
        if (isPublic) {
            setPublicRoutes(prev => prev.filter(r => r.id !== id));
        }
        toast.success("Trasa smazána.");
    } catch (error) {
        console.error("Chyba mazání:", error);
        toast.error("Nepodařilo se smazat trasu.");
    }
  }, [currentUser]);

  // --- BALÍČEK DAT ---
  // Všechno, co chceme poslat do aplikace, zabalíme do objektu 'value'
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
    // Pomocná funkce pro nalezení trasy podle ID (hledá v obou seznamech)
    getRouteById: (id) => userRoutes.find(r => r.id === id) || publicRoutes.find(r => r.id === id) 
  };
  
  // Poskytujeme data všem komponentám uvnitř
  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}