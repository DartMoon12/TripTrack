// Překlad kódů chyb z Firebase Authentication do češtiny.
const MESSAGES = {
  'auth/invalid-credential': 'Nesprávný e-mail nebo heslo.',
  'auth/wrong-password': 'Nesprávný e-mail nebo heslo.',
  'auth/user-not-found': 'Účet s tímto e-mailem neexistuje.',
  'auth/invalid-email': 'Neplatný formát e-mailu.',
  'auth/email-already-in-use': 'Účet s tímto e-mailem už existuje. Zkuste se přihlásit.',
  'auth/weak-password': 'Heslo je příliš slabé. Použijte alespoň 8 znaků.',
  'auth/too-many-requests': 'Příliš mnoho pokusů. Zkuste to prosím za chvíli.',
  'auth/user-disabled': 'Tento účet byl zablokován.',
  'auth/missing-email': 'Zadejte e-mail.',
  'auth/popup-closed-by-user': 'Přihlašovací okno bylo zavřeno.',
  'auth/cancelled-popup-request': 'Přihlašovací okno bylo zavřeno.',
  'auth/popup-blocked': 'Prohlížeč zablokoval přihlašovací okno. Povolte vyskakovací okna.',
  'auth/unauthorized-domain': 'Tato doména není povolená ve Firebase (Authentication → Settings → Authorized domains).',
  'auth/operation-not-allowed': 'Tento způsob přihlášení není ve Firebase zapnutý.',
  'auth/network-request-failed': 'Chyba sítě. Zkontrolujte připojení nebo vypněte blokátor reklam.',
  'auth/account-exists-with-different-credential': 'Účet s tímto e-mailem už existuje s jiným způsobem přihlášení.',
};

export function authErrorMessage(err, fallback = 'Něco se pokazilo') {
  return MESSAGES[err?.code] || `${fallback} (${err?.code || 'neznámá chyba'}).`;
}

// Zavření okna uživatelem není chyba, kterou je potřeba hlásit
export function isUserCancel(err) {
  return err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request';
}
