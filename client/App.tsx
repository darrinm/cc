import { useSync } from '@tldraw/sync';
import { atom, DEFAULT_EMBED_DEFINITIONS, TLComponents, Tldraw, TLUiOverrides } from 'tldraw';
import { getBookmarkPreview } from './getBookmarkPreview';
import { multiplayerAssetStore } from './multiplayerAssetStore';
import { LayerPanel } from './LayerPanel';
import { embeds } from './Embeds';
import { TextSearchPanel } from './TextSearchPanel';
import './text-search.css';
import { DocumentPreview } from './DocumentPreview';

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
  console.log('store', store);

  if (!document) {
    return <div>Need a document</div>;
  }

  if (element === 'edit') {
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
            console.log('Tldraw onMount');
            // when the editor is ready, we need to register our bookmark unfurling service
            editor.registerExternalAssetHandler('url', getBookmarkPreview);
          }}
        />
      </div>
    );
  } else {
    return <DocumentPreview store={store} />;
  }
}

export default App;
