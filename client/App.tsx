import { useSync } from '@tldraw/sync';
import { createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  atom,
  DEFAULT_EMBED_DEFINITIONS,
  DefaultMainMenu,
  DefaultSharePanel,
  Editor,
  EditSubmenu,
  EmbedShapeUtil as EmbedShapeUtilOG,
  ExportFileContentSubMenu,
  ExtrasGroup,
  PreferencesGroup,
  TLComponents,
  Tldraw,
  TldrawUiMenuActionCheckboxItem,
  TldrawUiMenuActionItem,
  TldrawUiMenuGroup,
  TldrawUiMenuSubmenu,
  TLShape,
  TLUiOverrides,
  useValue,
  ZoomTo100MenuItem,
  ZoomToFitMenuItem,
  ZoomToSelectionMenuItem,
} from 'tldraw';
import { Document, DocumentPreview } from './DocumentPreview';
import { EmbedShapeUtil } from './EmbedShapeUtil';
import { embeds } from './Embeds';
import { LayerPanel } from './LayerPanel';
import { TextSearchPanel } from './TextSearchPanel';
import { getBookmarkPreview } from './getBookmarkPreview';
import { PlayIcon } from './icons';
import { importHatchProject } from './importHatchProject';
import { multiplayerAssetStore } from './multiplayerAssetStore';
import './text-search.css';

// Where is our Cloudflare Worker located? Configure this in `vite.config.ts`
const WORKER_URL = process.env.TLDRAW_WORKER_URL;

// Rename the original EmbedShapeUtil so we can use our hacked version that doesn't disable pointer events.
(EmbedShapeUtilOG as any).type = 'embed-og';

export const customShapeUtils = [EmbedShapeUtil];
const customEmbeds = [embeds, ...DEFAULT_EMBED_DEFINITIONS.filter((d) => d.type !== 'tldraw')];

export const showSearch = atom('showSearch', false);
export const showLayerPanel = atom('showLayerPanel', true);

const editorContext = createContext({} as { onPreviewClick: () => void });
export const documentContext = createContext({} as { isViewing: boolean });

const components: TLComponents = {
  InFrontOfTheCanvas: LayerPanel,
  HelperButtons: TextSearchPanel,
  SharePanel: ShareZone,
  MainMenu: MainMenu,
};

const overrides: TLUiOverrides = {
  actions(editor, actions) {
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
      'toggle-layer-panel': {
        id: 'toggle-layer-panel',
        label: {
          default: 'Layer Panel', // TODO: 'action.toggle-layer-panel',
          menu: 'Layer Panel', // TODO: 'action.toggle-layer-panel.menu',
        },
        kbd: '$l',
        onSelect() {
          showLayerPanel.set(!showLayerPanel.get());
        },
        checkbox: true,
      },
      'import-hatch-project': {
        id: 'import-hatch-project',
        label: 'Import Hatch Project',
        onSelect: () => {
          importHatchProject(editor);
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

  const onMount = useCallback(
    (_editor: Editor) => {
      if (!editor) {
        setEditor(_editor);
      }
      // when the editor is ready, we need to register our bookmark unfurling service
      _editor.registerExternalAssetHandler('url', getBookmarkPreview);
    },
    [editor],
  );

  const isShapeHidden = useCallback((s: TLShape) => !!s.meta.hidden, []);

  const onPreviewClick = useCallback(() => {
    setIsPreviewing(true);
  }, []);

  const onClose = useCallback(() => {
    setIsPreviewing(false);
  }, []);

  if (!documentName) {
    return <div>Need a document</div>;
  }

  if (element === 'edit') {
    return (
      <documentContext.Provider value={{ isViewing: isPreviewing }}>
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
              embeds={customEmbeds}
              shapeUtils={customShapeUtils}
              maxAssetSize={100_000_000}
              components={components}
              overrides={overrides}
              isShapeHidden={isShapeHidden}
              store={store}
              onMount={onMount}
            >
              {isPreviewing &&
                editor &&
                createPortal(<Document editor={editor} onClose={onClose} />, document.body)}
            </Tldraw>
          </div>
        </editorContext.Provider>
      </documentContext.Provider>
    );
  } else {
    return (
      <documentContext.Provider value={{ isViewing: true }}>
        <DocumentPreview store={store} />
      </documentContext.Provider>
    );
  }
}

function ShareZone() {
  const { onPreviewClick } = useContext(editorContext);
  return (
    <div
      style={{
        width: '100%',
        minWidth: '80px',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <DefaultSharePanel />
      <button
        className='preview-button'
        style={{
          marginTop: '4px',
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

function ToggleLayerPanelItem() {
  const checked = useValue(showLayerPanel);
  return <TldrawUiMenuActionCheckboxItem actionId='toggle-layer-panel' checked={checked} />;
}

function ImportHatchProjectItem() {
  return <TldrawUiMenuActionItem actionId='import-hatch-project' />;
}

function ViewSubmenu() {
  return (
    <TldrawUiMenuSubmenu id='view' label='menu.view'>
      <TldrawUiMenuGroup id='view-actions'>
        <ImportHatchProjectItem />
        <ToggleLayerPanelItem />
        <TldrawUiMenuActionItem actionId='zoom-in' />
        <TldrawUiMenuActionItem actionId='zoom-out' />
        <ZoomTo100MenuItem />
        <ZoomToFitMenuItem />
        <ZoomToSelectionMenuItem />
      </TldrawUiMenuGroup>
    </TldrawUiMenuSubmenu>
  );
}

function MainMenu() {
  return (
    <DefaultMainMenu>
      <EditSubmenu />
      <ViewSubmenu />
      <ExportFileContentSubMenu />
      <ExtrasGroup />
      <PreferencesGroup />
    </DefaultMainMenu>
  );
}

export default App;
