import { createActions } from 'redux-actions';
import { FSA } from '../../../typings/fsa';
import { Epic } from 'redux-observable';
import { worker, workerMessages$ } from '../worker';
import { Observable } from 'rxjs';
import { drawNodes } from './index';
import { createColorGenerator } from './colors';

const { concat, of } = Observable;

//Actions
import {
    APPLY_FILTERS,
    FETCH_NODE,
    TRANSFER_PROFILE,
    SEND_NODES,
    PROGRESS_UPDATE,
    NODE_FETCHED,
    PROFILE_LOADED,
    TRANSFER_COMPLETE
} from '../worker/messages';
export const RENDER_PROFILE = 'renderer/RENDER_PROFILE';
export const RENDER_BATCH = 'renderer/RENDER_BATCH';
export const RENDER_COMPLETE = 'renderer/RENDER_COMPLETE';

//Reducer
interface RendererState {
    width: number;
    height: number;
}
export default function reducer(state: RendererState, {type, payload}:FSA) {
    switch (type) {
        case RENDER_PROFILE:
            return {
                ...state,
                drawing: true,
            }
        case RENDER_BATCH:
            return {
                ...state,
                start: payload
            }
        case RENDER_COMPLETE:
            return {
                ...state,
                drawing: false
            }
        default:
            const w = getWidth();
            return state || { width: w, height: w };
    }
}

//TODO: Move this somewhere better - maybe get this in the store as a part of the app component?
function getWidth(): number {
    return Math.min(window.innerWidth, window.innerHeight);
}
//Action creators
export const actions = createActions({
    renderer: {
        RENDER_PROFILE: (p: ArrayBuffer) => p,
        RENDER_BATCH: (p: number) => p,
        RENDER_COMPLETE: [
            () => { },
            () => {return {hideMessage:true}}
        ],
        TEXTURES_CREATED: () => { },
        RENDER_CACHE: (p: string) => p
    }
});

//Epic
const { renderer: { renderProfile, renderBatch, renderComplete, texturesCreated } } = actions;
export const renderNodes: Epic<FSA, any> =
    (action$, store) => action$
        .ofType(TRANSFER_COMPLETE)
        .switchMap(({ payload }) => {
            const { canvasCache: {cacheKey} } = store.getState();
            return concat(
                drawNodes({ nodes: payload, cacheKey }).map(renderBatch),
                of(renderComplete())
            )
        });

export const createTextures: Epic<FSA, any> =
    action$ => action$
        .ofType(PROFILE_LOADED)
        .map(({ payload: { nodeTypes } }) => {
            createColorGenerator(nodeTypes);
            return texturesCreated();
        });