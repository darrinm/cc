import { useSync } from '@tldraw/sync';
import {
  atom,
  DEFAULT_EMBED_DEFINITIONS,
  SerializedStore,
  TLComponents,
  Tldraw,
  TLRecord,
  TLUiOverrides,
} from 'tldraw';
import { getBookmarkPreview } from './getBookmarkPreview';
import { multiplayerAssetStore } from './multiplayerAssetStore';
import { LayerPanel } from './LayerPanel';
import { embeds } from './Embeds';
import { TextSearchPanel } from './TextSearchPanel';
import './text-search.css';

// Where is our worker located? Configure this in `vite.config.ts`
const WORKER_URL = process.env.TLDRAW_WORKER_URL;

export const showSearch = atom('showSearch', false);

const components: TLComponents = {
  InFrontOfTheCanvas: LayerPanel,
  HelperButtons: TextSearchPanel,
};

const overrides: TLUiOverrides = {
  actions(_editor, actions) {
    return {
      ...actions,
      'text-search': {
        id: 'text-search',
        label: 'Search',
        kbd: '$f',
        onSelect() {
          if (!showSearch.get()) {
            showSearch.set(true);
          }
        },
      },
    };
  },
};

function App({ document, element }: { document: string | undefined; element: string | undefined }) {
  // Create a store connected to multiplayer.
  const store = useSync({
    // We need to know the websockets URI...
    uri: `${WORKER_URL}/connect/${document}`,
    // ...and how to handle static assets like images & videos
    assets: multiplayerAssetStore,
  });

  if (!document) {
    return <div>No document</div>;
  }

  // TODO: if element is not 'edit', set the initial state to the element
  if (element !== 'edit') {
    console.log(store);
    if (store.status === 'synced-remote') {
      const snapshot = store.store.getStoreSnapshot();
      return <StorePreview store={snapshot.store} />;
    } else {
      return (
        <div>
          {store.status}: preview {element}
        </div>
      );
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        embeds={[embeds, ...DEFAULT_EMBED_DEFINITIONS.filter((d) => d.type !== 'tldraw')]}
        //deepLinks
        maxAssetSize={100_000_000}
        components={components}
        overrides={overrides}
        isShapeHidden={(s) => !!s.meta.hidden}
        // we can pass the connected store into the Tldraw component which will handle
        // loading states & enable multiplayer UX like cursors & a presence menu
        store={store}
        onMount={(editor) => {
          // when the editor is ready, we need to register our bookmark unfurling service
          editor.registerExternalAssetHandler('url', getBookmarkPreview);
        }}
      />
    </div>
  );
}

function StorePreview({ store }: { store: SerializedStore<TLRecord> }) {
  return (
    <div>
      <pre>{JSON.stringify(store, null, 2)}</pre>
    </div>
  );
}

export default App;
