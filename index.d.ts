export interface Store<S> {
  view(): S;
  set(state: S): void;
  subscribe(listener: (state: S) => void): () => void;
  lens<T>(getter: (state: S) => T, setter: (newState: T, parentState: S) => S): Store<T>
}

export default function createStore<S>(state: S): Store<S>;
