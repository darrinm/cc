import {  useEditor, useValue } from 'tldraw'
import 'tldraw/tldraw.css'
import { ShapeList } from './ShapeList'
import './layer-panel.css'

export function ElementTree() {
		const editor = useEditor();
    const isFocusMode = useValue(
      "isFocusMode",
      () => editor.getInstanceState().isFocusMode,
      [editor]
    );
    const shapeIds = useValue(
      "shapeIds",
      () => editor.getSortedChildIdsForParent(editor.getCurrentPageId()),
      [editor]
    );

    if (isFocusMode) {
      return null;
    }

    return (
      <div className="layer-panel">
        <div className="layer-panel-title">Shapes</div>

        <ShapeList
          // [2]
          shapeIds={shapeIds}
          depth={0}
        />
      </div>
    );
}
