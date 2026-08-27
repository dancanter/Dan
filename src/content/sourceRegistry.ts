import { sources as coreSources } from './sources';
import { extendedSources } from './sourcesExtended';

/**
 * The citation registry, assembled from the two source files.
 *
 * Lives here rather than in `index.ts` so that a component needing to resolve
 * one citation — which is most of them — does not have to import the barrel,
 * and with it the entire guidance library. `SourceList` on the home screen's
 * myth card was doing exactly that.
 */
export const sources = [...coreSources, ...extendedSources];
export const sourceById = new Map(sources.map((s) => [s.id, s]));
