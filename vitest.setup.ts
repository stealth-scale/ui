// Every specification here renders, and asserts on what a reader would see rather than on a
// DOM property. jest-dom is where `toBeVisible`, `toHaveTextContent` and `toBeDisabled` come
// from; loading it once here is what keeps a spec free of the import.
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vite-plus/test'

// Testing Library unmounts after each case by itself only where the test framework's globals
// are on, and they are not: a specification imports what it uses. Without this the document
// keeps every tree a file rendered, and the second case asking for a button finds several.
// The store is emptied for the same reason, since it outlives a render.
afterEach(() => {
  cleanup()
  globalThis.localStorage.clear()
})
