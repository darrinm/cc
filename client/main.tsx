import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Log the current URL and query params
console.log(window.location.href)
console.log(window.location.search)

// Extract the pathname from the URL
const pathname = window.location.pathname
console.log(pathname)

removeWatermark()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)

function removeWatermark() {
	requestAnimationFrame(() => {
		const watermark = document.getElementsByClassName('tl-watermark_SEE-LICENSE')
		if (watermark.length > 0) {
			watermark[0].remove()
		} else {
			requestAnimationFrame(removeWatermark)
		}
	})
}
