var bucketSort = function (nums) {
  let min = Math.min(...nums)
  let max = Math.max(...nums)
  const bucketNum = 100 // 按实际情况设置桶的个数 nums.length
  let buckets = []
  const bucketSize = Math.floor((max - min) / bucketNum) + 1
  for (let i = 0; i < nums.length; i++) {
    const index = ~~((nums[i] - min) / bucketSize)
    !buckets[index] && (buckets[index] = [])
    buckets[index].push(nums[i])
  }

  let wrapBuckets = []
  for (let i = 0; i < buckets.length; i++) {
    buckets[i] && (wrapBuckets = wrapBuckets.concat(buckets[i].sort((a, b) => a - b)))
  }
  return wrapBuckets
}