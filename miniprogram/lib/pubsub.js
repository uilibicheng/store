const events = {}

function sub(key, callback, context) {
  validateParams(callback, context)

  events[key] = events[key] || []
  events[key].push({callback, context})
  bindUnsubOnHooks(key, callback, context)
}

function pub(key, ...args) {
  const callbacks = events[key] || []
  callbacks.forEach(item => {
    const {callback, context} = item
    callback.apply(context, args)
  })
}

function unsub(key, callback, context) {
  validateParams(callback, context)

  const callbacks = events[key] || []
  events[key] = callbacks.filter(item => {
    return item.callback != callback && item.context != context
  })
}

function bindUnsubOnHooks(key, callback, context) {
  const unsubHooks = ['onUnload']
  unsubHooks.forEach(hook => {
    const _hook = context[hook]
    if (!_hook) return
    context[hook] = () => {
      _hook.call(context)
      unsub(key, callback, context)
    }
  })
}

function validateParams(callback, context) {
  if (typeof callback !== 'function') {
    throw new Error('param callback should be a function.')
  }

  if (context == null) {
    throw new Error('param context is required.')
  }
}

const debug = false

export default {
  pub,
  sub,
  unsub,
  events: debug ? events : {},
}
