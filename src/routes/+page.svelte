<script lang="ts">
	import { MATRIX_SIZE_X, MATRIX_SIZE_Y } from "$lib/Constants";
	import type { Pixel } from "$lib/MessageTypes";
	import { MqttService } from "$lib/MqttService";
	import { matrixStore } from "$lib/matrixStore";

	type Color = {
		id: number;
		text: string
	};

	let colors: Color[] = [
		{ id: 0, text: `Grey` },
		{ id: 1, text: `Red` },
		{ id: 2, text: `Lime` },
		{ id: 3, text: `Amber` }
	];

	let cursor: HTMLElement|undefined = undefined;
	let lineWidth: number = 5;
	let isPainting: boolean = false;
	let selectedColor: Color = colors[1];

	//let mqtt = new MqttService("localhost:9001", "pixelTux");

	function onCancelClicked() {
		$matrixStore.forEach((row, x) => {
			row.forEach((_, y) => {
				$matrixStore[x][y] = 0;
			});
		});

		//mqtt.clear();
	}

	function colorForCode(code: number) {
		let colorClass: string = "";

		switch (code) {
			case 0:
				colorClass = "bg-gray-500";
				break;
			case 1:
				colorClass = "bg-red-600";
				break;
			case 2:
				colorClass = "bg-lime-500";
				break;
			default:
				colorClass = "bg-amber-500";
		}

		return colorClass;
    }

	function onTouchDown(event: TouchEvent) {
		isPainting = true;
	}

	function onMouseDown(event: MouseEvent) {
		isPainting = true;
	}

	function onTouchUp(event: TouchEvent) {
		isPainting = false;
	}

	function onMouseUp(event: MouseEvent) {
		isPainting = false;
	}

	function onTouch(event: TouchEvent) {
		event.preventDefault();
		const touch = event.touches[0];
		const mouseEvent = new MouseEvent("mousedown", {
			clientX: touch.clientX,
			clientY: touch.clientY
		});
	}

	function mouseMove(event: MouseEvent) {
		event.preventDefault();
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

							$matrixStore[pixelPos.x][pixelPos.y] = selectedColor.id;

							const msg = {
								data: [[pixelPos.x, pixelPos.y, selectedColor.id]] as Pixel[]
							};
							//mqtt.sendMessages(msg);
						}
					}).then();
				}
			}
		}).then();
	}
</script>

<svelte:head>
	<title>PixelTux</title>
	<meta name="description" content="A drawing app" />
</svelte:head>

<svelte:body on:touchmove={onTouch} on:touchend={onTouchUp} on:mouseover={mouseMove} on:mouseup={onMouseUp} />

<header>
	<h1>PixelTux</h1>
</header>
<main>
	<div id="toolbar">
		<label for="stroke">Stroke</label>
		<select bind:value={selectedColor}>
			{#each colors as color}
				<option value={color}>
					{color.text}
				</option>
			{/each}
		</select>

		<label for="lineWidth">Line Width</label>
		<input id="lineWidth" name="lineWidth" type="number" min="1" bind:value={lineWidth}>

		<button id="clear" on:click={onCancelClicked}>Clear</button>
	</div>

	<div class="h-screen w-screen bg-slate-700 justify-center flex">
		<div class="flex flex-col">
			<div class="bg-black p-8 grow-0 touch-auto" on:mousedown={onMouseDown} on:touchdown={onTouchDown}>
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