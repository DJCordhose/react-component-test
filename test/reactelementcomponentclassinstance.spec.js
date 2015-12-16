// Credits go to @bruderstein for the initial set of tests: https://gist.github.com/bruderstein/dbc1f075a9844a38cc11
// https://medium.com/@dan_abramov/react-components-elements-and-instances-90800811f8ca#.ul1fukrwm
// http://reactkungfu.com/2015/10/the-difference-between-virtual-dom-and-dom/
// https://github.com/facebook/react/blob/master/src/isomorphic/ReactIsomorphic.js#L48

/*

What this test shows: ReactElement vs ReactComponent vs ReactClass vs React.Component

- Neither ReactElement nor ReactComponent nor ReactClass as mentioned in the documentation are types in any classic sense
    - They rather are concepts
- React.Component is a class
    - internally it is something being called ReactComponent
        - but this is only sometimes what is called ReactComponent in the documentation (see below)
    - if your component inherits from React.Component it will indeed be instanceof React.Component
- ReactClass ist an abstract concept of something you can use to create a ReactComponent. It can be
    - a subclass of React.Component
    - something created using React.createClass or
    - a functional component
- A ReactElement is a mere data structure which the virtual DOM ist constructed of
    - you can create an ReactElement using React.createElement
        - you can supply either a string (for a html tag name) or a ReactClass (the thing explained above)
        - JSX is a short syntax for React.createElement
    - the type you supplied to createElement will be held in the ReactElement as a field called ‘type'
    - the render method of your components also uses this and thus returns a ReactElement
    - a ReactElement is not instanceof ReactElement
        - you can find out if it is a ReactElement:
            - it has a '$$typeof' field
            - value of that field is 'Symbol.for('react.element')'
- ReactDOM.render and ReactTestUtils.renderIntoDocument will render a ReactElement
    - only then a component is created
        - only then the constructor and the life cycle methods will be called
        - only then the render-method of your component will be called
        - a component is not created by only calling createElement
    - might return something of the abstract concept ReactComponent, depending on the type of the ReactElement (which might be a ReactClass)
        - will return null in case the type is a functional component
        - if the type is a class extending React.Component it will return a proper instance of that class
            - internally there is something called ReactComponent which is exported as React.Component, but this is not identical to the abstract concept we are talking about here
        - if the type is something created with React.createClass, then you will get an instance of that, but the prototype chain is weird, so that it is not instanceof React.Component, but shares some methods with it
    - use for this ReactComponent is limited
    - however, you will need a ReactComponent to use the methods of ReactTestUtils that are not related to shallow renderers
*/

import jsdom from 'mocha-jsdom';
import ReactTestUtils from 'react-addons-test-utils';

import unexpected from 'unexpected';

const expect = unexpected.clone();

import React from 'react';
import ReactDOM from 'react-dom';

class MyClassComponentIntrospection extends React.Component {
	
	constructor(props) {
		super(props);
		MyClassComponentIntrospection.constructorCalled = true;		
	}

	render() {
		MyClassComponentIntrospection.renderCalled = true;
		return <div>hello</div>;
	}
}
MyClassComponentIntrospection.constructorCalled = false;
MyClassComponentIntrospection.renderCalled = false;

class MyClassComponent extends React.Component {
	render() {
		return <div>hello</div>;
	}
}

function MyFunctionalComponent() {
	return <div>hello</div>;
}

const MyES5Component = React.createClass({
	render() {
		return <div>Hello ES5</div>;
	}
});

