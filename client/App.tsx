import { useSync } from '@tldraw/sync';
import {
  atom,
  DEFAULT_EMBED_DEFINITIONS,
  Editor,
  TLComponents,
  Tldraw,
  TLUiOverrides,
} from 'tldraw';
import { getBookmarkPreview } from './getBookmarkPreview';
import { multiplayerAssetStore } from './multiplayerAssetStore';
import { LayerPanel } from './LayerPanel';
import { embeds } from './Embeds';
import { TextSearchPanel } from './TextSearchPanel';
import './text-search.css';
import { DocumentPreview, Document } from './DocumentPreview';
import { PlayIcon } from './icons';
import { createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { EmbedShapeUtil } from './EmbedShapeUtil';
import { EmbedShapeUtil as EmbedShapeUtilOG } from 'tldraw';

// Rename the original EmbedShapeUtil so we can use our hacked version that doesn't disable pointer events.
(EmbedShapeUtilOG as any).type = 'embed-og';

// Where is our Cloudflare Worker located? Configure this in `vite.config.ts`
const WORKER_URL = process.env.TLDRAW_WORKER_URL;

export const showSearch = atom('showSearch', false);
export const showLayerPanel = atom('showLayerPanel', true);

const editorContext = createContext({} as { onPreviewClick: () => void });

const components: TLComponents = {
  InFrontOfTheCanvas: LayerPanel,
  HelperButtons: TextSearchPanel,
  SharePanel: ShareZone,
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

function App({
  documentName,
  element,
}: {
  documentName: string | undefined;
  element: string | undefined;
}) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);

  // Create a store connected to multiplayer.
  const store = useSync({
    // We need to know the websockets URI...
    uri: `${WORKER_URL}/connect/${documentName}`,
    // ...and how to handle static assets like images & videos
    assets: multiplayerAssetStore,
  });

  const onPreviewClick = useCallback(() => {
    setIsPreviewing(true);
  }, []);

  if (!documentName) {
    return <div>Need a document</div>;
  }

  if (element === 'edit') {
    return (
      <editorContext.Provider value={{ onPreviewClick }}>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            height: isPreviewing ? 0 : undefined,
            overflow: isPreviewing ? 'hidden' : undefined,
          }}
        >
          <Tldraw
            embeds={[embeds, ...DEFAULT_EMBED_DEFINITIONS.filter((d) => d.type !== 'tldraw')]}
            shapeUtils={[EmbedShapeUtil]}
            maxAssetSize={100_000_000}
            components={components}
            overrides={overrides}
            isShapeHidden={(s) => !!s.meta.hidden}
            store={store}
            onMount={(_editor) => {
              if (!editor) {
                setEditor(_editor);
              }
              // when the editor is ready, we need to register our bookmark unfurling service
              _editor.registerExternalAssetHandler('url', getBookmarkPreview);
            }}
          >
            {isPreviewing &&
              editor &&
              createPortal(
                <Document editor={editor} onClose={() => setIsPreviewing(false)} />,
                document.body,
              )}
          </Tldraw>
        </div>
      </editorContext.Provider>
    );
  } else {
    return <DocumentPreview store={store} />;
  }
}

function ShareZone() {
  const { onPreviewClick } = useContext(editorContext);
  return (
    <div
      style={{
        width: '100%',
        textAlign: 'right',
        minWidth: '80px',
      }}
    >
      <button
        className='preview-button'
        style={{
          padding: 0,
          border: 'none',
          cursor: 'pointer',
          height: '32px',
          width: '32px',
          pointerEvents: 'auto',
        }}
        onClick={(ev) => {
          onPreviewClick();
          ev.stopPropagation();
        }}
      >
        <PlayIcon fill='black' />
      </button>
    </div>
  );
}

export default App;
