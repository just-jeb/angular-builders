global['CSS'] = null;

const mock = () => {
	let storage = {};
	return {
		getItem: (key: string) => key in storage ? storage[key] : null,
		setItem: (key: string, value: any) => storage[key] = value || '',
		removeItem: (key: string) => delete storage[key],
		clear: () => storage = {},
	};
};

Object.defineProperty(window, 'localStorage', {value: mock()});
Object.defineProperty(window, 'sessionStorage', {value: mock()});
Object.defineProperty(document, 'doctype', {
	value: '<!DOCTYPE html>'
});
Object.defineProperty(window, 'getComputedStyle', {
	value: () => {
		return {
			display: 'none',
			appearance: ['-webkit-appearance']
		};
	}
});
/**
 * ISSUE: https://github.com/angular/material2/issues/7101
 * Workaround for JSDOM missing transform property
 */
Object.defineProperty(document.body.style, 'transform', {
	value: () => {
		return {
			enumerable: true,
			configurable: true,
		};
	},
});