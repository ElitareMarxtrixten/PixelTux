<script lang="ts">
	import { MATRIX_SIZE_X, MATRIX_SIZE_Y } from "$lib/Constants";
	import type { Pixel } from "$lib/MessageTypes";
	import { MqttService } from "$lib/MqttService";
	import { matrixStore } from "$lib/matrixStore";
	import type { Point } from "$lib/types/Point";
	import {Icon} from '@steeze-ui/svelte-icon'
	import {ArrowDownTray} from "@steeze-ui/heroicons";
	import {ArrowUpTray} from "@steeze-ui/heroicons";
	import {Trash} from "@steeze-ui/heroicons";
	import {onMount} from "svelte";
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome'
	import { faEraser } from '@fortawesome/free-solid-svg-icons'
	import { config } from '@fortawesome/fontawesome-svg-core'

	import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS
	config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

	type Color = {
		id: number;
		cssId: string;
		cssClass: string;
	};

	let colors: Color[] = [
		{ id: 0, cssId: `color-grey`, cssClass: 'bg-gray-500' },
		{ id: 1, cssId: `color-red`, cssClass: 'bg-red-600' },
		{ id: 2, cssId: `color-green`, cssClass: 'bg-lime-500' },
		{ id: 3, cssId: `color-orange`, cssClass: 'bg-amber-500' }
	];

	let cursor: HTMLElement|undefined = undefined;
	let lineWidth: number = 25;
	let isPainting: boolean = false;
	let selectedColor: Color = colors[1];

	let mqtt = new MqttService("192.168.1.101:9001", "matrix");
	//let mqtt = new MqttService("192.168.1.107:9001", "pixelTux");

	function onCancelClicked() {
		$matrixStore.forEach((row, x) => {
			row.forEach((_, y) => {
				$matrixStore[x][y] = 0;
			});
		});

		mqtt.clear();
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

	function onColorClicked(colorId: number) {
		selectedColor = colors.find(color => color.id === colorId);

		cursor?.classList.remove(...cursor?.classList);
		cursor?.classList.add('dot');
		cursor?.classList.add(selectedColor.cssClass);
	}

	function onLineWidthChanged() {
		cursor!.style!.width = `${lineWidth}px`;
		cursor!.style!.height = `${lineWidth}px`;
	}

	function onMouseDown(event: MouseEvent) {
		isPainting = true;
	}

	function onMouseUp(event: MouseEvent) {
		isPainting = false;
	}

	function onTouch(event: TouchEvent) {
		event.preventDefault();
		const touch = event.touches[0];
		const touchEvent = {
			x: touch.clientX,
			y: touch.clientY
		}
		
		const center = lineWidth / 2;
		const mouse = {
			x: touch.clientX - center,
			y: touch.clientY - center
		}
		
		cursor!.style.left = `${mouse.x}px`;
		cursor!.style.top = `${mouse.y}px`;

		draw(touchEvent);
	}

	function mouseMove(event: MouseEvent) {
		event.preventDefault();

		const center = lineWidth / 2;
		const mouse = {
			x: event.clientX - center,
			y: event.clientY - center
		}

		cursor!.style.left = `${mouse.x}px`;
		cursor!.style.top = `${mouse.y}px`;

		if (!isPainting) {
			return;
		}

		draw(mouse);
	}

	function draw(cursor: Point) {
		new Promise(r => {
		for (let i = 0; i < (lineWidth / 4); i++) {
			for (let j = 0; j < (lineWidth / 4); j++) {
				new Promise(r1 => {
					const pixel = document.elementFromPoint(cursor.x + (i * 4), cursor.y + (j *4));
					if (pixel?.classList.contains("mxPixel")) {
						let pixelPos = {
							x: parseInt(pixel.getAttribute("data-posX")!),
							y: parseInt(pixel.getAttribute("data-posY")!)
						}

						if ($matrixStore[pixelPos.x][pixelPos.y] == selectedColor.id) {
							return;
						}

						$matrixStore[pixelPos.x][pixelPos.y] = selectedColor.id;

						const msg = {
							data: [[pixelPos.x, pixelPos.y, selectedColor.id]] as Pixel[]
						};
						mqtt.sendMessages(msg);
					}
				}).then();
			}
		}
		}).then();
	}

	function save() {
		let data = "";

		$matrixStore.forEach((row, x) => {
			row.forEach((_, y) => {
				data += `${x},${y},${$matrixStore[x][y]}\n`;
			});
		});

		const blob = new Blob([data], { type: 'text/plain' });

		const a = document.createElement('a');
		a.download = Date.now().toString() + '.ptx';
		a.href = window.URL.createObjectURL(blob);
		a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
		a.style.display = "none";

		document.body.appendChild(a);
		a.click()
		document.body.removeChild(a);
	}

	function load() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.ptx';
		input.onchange = (event) => {
			const file = (event.target as HTMLInputElement).files![0];
			const reader = new FileReader();
			reader.onload = (event) => {
				const contents = (event.target as FileReader).result as string;
				const lines = contents.split("\n");

				lines.forEach(line => {
					const parts = line.split(",");
					const x = parseInt(parts[0]);
					const y = parseInt(parts[1]);
					const color = parseInt(parts[2]);

					$matrixStore[x][y] = color;

					const msg = {
						data: [[x, y, color]] as Pixel[]
					};

					mqtt.sendMessages(msg);
				});
			};
			reader.readAsText(file);
		};
		input.click();
	
		//mqtt.sendAllPixels($matrixStore);
	}

	onMount(() => {
		cursor?.classList.add(colors[1].cssClass);

		cursor!.style!.width = `${lineWidth}px`;
		cursor!.style!.height = `${lineWidth}px`;
	});
</script>

<svelte:head>
	<title>PixelTux</title>
	<meta name="description" content="A drawing app" />
</svelte:head>

<svelte:body on:touchmove={onTouch} on:mouseover={mouseMove} on:mouseup={onMouseUp} />

<main>
	<div id="content">
		<div id="toolbar">
			<h1>PixelTux</h1>

			<label>Colors</label>
			<div id="colors">
				{#each colors as color}
					<div id="{color.cssId}" class="{color.cssClass}" on:click={() => onColorClicked(color.id)}></div>
				{/each}
			</div>

			<label for="lineWidth">Line Width</label>

			<div id="lineWidthChanger">
				<button id="minus-button">-</button>
				<input id="lineWidth" name="lineWidth" type="number" min="1" bind:value={lineWidth} on:change={onLineWidthChanged}>
				<button id="plus-button">+</button>
			</div>


			<button id="eraser-button" on:click={() => onColorClicked(0)}>
				<FontAwesomeIcon icon={faEraser} />
			</button>
			<button id="save-button" on:click={save}>
				<Icon src={ArrowDownTray} theme='solid' class='color-gray-10'></Icon>
			</button>
			<button id="load-button" on:click={load}>
				<Icon src={ArrowUpTray} theme='solid' class='color-gray-10'></Icon>
			</button>
			<button id="clear-button" on:click={onCancelClicked}>
				<Icon src={Trash} theme='solid' class='color-gray-10'></Icon>
			</button>
		</div>
		<div class="h-screen w-screen bg-slate-700 justify-center flex">
			<div class="flex flex-col">
				<div class="bg-black p-8 grow-0 touch-none" on:mousedown={onMouseDown} on:touchdown={onTouch}>
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
	</div>
	<span class="dot" id="cursor" bind:this={cursor} />
</main>

<style>
	@import './styles.css';
</style>