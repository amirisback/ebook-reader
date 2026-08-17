/**
 * IndexedDB helper untuk menyimpan data biner PDF lokal.
 * Mencegah hilangnya file PDF saat refresh halaman atau saat membuka dari "Terakhir Dibaca".
 * Client-side only (IndexedDB).
 */

const DB_NAME = "DocuFlip_DB";
const STORE_NAME = "pdf_files";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePdfToDB(id: string, file: File | ArrayBuffer): Promise<void> {
  try {
    const db = await openDB();
    const buffer = file instanceof File ? await file.arrayBuffer() : file;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id, data: buffer, updatedAt: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Gagal menyimpan PDF ke IndexedDB:", err);
  }
}

export async function getPdfFromDB(id: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result?.data) {
          resolve(request.result.data as ArrayBuffer);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Gagal mengambil PDF dari IndexedDB:", err);
    return null;
  }
}

export async function deletePdfFromDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Gagal menghapus PDF dari IndexedDB:", err);
  }
}
