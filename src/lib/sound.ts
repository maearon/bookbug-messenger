let sendAudio: HTMLAudioElement | null = null;
let receiveAudio: HTMLAudioElement | null = null;

export function playSendSound() {
  if (!sendAudio) {
    sendAudio = new Audio("/sounds/send.wav");
  }
  sendAudio.currentTime = 0;
  sendAudio.play().catch(() => {});
}

export function playReceiveSound() {
  if (!receiveAudio) {
    receiveAudio = new Audio("/sounds/receive.wav");
  }
  receiveAudio.currentTime = 0;
  receiveAudio.play().catch(() => {});
}
