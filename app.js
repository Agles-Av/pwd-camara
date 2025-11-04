if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Service Worker registrado'))
        .catch(err => console.error('Error registrando SW:', err));
}

// Referencias del DOM
const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let stream = null;

// 📹 Abrir la cámara
async function openCamera() {
  try {
    const constraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 320 },
        height: { ideal: 240 }
      }
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    cameraContainer.style.display = 'block';
    openCameraBtn.textContent = 'Cámara Abierta';
    openCameraBtn.disabled = true;

    console.log('Cámara abierta correctamente');
  } catch (error) {
    console.error('Error al abrir la cámara:', error);
    alert('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
  }
}

// 📸 Capturar la foto
function takePhoto() {
  if (!stream) {
    alert('Primero abre la cámara');
    return;
  }

  ctx.drawImage(video, 0, 0, 320, 240);

  const imageDataURL = canvas.toDataURL('image/png');
  console.log('Foto capturada:', imageDataURL.substring(0, 50) + '...');
  closeCamera();
}

// 🛑 Cerrar la cámara
function closeCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
    video.srcObject = null;
    cameraContainer.style.display = 'none';
    openCameraBtn.textContent = 'Abrir Cámara';
    openCameraBtn.disabled = false;
    console.log('Cámara cerrada');
  }
}

// Eventos
openCameraBtn.addEventListener('click', openCamera);
takePhotoBtn.addEventListener('click', takePhoto);

window.addEventListener('beforeunload', closeCamera);
