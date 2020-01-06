
function qsort (array, compareFn) {
  compareFn = compareFn || function (a, b) { return a - b }
  function swap (arr, i1, i2) {
    let tmp = arr[i1]
    arr[i1] = arr[i2]
    arr[i2] = tmp
  }
  // 基准在右边
  function partition (arr, left, right) {
    let storeIndex = left // 其值等于表示已找到的小于基准值的元素个数
    let pivot = arr[right] //基准
    for (let i = left; i < right; i++) {
      if (comparefn(arr[i], pivot) < 0) {
        swap(arr, storeIndex++, i)
      }
    }
    swap(arr, storeIndex, right)
    return storeIndex
  }
  function innerSort (arr, left, right) {
    if (left < right) {
      let storeIndex = partition(arr, left, right);
      innerSort(arr, left, storeIndex - 1);
      innerSort(arr, storeIndex + 1, right);
    }
  }
  innerSort(array, 0, array.length - 1);
  return array
}