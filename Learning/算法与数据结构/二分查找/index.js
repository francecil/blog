
/**
 * 在排序数组中查找元素，返回随便一个位置
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function searchCommon (nums, target) {
  let left = 0
  let right = nums.length //左闭右开
  while (left < right) {
    let mid = left + right >> 1
    if (nums[mid] < target) {
      left = mid + 1
    } else if (nums[mid] > target) {
      right = mid
    } else {
      return mid
    }
  }
  return -1
}
/**
 * 在排序数组中查找元素的第一个位置
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function searchFirst (nums, target) {
  let left = 0
  let right = nums.length //左闭右开
  while (left < right) {
    let mid = left + right >> 1
    if (nums[mid] < target) {
      left = mid + 1
    } else if (nums[mid] >= target) {
      right = mid
    }
  }
  // left 左边均 < target 右边均 >=target
  return nums[left] === target ? left : -1
}
/**
 * 在排序数组中查找元素的最后一个位置
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function searchLast (nums, target) {
  let left = 0
  let right = nums.length //左闭右开
  while (left < right) {
    let mid = left + right >> 1
    if (nums[mid] <= target) {
      left = mid + 1
    } else {
      right = mid
    }
  }
  // left 左边均 <= target 右边均 > target
  return nums[left-1] === target ? left-1 : -1
}