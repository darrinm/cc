import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

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
