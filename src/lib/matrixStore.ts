import { writable } from "svelte/store";
import { MATRIX_SIZE_X, MATRIX_SIZE_Y } from "./Constants";


function initState(): number[][] {
    return Array.from({ length: MATRIX_SIZE_X }, () =>
        Array.from({ length: MATRIX_SIZE_Y }, () => 0)
    );
}

export const matrixStore = writable(initState())