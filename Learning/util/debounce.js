const debounce = (fn, duration) => /* TODO */
{
  let time = null
  return ()=>{
    clearTimeout(time)
    time = setTimeout(fn,duration)
  }
}