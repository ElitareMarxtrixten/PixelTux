<script lang="ts">
	import type { Pixel } from "$lib/MessageTypes";
	import { MqttService } from "$lib/MqttService";
	import { matrixStore } from "$lib/matrixStore";
	import type { Point } from "$lib/types/Point";
	import {onMount} from "svelte";
	import { config } from '@fortawesome/fontawesome-svg-core'

	import '@fortawesome/fontawesome-svg-core/styles.css'
	import Toolbar from "./Toolbar.svelte";
	import DrawBoard from "./DrawBoard.svelte";
	import type {Color} from "$lib/Color";
	import {colors} from "$lib/Color"; // Import the CSS
	config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

	let cursor: HTMLElement|undefined = undefined;
	let lineWidth: number = 25;
	let isPainting: boolean = false;
	let selectedColor: Color = colors[1];
	let mqttAddress = "";
	let topicPrefix = "";
	let loading = false;

	let mqttService = new MqttService();

	function onCancelClicked() {
		$matrixStore.forEach((row, x) => {
			row.forEach((_, y) => {
				$matrixStore[x][y] = 0;
			});
		});

		if (mqttService.isConnected()) {
			mqttService.clear();
		}
	}

	function onColorClicked(event: any) {
		selectedColor = colors.find(color => color.id === event.detail.colorId);

		cursor?.classList.remove(...cursor?.classList);
		cursor?.classList.add('dot');
		cursor?.classList.add(selectedColor.cssClass);
	}

	function onMinusButtonClicked() {
		if (lineWidth - 2 > 0) {
			lineWidth = lineWidth - 2;
			onLineWidthChanged();
		}
	}

	function onPlusButtonClicked() {
		lineWidth = lineWidth + 2;
		onLineWidthChanged();
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

		const center = lineWidth / 2;
		const mouse = {
			x: touch.clientX - center,
			y: touch.clientY - center
		}
		
		cursor!.style.left = `${mouse.x}px`;
		cursor!.style.top = `${mouse.y}px`;

		draw(mouse);
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

						if (mqttService.isConnected()) {
							mqttService.sendMessages(msg);
						}
					}
				}).then();
			}
		}
		}).then();
	}

	function onSaveClicked() {
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

	function onLoadClicked() {
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
					if (line.length == 0) {
						return;
					}

					const parts = line.split(",");
					const x = parseInt(parts[0]);
					const y = parseInt(parts[1]);
					const color = parseInt(parts[2]);
					$matrixStore[x][y] = color;
				});

				if (mqttService.isConnected()) {
					mqttService.sendAllPixels($matrixStore);
				}
			};
			reader.readAsText(file);
		};
		input.click();
	}

	async function handleSubscription() {
		if (mqttAddress === "") {
			alert("no mqtt address given!")
			return
		}

		if (topicPrefix === "") {
			alert("no topic prefix given!")
		}

		if (mqttService.isConnected()) {
			mqttService.disconnect()
		}

		loading = true
		try {
			mqttService.connect(mqttAddress, topicPrefix);
		} catch (_) {
			alert("Something went wrong during connection with mqqt message broker - see debug console for details");
		} finally {
			loading = false;
		}
	}

	function handleCloseSubscription() {
		mqttService.disconnect();
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
		<Toolbar
		lineWidth={lineWidth}
		on:onColorClicked={onColorClicked}
		on:onMinusButtonClicked={onMinusButtonClicked}
		on:lineWidthChanged={onLineWidthChanged}
		on:onPlusButtonClicked={onPlusButtonClicked}
		on:onSaveClicked={onSaveClicked}
		on:onLoadClicked={onLoadClicked}
		on:onCancelClicked={onCancelClicked} />

		<div class="h-screen w-screen bg-slate-700 justify-center grid pt-5">
			<DrawBoard
			on:onMouseDown={onMouseDown}
			on:onTouch={onTouch} />

			<div class="grow mt-5">
				<form on:submit={handleSubscription} class="flex gap-8 justify-center">
					<div class="flex gap-3">
						<label for="server-ip" class="text-gray-300 text-lg" >MQTT-Server Address:</label>
						<input id="server-ip"
							   bind:value={mqttAddress}
							   disabled={mqttService.isConnected()}
							   class="w-40 rounded-md py-1 px-2 text-gray-200 bg-slate-600 border border-slate-800">
					</div>

					<div class="flex gap-3">
						<label for="topic-prefix" class="text-gray-300 text-lg">Topic-Prefix</label>
						<input id="topic-prefix"
							   bind:value={topicPrefix}
							   disabled={mqttService.isConnected()}
							   class="w-40 rounded-md py-1 px-2 text-gray-200 bg-slate-600 border border-slate-800">
					</div>

					{#if !mqttService.isConnected()}
						<button class="w-40 h-10 rounded-md py-1 px-2 text-gray-200 bg-slate-600 border border-slate-800"
								class:opacity-50={loading} disabled={loading}>Connect</button>
					{:else}
						<button on:click|preventDefault={handleCloseSubscription}
								class="w-40 h-10 rounded-md py-1 px-2 text-gray-200 bg-red-900 border border-red-950">Disconnect</button>
					{/if}
				</form>
			</div>
		</div>
	</div>

	<span class="dot" id="cursor" bind:this={cursor} />
</main>

<style>
	@import './styles.css';
</style>