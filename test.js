const createStore = require('.');
const assert = require('tape');

assert('It should accept any value as initial state', (test) => {
  const cases = [
    () => createStore(),
    () => createStore(null),
    () => createStore([]),
    () => createStore(''),
    () => createStore(0),
    () => createStore(new Map()),
    () => createStore(new Set()),
    () => createStore(function () { }),
  ];

  for (let getCase of cases) test.doesNotThrow(getCase);

  test.end();
});

assert('It should work with a primitive as initial state', (test) => {
  const pushedValues = [];
  const { view, set, subscribe, lens } = createStore(0);
  subscribe((value) => {
    pushedValues.push(value);
  });

  [0, 0, 1, 0, 2, 2].forEach(set);

  test.deepEquals(pushedValues, [0, 1, 0, 2]);
  test.equal(view(), 2);
  test.end();
});

assert('It should be composable', (test) => {
  const store = createStore({
    id: 1,
    age: 90,
    name: 'Zee',
    children: [
      {
        id: 2,
        age: 80,
        name: 'A',
      },
      {
        id: 3,
        age: 75,
        name: 'B',
      },
    ],
    partner: {
      id: 4,
      name: 'C',
      age: 102,
    },
  });

  const { subscribe, set, lens, view } = store
    .lens(
      ({ children }) => children,
      (children, parentState) => ({ ...parentState, children })
    )
    .lens(
      children => children[0],
      (firstChild, children) => [firstChild, ...children.slice(1, children.length)]
    )
    .lens(
      ({ name }) => name,
      (name, oldChild) => ({ ...oldChild, name })
    );

  test.deepEqual(view(), 'A');

  set('Bee');

  subscribe((newState) => {
    test.deepEqual(newState, 'Bee');
    test.end();
  });
});

assert('It should be memoized by default', (test) => {
  const memoStore = createStore(0);
  const store = createStore(0, false);
  const pushedValuesToMemoStore = [];
  const pushedValuesToStore = [];
  const expectedPushValuesToMemoStore = [0, 1, 0, 1];
  const expectedPushValuesToStore = [0, 0, 0, 1, 0, 1];

  test.deepEqual(memoStore.view(), 0);

  test.deepEqual(store.view(), 0);

  memoStore.subscribe((newState) => {
    pushedValuesToMemoStore.push(newState);
  });

  store.subscribe((newState) => {
    pushedValuesToStore.push(newState);
  });

  [0, 0, 1, 0, 1].forEach((value) => {
    memoStore.set(value);
    store.set(value);
  });

  test.deepEqual(pushedValuesToMemoStore, expectedPushValuesToMemoStore);

  test.deepEqual(pushedValuesToStore, expectedPushValuesToStore);

  test.end();
});

assert('Its lenses should be memoized by default', (test) => {
  const getValue = ({ value }) => value;
  const setValue = (value, state) => ({ ...state, value });
  const initialState = { static: 'static', value: 0 };

  const memoStore = createStore(initialState)
  const memoLensStore = memoStore.lens(getValue, setValue);

  const store = createStore(initialState, false);
  const lensStore = store.lens(getValue, setValue);

  const pushedValuesToMemoStore = [];
  const pushedValuesToStore = [];
  const expectedPushValuesToMemoStore = [0, 1, 0, 1];
  const expectedPushValuesToStore = [0, 0, 0, 1, 0, 1];

  test.deepEqual(memoLensStore.view(), 0);

  test.deepEqual(lensStore.view(), 0);

  memoLensStore.subscribe((newState) => {
    pushedValuesToMemoStore.push(newState);
  });

  lensStore.subscribe((newState) => {
    pushedValuesToStore.push(newState);
  });

  [0, 0, 1, 0, 1].forEach((value) => {
    memoLensStore.set(value);
    lensStore.set(value);
  });

  test.deepEqual(pushedValuesToMemoStore, expectedPushValuesToMemoStore);

  test.deepEqual(pushedValuesToStore, expectedPushValuesToStore);

  test.deepEqual(memoStore.view(), { static: 'static', value: 1 })

  test.deepEqual(store.view(), { static: 'static', value: 1 })

  test.end();
});

assert('It should emit the lastest value upon subscription', (test) => {
  const store = createStore(0);
  const pushedValues = [];

  store.set(1);
  store.set(2);
  store.subscribe((value) => {
    pushedValues.push(value);
  });

  test.deepEqual(pushedValues, [2]);
  test.end();
});
