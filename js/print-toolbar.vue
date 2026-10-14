<script setup lang="ts">
defineProps<{
	printStyle: string | null;
	sheetStyle: string;
	printBlank: boolean;
	printBW: boolean;
	printPageView: any;
	pageCount: number;
}>();

const emit = defineEmits<{
	( e: 'print' ): void;
	( e: 'export' ): void;
	( e: 'update:printStyle', value: string ): void;
	( e: 'update:printBlank', value: boolean ): void;
	( e: 'update:printBW', value: boolean ): void;
	( e: 'update:printPageView', value: any ): void;
}>();

function toggleBlank( e: Event ) {
	emit( 'update:printBlank', ( e.target as HTMLInputElement ).checked );
}

function toggleBW( e: Event ) {
	emit( 'update:printBW', ( e.target as HTMLInputElement ).checked );
}
</script>

<template>
	<div class="print-toolbar">
		<div class="toolbar-group">
			<button type="button" class="btn-print-action primary" @click.stop="emit('print')">
				<i class="fas fa-print"></i> Print Sheet
			</button>
			<button type="button" class="btn-print-action secondary" @click.stop="emit('export')">
				<i class="fas fa-download"></i> Export JSON
			</button>
		</div>

		<div class="toolbar-group">
			<div class="toolbar-segmented">
				<button type="button" :class="{ active: (printStyle || sheetStyle) === 'spotlight' }" @click.stop="emit('update:printStyle', 'spotlight')">
					<i class="fas fa-id-card"></i> Spotlight Style
				</button>
				<button type="button" :class="{ active: (printStyle || sheetStyle) === 'classic' }" @click.stop="emit('update:printStyle', 'classic')">
					<i class="fas fa-file"></i> Classic Style
				</button>
			</div>

			<label class="toolbar-checkbox">
				<input type="checkbox" :checked="printBlank" @change="toggleBlank">
								<span><i class="fas fa-pencil-alt"></i> Blank Sheet</span>
			</label>

			<label class="toolbar-checkbox">
				<input type="checkbox" :checked="printBW" @change="toggleBW">
				<span><i class="fas fa-circle-half-stroke"></i> Black &amp; White</span>
			</label>
		</div>

		<div class="toolbar-group" v-if="pageCount > 1">
			<div class="toolbar-segmented">
				<button type="button" :class="{ active: printPageView === 'all' }" @click.stop="emit('update:printPageView', 'all')">
					All Pages ({{ pageCount }})
				</button>
				<button type="button" :class="{ active: printPageView === 1 }" @click.stop="emit('update:printPageView', 1)">
					Page 1
				</button>
				<button type="button" :class="{ active: printPageView === 2 }" @click.stop="emit('update:printPageView', 2)">
					Page 2
				</button>
			</div>
		</div>
	</div>
</template>