describe('React', () => {
	jsdom();
	describe('compoennt is not created nor rendered before render', () => {
		it('returns an instance of React.Component', () => {
			MyClassComponentIntrospection.constructorCalled = false;
			MyClassComponentIntrospection.renderCalled = false;

			const container = document.createElement('div');
			const element = React.createElement(MyClassComponentIntrospection);
			expect(MyClassComponentIntrospection.constructorCalled, 'to be false');
			expect(MyClassComponentIntrospection.renderCalled, 'to be false');

			const component = ReactDOM.render(element, container);
			expect(MyClassComponentIntrospection.constructorCalled, 'to be true');
			expect(MyClassComponentIntrospection.renderCalled, 'to be true');
		});

	});

	describe('render', () => {
		let component;

		describe('for an ES6 component', () => {

			beforeEach(() => {

				const container = document.createElement('div');
				component = ReactDOM.render(<MyClassComponent />, container);
			});

			it('returns an instance of React.Component', () => {
				// console.log(component.__proto__.__proto__);

				expect(component instanceof React.Component, 'to be true');
				// expect(component.__proto__ === MyClassComponent.prototype, 'to be true');
				// expect(component.__proto__.__proto__ === React.Component.prototype, 'to be true');
				// console.log(component);
				
			});

			it('returns an instance of MyClassComponent', () => {

				expect(component instanceof MyClassComponent, 'to be true');
			});

			it('does not return the component itself', () => {
				expect(component, 'not to be', MyClassComponent);
			});
		});

		describe('for an ES5 component', () => {

			beforeEach(() => {

				const container = document.createElement('div');
				component = ReactDOM.render(<MyES5Component />, container);
			});

			it('does not return an instance of React.Component', () => {
				expect(component instanceof React.Component, 'to be false');
			});

			it('protoype shares methods with React.Component', () => {
				// but rahter something really weird:
				expect(React.Component.prototype, 'not to be', component.__proto__.__proto__);
				expect(React.Component.prototype.setState, 'to be', component.__proto__.__proto__.setState);
				expect(React.Component.prototype.forceUpdate, 'to be', component.__proto__.__proto__.forceUpdate);
				// console.log(React.Component);
			});


			it('returns an instance of MyClassComponent', () => {

				expect(component instanceof MyES5Component, 'to be true');
			});

			it('does not return the component itself', () => {
				expect(component, 'not to be', MyES5Component);
			});

		});

		describe('for a functional component', () => {

			beforeEach(() => {
				const container = document.createElement('div');
				component = ReactDOM.render(<MyFunctionalComponent />, container);
			});

			it('returns null', () => {
				expect(component, 'to be null');
			});
		});

	});

	describe('createElement', () => {

		let element;

		describe('for an ES6 component', () => {

			beforeEach(() => {
				element = <MyClassComponent />;
			});

			it('is an object', () => {
				expect(element, 'to be an object');
			});

			it('has props', () => {
				expect(element.props, 'to be an object');
			});

			it('has a type of the MyClassComponent function', () => {
				expect(element.type, 'to be', MyClassComponent);
			});
		});

		describe('for an ES5 component', () => {

			beforeEach(() => {
				element = <MyES5Component />;
			});

			it('is an object', () => {
				expect(element, 'to be an object');
			});

			it('has props', () => {
				expect(element.props, 'to be an object');
			});

			it('has a type of the MyES5Component function', () => {
				expect(element.type, 'to be', MyES5Component);
			});
		});
		describe('for an functional component', () => {

			beforeEach(() => {
				element = <MyFunctionalComponent />;
			});

			it('is an object', () => {
				expect(element, 'to be an object');
			});

			it('has props', () => {
				expect(element.props, 'to be an object');
			});

			it('has a type of the MyFunctionalComponent function', () => {
				expect(element.type, 'to be', MyFunctionalComponent);
			});
		});
	});

	describe('Shallow Renderer', () => {
		let element;

		describe('for an ES6 component', () => {

			beforeEach(() => {
				const renderer = ReactTestUtils.createRenderer();
				renderer.render(<MyClassComponent />);
				element = renderer.getRenderOutput();
			});


			it('returns an object', () => {

				expect(element, 'to be an object');
			});

			it('returns a $$typeof symbol', () => {
				expect(typeof element.$$typeof, 'to be', 'symbol');
			});
			it('returns a symbol react.element', () => {
				const symbol = Symbol.for('react.element');
				expect(element.$$typeof, 'to be', symbol);
			});

			it('returns the same object as createElement(div)', () => {
				expect(element, 'to equal', React.createElement('div', {}, 'hello'));
			});
		});
	});
});