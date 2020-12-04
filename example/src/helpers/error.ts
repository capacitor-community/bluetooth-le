import { toastController } from '@ionic/core';

export async function handleError(error: Error) {
  console.error(error);
  const toast = await toastController.create({
    message: error.message,
    duration: 3000,
    buttons: [
      {
        text: 'Close',
        role: 'cancel',
      },
    ],
  });
  await toast.present();
}
