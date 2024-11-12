import { useEffect, useMemo, useState } from 'react';
import {
  EASINGS,
  Editor,
  SvgExportContext,
  SvgExportDef,
  TLShapeId,
  useEditor,
  useValue,
} from 'tldraw';
import { VisibilityOff, VisibilityOn } from './icons';
import { LAYER_PANEL_WIDTH } from './LayerPanel';

const selectedBg = '#E8F4FE';
const childSelectedBg = '#F3F9FE';
const childBg = '#00000006';

function AsyncSVG({
  x,
  y,
  width,
  height,
  elementOrPromise,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  elementOrPromise: React.ReactElement | Promise<React.ReactElement | null> | null;
}) {
  const [element, setElement] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    if (elementOrPromise) {
      if (elementOrPromise instanceof Promise) {
        elementOrPromise.then(setElement);
      } else {
        setElement(elementOrPromise);
      }
    }
  }, [elementOrPromise]);

  if (element) {
    return (
      <svg
        className='shape-thumbnail'
        xmlns='http://www.w3.org/2000/svg'
        viewBox={`${x} ${y} ${width} ${height}`}
      >
        {element}
      </svg>
    );
  }

  return null;
}

function ShapeItem({
  shapeId,
  depth,
  parentIsSelected,
  parentIsHidden,
}: {
  shapeId: TLShapeId;
  depth: number;
  parentIsSelected?: boolean;
  parentIsHidden?: boolean;
}) {
  const editor = useEditor();

  const exportContext = useMemo(
    (): SvgExportContext => ({
      isDarkMode: editor.user.getIsDarkMode(),
      waitUntil: (promise) => promise,
      addExportDef: (def: SvgExportDef) => def,
    }),
    [editor.user.getIsDarkMode()],
  );

  const shape = useValue('shape', () => editor.getShape(shapeId), [editor]);
  const children = useValue('children', () => editor.getSortedChildIdsForParent(shapeId), [editor]);
  const isHidden = useValue('isHidden', () => editor.isShapeHidden(shapeId), [editor]);
  const isSelected = useValue('isSelected', () => editor.getSelectedShapeIds().includes(shapeId), [
    editor,
  ]);
  const shapeName = useValue('shapeName', () => getShapeName(editor, shapeId), [editor]);

  const [isEditingName, setIsEditingName] = useState(false);

  if (!shape) return null;

  const util = editor.getShapeUtil(shape);
  const svgContent = util?.toSvg?.(shape, exportContext) ?? null;
  const bounds = util?.getGeometry(shape)?.bounds;

  return (
    <>
      {!!shape && (
        <div
          className='shape-item'
          onDoubleClick={() => {
            setIsEditingName(true);
          }}
          onClick={() => {
            // We synchronize the selection state of the layer panel items with the selection state of the shapes in the editor.
            if (editor.inputs.ctrlKey || editor.inputs.shiftKey) {
              if (isSelected) {
                editor.deselect(shape);
              } else {
                editor.select(...editor.getSelectedShapes(), shape);
              }
            } else {
              editor.select(shape);
            }

            // Bring the selection into view.
            // TODO: do the minimum amount of movement necessary
            const selectionBounds = editor.getSelectionRotatedScreenBounds();
            const viewportBounds = editor.getViewportScreenBounds().clone();
            viewportBounds.x += LAYER_PANEL_WIDTH;
            viewportBounds.width -= LAYER_PANEL_WIDTH;
            if (
              selectionBounds &&
              (selectionBounds.center.x < viewportBounds.x ||
                selectionBounds.center.y < viewportBounds.y ||
                selectionBounds.center.x > viewportBounds.maxX ||
                selectionBounds.center.y > viewportBounds.maxY)
            ) {
              editor.zoomToSelection({
                animation: { duration: 500, easing: EASINGS.easeInOutCubic },
              });
            }
          }}
          style={{
            paddingLeft: 10 + depth * 20,
            opacity: parentIsHidden || isHidden ? 0.5 : 1,
            background: isSelected
              ? selectedBg
              : parentIsSelected
              ? childSelectedBg
              : depth > 0
              ? childBg
              : undefined,
          }}
        >
          <AsyncSVG
            elementOrPromise={svgContent}
            x={bounds?.x}
            y={bounds?.y}
            width={bounds?.width}
            height={bounds?.height}
          />
          {isEditingName ? (
            <input
              autoFocus
              className='shape-name-input'
              defaultValue={shapeName}
              onBlur={() => setIsEditingName(false)}
              onChange={(ev) => {
                if (shape.type === 'frame') {
                  editor.updateShape({ ...shape, props: { name: ev.target.value } });
                } else {
                  editor.updateShape({ ...shape, meta: { name: ev.target.value } });
                }
              }}
              onKeyDown={(ev) => {
                // finish editing on enter
                if (ev.key === 'Enter' || ev.key === 'Escape') {
                  ev.currentTarget.blur();
                }
              }}
            />
          ) : (
            <div className='shape-name'>{shapeName}</div>
          )}
          <button
            className='shape-visibility-toggle'
            onClick={(ev) => {
              editor.updateShape({ ...shape, meta: { hidden: !shape.meta.hidden } });
              ev.stopPropagation();
            }}
          >
            {shape.meta.hidden ? <VisibilityOff /> : <VisibilityOn />}
          </button>
        </div>
      )}
      {!!children?.length && (
        <ShapeList
          shapeIds={children}
          depth={depth + 1}
          parentIsHidden={parentIsHidden || isHidden}
          parentIsSelected={parentIsSelected || isSelected}
        />
      )}
    </>
  );
}

export function ShapeList({
  shapeIds,
  depth,
  parentIsSelected,
  parentIsHidden,
}: {
  shapeIds: TLShapeId[];
  depth: number;
  parentIsSelected?: boolean;
  parentIsHidden?: boolean;
}) {
  if (!shapeIds.length) return null;
  return (
    <div className='shape-list'>
      {shapeIds.map((shapeId) => (
        <ShapeItem
          key={shapeId}
          shapeId={shapeId}
          depth={depth}
          parentIsHidden={parentIsHidden}
          parentIsSelected={parentIsSelected}
        />
      ))}
    </div>
  );
}

function getShapeName(editor: Editor, shapeId: TLShapeId) {
  const shape = editor.getShape(shapeId);
  if (!shape) return 'Unknown shape';

  const util = editor.getShapeUtil(shape);
  let text = util?.getText(shape);
  if (text) {
    text = `"${text}"`;
  }

  return (
    // meta.name is the first choice, then the shape's text, then the shape type
    (shape.meta.name as string) || text || shape.type
  );
}
