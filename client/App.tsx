import { useSync } from '@tldraw/sync'
import { TLComponents, Tldraw } from 'tldraw'
import { getBookmarkPreview } from './getBookmarkPreview'
import { multiplayerAssetStore } from './multiplayerAssetStore'
import { ElementTree } from './LayerPanel'

// Where is our worker located? Configure this in `vite.config.ts`
const WORKER_URL = process.env.TLDRAW_WORKER_URL

// In this example, the room ID is hard-coded. You can set this however you like though.
const roomId = 'test-room'

const components: TLComponents  = {
  InFrontOfTheCanvas: ElementTree,
};

function App() {
	// Create a store connected to multiplayer.
	const store = useSync({
		// We need to know the websockets URI...
		uri: `${WORKER_URL}/connect/${roomId}`,
		// ...and how to handle static assets like images & videos
		assets: multiplayerAssetStore,
	})

	return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        //deepLinks
        maxAssetSize={100_000_000}
        components={components}
        // [3]
        isShapeHidden={(s) => !!s.meta.hidden}
        // we can pass the connected store into the Tldraw component which will handle
        // loading states & enable multiplayer UX like cursors & a presence menu
        store={store}
        onMount={(editor) => {
          // when the editor is ready, we need to register our bookmark unfurling service
          editor.registerExternalAssetHandler("url", getBookmarkPreview);
        }}
      />
    </div>
  );
}

export default App
