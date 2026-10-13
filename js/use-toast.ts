import { ref } from 'vue';

export function useToast() {
	const toastMessage = ref<string | null>( null );
	const toastTimeout = ref<any>( null );

	function showToast( msg: string ) {
		toastMessage.value = msg;
		if ( toastTimeout.value ) {
			clearTimeout( toastTimeout.value );
		}
		toastTimeout.value = setTimeout( () => {
			toastMessage.value = null;
			toastTimeout.value = null;
		}, 2500 );
	}

	return { toastMessage, toastTimeout, showToast };
}
