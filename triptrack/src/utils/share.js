import toast from 'react-hot-toast';

export function routeLink(id) {
  return `${window.location.origin}/mapa?routeId=${encodeURIComponent(id)}`;
}

// Na mobilu otevře nativní sdílení, jinak zkopíruje odkaz do schránky.
export async function copyRouteLink(id, title = 'Trasa v TripTrack') {
  const url = routeLink(id);
  try {
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      await navigator.share({ title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success('Odkaz zkopírován do schránky');
  } catch (e) {
    if (e?.name === 'AbortError') return; // uživatel sdílení zrušil
    window.prompt('Zkopírujte odkaz:', url);
  }
}
