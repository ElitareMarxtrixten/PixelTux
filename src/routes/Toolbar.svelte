<script lang="ts">
    import {faEraser} from "@fortawesome/free-solid-svg-icons";
    import {ArrowDownTray, ArrowUpTray, Trash} from "@steeze-ui/heroicons";
    import {FontAwesomeIcon} from "@fortawesome/svelte-fontawesome";
    import {Icon} from "@steeze-ui/svelte-icon";
    import {createEventDispatcher} from "svelte";
    import {colors} from "$lib/Color";

    export let lineWidth;

    const dispatch = createEventDispatcher();

    function onColorClicked(colorId: number) {
        dispatch("onColorClicked", {colorId});
    }

    function onMinusButtonClicked() {
        dispatch("onMinusButtonClicked");
    }

    function onLineWidthChanged() {
        dispatch("onLineWidthChanged");
    }

    function onPlusButtonClicked() {
        dispatch("onPlusButtonClicked");
    }

    function onSaveClicked() {
        dispatch("onSaveClicked");
    }

    function onLoadClicked() {
        dispatch("onLoadClicked");
    }

    function onCancelClicked() {
        dispatch("onCancelClicked");
    }
</script>


<div id="toolbar">
    <h1>PixelTux</h1>

    <label>Colors</label>
    <div id="colors">
        {#each colors as color, index}
            {#if index !== 0}
                <div class="color-circle {color.cssClass}" on:click={() => onColorClicked(color.id)}></div>
            {/if}
        {/each}
    </div>

    <label for="lineWidth">Line Width</label>

    <div id="lineWidthChanger">
        <button id="minus-button" on:click={onMinusButtonClicked}>-</button>
        <input id="lineWidth" name="lineWidth" type="number" min="1" bind:value={lineWidth} on:change={onLineWidthChanged}>
        <button id="plus-button" on:click={onPlusButtonClicked}>+</button>
    </div>

    <button id="eraser-button" on:click={() => onColorClicked(0)}>
        <FontAwesomeIcon icon={faEraser} />
    </button>
    <button id="save-button" on:click={onSaveClicked}>
        <Icon src={ArrowDownTray} theme='solid' class='color-gray-10'></Icon>
    </button>
    <button id="load-button" on:click={onLoadClicked}>
        <Icon src={ArrowUpTray} theme='solid' class='color-gray-10'></Icon>
    </button>
    <button id="clear-button" on:click={onCancelClicked}>
        <Icon src={Trash} theme='solid' class='color-gray-10'></Icon>
    </button>
</div>