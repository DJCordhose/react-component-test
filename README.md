# react-component-test
A test suite showing the relation between **ReactElement**, **ReactComponent**, **ReactClass**, and `React.Component`

Here you can find some [formal type definitions from the React documentation](https://facebook.github.io/react/docs/glossary.html#formal-type-definitions) backing up this stuff.  


- Neither **ReactElement** nor **ReactComponent** nor **ReactClass** as mentioned in the documentation are types in any classic sense
    - They rather are concepts
- `React.Component` is a class
    - internally it is something being called **ReactComponent**
        - but this is only sometimes what is called **ReactComponent** in the documentation (see below)
    - if your component inherits from `React.Component` it will indeed be `instanceof React.Component`
- **ReactClass** is an abstract concept of something you can use to create a **ReactComponent**. It can be
    - a subclass of `React.Component`
    - something created using `React.createClass` or
    - a functional component
- A **ReactElement** is a mere data structure which the virtual DOM is constructed of
    - you can create an **ReactElement** using `React.createElement`
        - you can supply either a string (for a html tag name) or a **ReactClass** (the thing explained above)
        - JSX is a short syntax for `React.createElement` 
    - the type you supplied to `createElement` will be held in the **ReactElement** as a field called `type`
    - the `render` method of your components also uses this and thus returns a **ReactElement**
    - a **ReactElement** is not `instanceof ReactElement`
        - you can find out if it is a **ReactElement**:
            - it has a `$$typeof` field
            - value of that field is `Symbol.for('react.element')`
- `ReactDOM.render` and `ReactTestUtils.renderIntoDocument` will render a **ReactElement**
    - only then a component is created
        - only then the constructor and the life cycle methods will be called
        - only then the render-method of your component will be called
        - a component is not created by only calling `createElement`
    - might return something of the abstract concept **ReactComponent**, depending on the type of the **ReactElement** (which might be a **ReactClass**)
        - will return `null` in case the type is a functional component
        - if the type is a *class* extending `React.Component` it will return a proper instance of that class
            - internally there is something called `ReactComponent` which is exported as `React.Component`, but this is not identical to the abstract concept we are talking about here
        - if the type is something created with `React.createClass`, then you will get an instance of that, but the prototype chain is weird, so that it is not `instanceof React.Component`, but shares some methods with it
    - use for this `ReactComponent` is limited
    - however, you will need a `ReactComponent` to use the methods of `ReactTestUtils` that are not related to shallow renderers

## Credits

- @bruderstein for the initial set of tests: https://gist.github.com/bruderstein/dbc1f075a9844a38cc11
- https://medium.com/@dan_abramov/react-components-elements-and-instances-90800811f8ca#.ul1fukrwm
- http://reactkungfu.com/2015/10/the-difference-between-virtual-dom-and-dom/
- https://github.com/facebook/react/blob/master/src/isomorphic/ReactIsomorphic.js#L48

