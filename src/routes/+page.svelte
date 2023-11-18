<script lang="ts">
	import { MATRIX_SIZE_X, MATRIX_SIZE_Y } from "$lib/Constants";
	import type { Pixel } from "$lib/MessageTypes";
	import { MqttService } from "$lib/MqttService";
	import { matrixStore } from "$lib/matrixStore";
	import {onMount} from "svelte";

	let canvas:  HTMLCanvasElement|undefined = undefined;
	let toolbar: HTMLElement|undefined = undefined;
	let context: CanvasRenderingContext2D|undefined = undefined;
	let cursor: HTMLElement|undefined = undefined;
	let lineWidth: number = 5;
	let isPainting: boolean = false;

	let mqtt = new MqttService("localhost:9001", "pixelTux"); 

	function onCancelClicked() {
		context?.clearRect(0, 0, canvas!.width, canvas!.height);

		$matrixStore.forEach((row, x) => {
			row.forEach((_, y) => {
				$matrixStore[x][y] = 0;
			});
		});
		mqtt.clear();
	}

	function colorForCode(code: number) {
        if (code === 0) {
            return "bg-gray-500"
        }
        if (code === 1) {
            return "bg-red-600"
        }
        if (code === 2) {
            return "bg-lime-500"
        }
        if (code === 3) {
            return "bg-amber-500"
        }
    }

	function onMouseDown(event: MouseEvent) {
		isPainting = true;
	}

	function onMouseUp(event: MouseEvent) {
		isPainting = false;
	}

	function mouseMove(event: MouseEvent) {
		cursor!.style.left = `${event.clientX - 12.5}px`;
		cursor!.style.top = `${event.clientY - 12.5}px`;

		if (!isPainting) {
			return;
		}

		new Promise(r => {

			const cursor = {
				x: event.clientX - 12.5,
				y: event.clientY -12.5
			}

			for (let i = 0; i < 6; i++) {
				for (let j = 0; j < 6; j++) {
					new Promise(r1 => {
						const pixel = document.elementFromPoint(cursor.x + (i * 4), cursor.y + (j *4));
						if (pixel?.classList.contains("mxPixel")) {
							let pixelPos = {
								x: parseInt(pixel.getAttribute("data-posX")!),
								y: parseInt(pixel.getAttribute("data-posY")!)
							}

							$matrixStore[pixelPos.x][pixelPos.y] = 2;

							const msg = {
								data: [[pixelPos.x, pixelPos.y, 2]] as Pixel[]
							};
							mqtt.sendMessages(msg);
						}
					}).then();
				}
			}
		}).then();
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

<svelte:body on:mousemove={mouseMove} on:mouseup={onMouseUp} />

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

	<div class="h-screen w-screen bg-slate-700 justify-center flex">
		<div class="flex flex-col">
			<div class="bg-black p-8 grow-0" on:mousedown={onMouseDown}>
				<div class="flex">
					{#each {length: MATRIX_SIZE_X} as _, x }
						<div class="flex-col"> 
							{#each {length: MATRIX_SIZE_Y} as _, y }
								<div class={"h-2 w-2 ml-1 mb-1 rounded-full mxPixel " + colorForCode($matrixStore[x][y])} data-posX={x}, data-posY={y}></div>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
	<span class="dot" id="cursor" bind:this={cursor} />
</main>

<style>
	@import './styles.css';
</style>