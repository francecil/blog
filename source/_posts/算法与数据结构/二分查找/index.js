
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
  return nums[left - 1] === target ? left - 1 : -1
}

/**
 * 在排序数组中查找最后一个小于等于目标元素的项的索引位置
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 * @example searchLastLe([0,2,4,6],3) === 1
 */
function searchLastLe (nums, target) {
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
  return left - 1
}

/**
 * 在排序数组中查找第一个大于于等于目标元素的项的索引位置
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 * @example searchFirstGe([0,2,4,6],7) === -1
 * @example searchFirstGe([0,2,4,6],-1) === 0
 */
function searchFirstGe (nums, target) {
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
  return left === nums.length ? - 1 : left
}

/**
 * 在排序数组中查找第一个大于目标元素的项的索引位置
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 * @example searchFirstGe([0,2,4,6],6) === -1
 * @example searchFirstGe([0,2,4,6],0) === 1
 */
 function searchFirstGt (nums, target) {
  let left = 0
  let right = nums.length //左闭右开
  while (left < right) {
    let mid = left + right >> 1
    if (nums[mid] < target) {
      left = mid + 1
    } else if (nums[mid] > target) {
      right = mid
    } else {
      left = mid + 1
      break;
    }
  }
  return left === nums.length ? - 1 : left
}