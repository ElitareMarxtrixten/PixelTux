<script lang="ts">
    import {MATRIX_SIZE_X, MATRIX_SIZE_Y} from "$lib/Constants.js";
    import {matrixStore} from "$lib/matrixStore.js";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    function onMouseDown() {
        dispatch("onMouseDown");
    }

    function onTouch() {
        dispatch("onTouch");
    }

    function colorForCode(colorId: number) {
        let colorClass: string = "";

        switch (colorId) {
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
</script>

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