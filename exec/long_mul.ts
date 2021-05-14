/* Calculates mul of i32 numbers */

function sleep(billions: i32): void {
    for (let i = 0; i < billions * 1000000000; i++) {}
}

export function main(n: i32): i64 {
    var result = 1;
    sleep(5);
    for (let i = 0;  i < n; ++i) {
        result *= load<i32>(i * 4);
    }
    return result;
}

