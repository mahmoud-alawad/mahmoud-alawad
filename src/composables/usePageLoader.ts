import { ref, readonly } from 'vue'

// Stato globale condiviso a livello di modulo (singleton): persiste per tutta
// la sessione SPA. Il PageLoader vive nel layout, FUORI dal <router-view>,
// quindi parte solo a un full page load (primo accesso, Ctrl+R, F5) e MAI
// sulle navigazioni interne tra le view.
//
// Le view NON dipendono dal loader: chiamano onReady() e basta.
// - Full load: onReady risolve quando il loader finisce.
// - Navigazione interna SPA: il loader e' gia' finito (isReady === true),
//   quindi onReady risolve subito.
const isReady = ref(false)

const callbacks = new Set<() => void>()

/**
 * Segnala che l'app e' pronta (loader finito). Chiamata una sola volta dal
 * PageLoader. Idempotente: chiamate successive sono no-op.
 */
function markReady() {
  if (isReady.value) return
  isReady.value = true
  callbacks.forEach((cb) => cb())
}

/**
 * Esegui una callback quando l'app e' pronta.
 * Se e' gia' pronta (navigazione interna), parte subito.
 * Ritorna una funzione per annullare la registrazione.
 */
function onReady(cb: () => void) {
  if (isReady.value) {
    cb()
    return () => {}
  }
  callbacks.add(cb)
  return () => callbacks.delete(cb)
}

export function usePageLoader() {
  return {
    isReady: readonly(isReady),
    // alias retro-compatibili
    isLoaded: readonly(isReady),
    onReady,
    onLoaderDone: onReady,
    markReady,
    setLoaded: markReady,
  }
}
