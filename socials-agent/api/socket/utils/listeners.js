export function setupListener(userListeners, userId, messenger, eventType, listener, once = false) {
  if (!userListeners.has(userId)) {
    userListeners.set(userId, new Map());
  }

  const userMessengerListeners = userListeners.get(userId);
  if (!userMessengerListeners.has(messenger)) {
    userMessengerListeners.set(messenger, new Map());
  }

  const messengerListeners = userMessengerListeners.get(messenger);
  if (!messengerListeners.has(eventType)) {
    let actualListener = listener;
    if (once) {
      actualListener = function (...args) {
        listener(...args);
        messenger.removeListener(eventType, actualListener);
        messengerListeners.delete(eventType);
      };
    }
    messengerListeners.set(eventType, actualListener);
    messenger.on(eventType, actualListener);
  }
}

export function cleanupUserListeners(userListeners, userId) {
  const userMessengerListeners = userListeners.get(userId);
  if (!userMessengerListeners) return;

  userMessengerListeners.forEach((messengerListeners, messenger) => {
    messengerListeners.forEach((listener, eventType) => {
      messenger.removeListener(eventType, listener);
    });
  });

  userListeners.delete(userId);
}