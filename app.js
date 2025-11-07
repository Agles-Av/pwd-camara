if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Service Worker registrado'))
        .catch(err => console.error('Error registrando SW:', err));
}

// Configuración de IndexedDB
let db;
const dbName = 'GaleriaPWA';
const storeName = 'fotos';

const request = indexedDB.open(dbName, 1);

request.onerror = (event) => {
    console.error('Error al abrir BD:', event.target.error);
};

request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    cargarGaleria();
};

// Referencias del DOM
const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gallery = document.getElementById('gallery');
const clearGalleryBtn = document.getElementById('clearGallery');

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
async function takePhoto() {
  if (!stream) {
    alert('Primero abre la cámara');
    return;
  }

  ctx.drawImage(video, 0, 0, 320, 240);

  const imageDataURL = canvas.toDataURL('image/png');
  await guardarFoto(imageDataURL);
  console.log('Foto capturada y guardada');
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

// 💾 Guardar foto en IndexedDB
function guardarFoto(dataURL) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const foto = {
      dataURL,
      fecha: new Date().toISOString()
    };
    
    const request = store.add(foto);
    
    request.onsuccess = () => {
      cargarGaleria();
      resolve();
    };
    
    request.onerror = () => {
      console.error('Error al guardar la foto:', request.error);
      reject(request.error);
    };
  });
}

// 🖼️ Cargar galería desde IndexedDB
function cargarGaleria() {
  const transaction = db.transaction([storeName], 'readonly');
  const store = transaction.objectStore(storeName);
  const request = store.getAll();

  request.onsuccess = () => {
    const fotos = request.result;
    gallery.innerHTML = '';
    
    fotos.forEach(foto => {
      const img = document.createElement('img');
      img.src = foto.dataURL;
      img.className = 'gallery-img';
      img.title = new Date(foto.fecha).toLocaleString();
      gallery.appendChild(img);
    });
  };
}

// 🗑️ Limpiar galería
function limpiarGaleria() {
  const transaction = db.transaction([storeName], 'readwrite');
  const store = transaction.objectStore(storeName);
  const request = store.clear();

  request.onsuccess = () => {
    gallery.innerHTML = '';
    console.log('Galería limpiada');
  };

  request.onerror = () => {
    console.error('Error al limpiar la galería:', request.error);
  };
}

// Eventos
openCameraBtn.addEventListener('click', openCamera);
takePhotoBtn.addEventListener('click', takePhoto);
clearGalleryBtn.addEventListener('click', limpiarGaleria);

window.addEventListener('beforeunload', closeCamera);
