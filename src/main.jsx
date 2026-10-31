import React from 'react'
import ReactDOM from 'react-dom/client'

// The redesign is the default; add ?classic to the URL to see the original site.
// Each design loads its own stylesheet, so the two never mix.
const classic = new URLSearchParams(window.location.search).has('classic')

const load = classic
  ? Promise.all([import('./App.jsx'), import('./index.css')])
  : Promise.all([import('./v2/App.jsx'), import('./v2/styles/index.css')])

load.then(([{ default: App }]) => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
