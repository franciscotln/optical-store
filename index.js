export default function createStore(state) {
  let $state = state;
  const $listeners = [];

  function bindLens(store) {
    store.lens = (getter, setter) => bindLens({
      view() {
        return getter(store.view());
      },
      set(newState) {
        const storeState = store.view();
        if (getter(storeState) !== newState) {
          store.set(setter(newState, storeState));
        }
      },
      subscribe(listener) {
        let prevState = getter(store.view());
        return store.subscribe((state) => {
          const currentState = getter(state);
          if (currentState !== prevState) {
            prevState = currentState;
            listener(currentState);
          }
        });
      },
    });
    return store;
  }

  const view = () => $state;

  const set = (newState) => {
    if ($state !== newState) {
      $state = newState;
      const n = $listeners.length;
      for (let i = 0; i < n; i++) $listeners[i]($state);
    }
  };

  const subscribe = (listener) => {
    if (typeof listener === 'function') {
      $listeners.push(listener);
      return () => {
        $listeners.splice($listeners.indexOf(listener), 1);
      };
    }
  };

  return bindLens({ set, view, subscribe });
}
