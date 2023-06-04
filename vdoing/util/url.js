export const getQuery = (key) => {
  const url = new URL(location.href);
  return url.searchParams.get(key);
};

export const setQuery = (key, value) => {
    const url = new URL(location.href);
    url.searchParams.set(key, value)
    history.replaceState({}, "", url)
}