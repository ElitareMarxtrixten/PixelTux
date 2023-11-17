<script lang="ts">
	import {onMount} from "svelte";

	let canvas:  HTMLCanvasElement|undefined = undefined;
	let toolbar: HTMLElement|undefined = undefined;
	let context: CanvasRenderingContext2D|undefined = undefined;
	let lineWidth: number = 5;
	let isPainting: boolean = false;
	let startX: number;
	let startY: number;
	let canvasOffsetX: number;
	let canvasOffsetY: number;

	function onCancelClicked() {
		context?.clearRect(0, 0, canvas!.width, canvas!.height);
	}

	function onMouseDown(event: MouseEvent) {
		isPainting = true;
		startX = event.clientX;
		startY = event.clientY;
	}

	function onMouseUp(event: MouseEvent) {
		isPainting = false;
		context!.stroke();
		context!.beginPath();
	}

	function onMouseMove(event: MouseEvent) {
		if (!isPainting) {
			return;
		}

		context!.lineWidth = lineWidth;
		context!.lineCap = 'round';

		context?.lineTo(event.clientX, event.clientY);
		context!.stroke();
	}

	onMount(() => {
		// TODO: Find out why canvas?.getContext("2d") does not work gay
		context = canvas!.getContext("2d");
		context.strokeStyle = "black";
		const canvasOffsetX: number = canvas!.offsetLeft;
		const canvasOffsetY: number = canvas!.offsetTop;

		canvas!.width = window.innerWidth - canvasOffsetX;
		canvas!.height = window.innerHeight - canvasOffsetY;



	});
</script>

<svelte:head>
	<title>PixelTux</title>
	<meta name="description" content="A drawing app" />
</svelte:head>

<header>
	<h1>PixelTux</h1>
</header>
<main>
	<div bind:this={toolbar} id="toolbar">
		<label for="stroke">Stroke</label>
		<input id="stroke" name="stroke" type="color">
		<label for="lineWidth">Line Width</label>
		<input id="lineWidth" name="lineWidth" type="number" value="5" min="1">
		<button id="clear" on:click={onCancelClicked}>Clear</button>
	</div>
	<div id="drawing-area">
		<canvas bind:this={canvas}
				on:mousedown={onMouseDown}
				on:mouseup={onMouseUp}
				on:mousemove={onMouseMove}
				id="drawing-board"></canvas>
	</div>
</main>

<style>
	@import './styles.css';
</style>