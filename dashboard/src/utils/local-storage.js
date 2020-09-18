export const setStorage = (key, val) => window.localStorage.setItem(key, val)

export const getStorage = key => window.localStorage.getItem(key)

export const removeStorage = key => window.localStorage.removeItem(key)

export const clearStorage = () => window.localStorage.clear()
