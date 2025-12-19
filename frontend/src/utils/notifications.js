export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Notifications not supported in this browser")
    return { allowed: false, error: "Not supported" }
  }

  const permission = await Notification.requestPermission()
  console.log("Notification permission:", permission)

  return { allowed: permission === "granted", permission }
}

export function sendNotification(title, body) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Notifications not supported in this browser")
    return
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission is not granted:", Notification.permission)
    return
  }

  // No icon => no favicon 404
  new Notification(title, { body })
}
