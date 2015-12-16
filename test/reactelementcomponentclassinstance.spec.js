// This test shows: ReactElement vs ReactComponent vs ReactClass vs React.Component
// For more information see: https://github.com/DJCordhose/react-component-test/blob/master/README.md

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

	describe('component', () => {

		beforeEach(() => {

			MyClassComponentIntrospection.constructorCalled = false;
			MyClassComponentIntrospection.renderCalled = false;
		});

		it('does not call the constructor on createElement', () => {

			React.createElement(MyClassComponentIntrospection);

			expect(MyClassComponentIntrospection.constructorCalled, 'to be false');
			expect(MyClassComponentIntrospection.renderCalled, 'to be false');
		});

		it('calls the constructor after render', () => {

			const container = document.createElement('div');
			const element = React.createElement(MyClassComponentIntrospection);

			ReactDOM.render(element, container);

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

				expect(component instanceof React.Component, 'to be true');
			});

			it('has a prototype of the original component prototype', () => {

				expect(component.__proto__, 'to be', MyClassComponent.prototype);
			});

			it('has a grand-parent prototype of the React.Component prototype', () => {

				expect(component.__proto__.__proto__, 'to be', React.Component.prototype);
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
				// but rather something really weird:
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
