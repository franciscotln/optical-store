const createStore = require('.');
const assert = require('tape');

assert('It should throw if called with something other than plain object', (test) => {
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

  for (let getCase of cases) test.throws(getCase, Error);

  test.end();
});

assert('It should work with an object without prototype as initial state', (test) => {
  test.doesNotThrow(() => {
    createStore(Object.create(null));
  });

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

  subscribe((newState) => {
    test.deepEqual(newState, 'Bee');
    test.end();
  });

  set('Bee');
});
