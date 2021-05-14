/* Calculates sum of i32 numbers */
export function main(n: i32): i64 {
  var result = 0;
  for (let i = 0;  i < n; ++i) {
      result += load<i32>(i * 4);
  }
  return result;
}

