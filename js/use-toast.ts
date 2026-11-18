import { ref } from 'vue';

export type ToastTone = 'info' | 'warn' | 'error';

export interface ToastOptions {
	actionLabel?: string;
	onAction?: () => void;
	durationMs?: number;
	tone?: ToastTone;
}

export function useToast() {
	const toastMessage = ref<string | null>(null);
	const toastActionLabel = ref<string | null>(null);
	const toastTone = ref<ToastTone>('info');
	const toastTimeout = ref<any>(null);
	let pendingAction: (() => void) | null = null;
	let currentDurationMs = 2500;
	let isPaused = false;

	function clearTimer() {
		if (toastTimeout.value) {
			clearTimeout(toastTimeout.value);
			toastTimeout.value = null;
		}
	}

	function scheduleDismiss() {
		clearTimer();
		if (isPaused || !toastMessage.value) return;
		toastTimeout.value = setTimeout(() => {
			dismissToast();
		}, currentDurationMs);
	}

	function dismissToast() {
		clearTimer();
		toastMessage.value = null;
		toastActionLabel.value = null;
		toastTone.value = 'info';
		pendingAction = null;
		isPaused = false;
	}

	function showToast(msg: string, options?: ToastOptions) {
		isPaused = false;
		const tone: ToastTone = options?.tone ?? 'info';
		toastMessage.value = msg;
		toastActionLabel.value = options?.actionLabel || null;
		toastTone.value = tone;
		pendingAction = typeof options?.onAction === 'function' ? options.onAction : null;
		const defaultMs = tone === 'info' ? 2500 : 5000;
		currentDurationMs = options?.durationMs ?? defaultMs;
		scheduleDismiss();
	}

	function triggerToastAction() {
		const fn = pendingAction;
		dismissToast();
		if (fn) fn();
	}

	function pauseToast() {
		isPaused = true;
		clearTimer();
	}

	function resumeToast(event?: FocusEvent) {
		if (event?.currentTarget && event.relatedTarget instanceof Node) {
			if ((event.currentTarget as HTMLElement).contains(event.relatedTarget)) {
				return;
			}
		}
		isPaused = false;
		if (toastMessage.value) {
			scheduleDismiss();
		}
	}

	return {
		toastMessage,
		toastActionLabel,
		toastTone,
		toastTimeout,
		showToast,
		triggerToastAction,
		pauseToast,
		resumeToast,
		dismissToast,
	};
}
