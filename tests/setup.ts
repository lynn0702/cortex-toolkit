if (typeof HTMLCanvasElement !== 'undefined') {
	// Stub getContext to silence JSDOM's unimplemented canvas notice during tests (e.g. axe-core audits).
	HTMLCanvasElement.prototype.getContext = function () {
		return {
			fillRect: () => {},
			clearRect: () => {},
			getImageData: () => ({ data: new Uint8ClampedArray(0) }),
			putImageData: () => {},
			createImageData: () => [],
			setTransform: () => {},
			drawImage: () => {},
			save: () => {},
			fillText: () => {},
			restore: () => {},
			beginPath: () => {},
			moveTo: () => {},
			lineTo: () => {},
			closePath: () => {},
			stroke: () => {},
			translate: () => {},
			scale: () => {},
			rotate: () => {},
			arc: () => {},
			fill: () => {},
			measureText: () => ({ width: 0 }),
			transform: () => {},
			rect: () => {},
			clip: () => {},
		} as any;
	};
}

if (typeof HTMLDialogElement !== 'undefined') {
	if (!HTMLDialogElement.prototype.showModal) {
		HTMLDialogElement.prototype.showModal = function () {
			this.setAttribute('open', '');
		};
	}
	if (!HTMLDialogElement.prototype.close) {
		HTMLDialogElement.prototype.close = function (returnValue?: string) {
			if (returnValue !== undefined) this.returnValue = returnValue;
			this.removeAttribute('open');
			this.dispatchEvent(new Event('close'));
		};
	}
}
