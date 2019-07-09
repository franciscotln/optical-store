# optical-store

Functional lenses-based state store, framework agnostic.

`npm install optical-store`

## Examples

### Using a one-level state
```js
import createStore from 'optical-store';

const initialState = {
  id: 'someId',
  name: 'someName'
};

const store = createStore(initialState);

const state = store.view();

console.log(state) // => { id: 'someId', name: 'someName' }

const unsubscribe = store.subscribe((newState) => {
  console.log(newState)
});

store.set({ ...state, name: state.name.toUpperCase() });

// subscriber gets { id: 'someId , name: 'SOMENAME' }
```

### Note that setting the same current state to the store will not trigger the subscribers
```js
store.set(store.view()); // The subscriber is not called since the state has not changed
```

### Using a deeper state and lenses
```js
import createStore from 'optical-store';

const initialState = {
  id: 'someId',
  name: 'someName'
  children: [
    {
      id: 'otherId',
      name: 'otherName',
    },
    {
      id: 'yetAnotherId',
      name: 'yetAnotherName'
    }
  ]
};

const store = createStore(initialState);

// subscribe to the main state store
store.subscribe((newState) => {
  console.log('Main store gets\n', newState);
});

// get a new substore from the "children" array:

const childrenStore = store.lens(
  ({ children }) => children, // getter function
  (children, prevState) => ({ ...prevState, children }) // setter function
);

childrenStore.view(); // => Array(2)

childrenStore.subscribe((newState) => {
  console.log('Child store gets\n', newState);
});

childrenStore.set(childrenStore.view().map(item => ({
  ...item,
  name: item.name.toUpperCase
})));
// both subscribers from the main store and substore get notified about the state update
```
### We can go deeper
```js
const fistChildStore = childrenStore.lens(
  children => children[0],
  (firstChild, children) => [firstChild, children[1]]
);

const secondChildStore = childrenStore.lens(
  children => children[1],
  (secondChild, children) => [children[0], secondChild]
);

fistChildStore.subscribe((newState) => {
  console.log('1st grandchild store gets\n', newState);
});

secondChildStore.subscribe((newState) => {
  console.log('2nd grandchild store gets\n', newState);
});

firstChildStore.view(); // => { id: 'otherId', name: 'otherName' }

secondChildStore.view(); // => { id: 'yetAnotherId', name: 'yetAnotherName' }

firstChildStore.set({ ...firstChildStore.view(), name: 'Nobody' });

/*
 * The main store, the childrenStore and firstChildStore get notified
 * about the state change, the secondChildStore does not get notified
 * since its state has not changed.
 */
```

Although you can go as deep as you wish into the state, consider normalising your state to avoid very nested structures.

Try to assign these getters/setters to constants so you can re-use them later on. Notice that these lenses obey the monadic laws of composition.

Immutability is very important for the store to work properly since the equality comparisions are made by reference, not value and if you mutate an object instead of returning a new updated reference, the subscribers won't be notified of a state change.

In this [codesandbox](https://codesandbox.io/s/blazing-frost-rfjyx?fontsize=14) you'll find an example of usage integrating the store with a ReactJs app.