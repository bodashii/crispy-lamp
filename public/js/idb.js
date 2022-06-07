let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function (e) {
    const db = e.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function (e) {
    db = e.target.result;

    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function (e) {
    console.log(e.target.errorCode);
};

function saveTransaction(t) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const tObjectStore = transaction.objectStore('new_transaction');

    tObjectStore.add(t);
}

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const tObjectStore = transaction.objectStore('new_transaction');
    const getAll = tObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((res) => res.json())
                .then((servRes) => {
                    if (servRes.message) {
                        throw new Error(servRes);
                    }
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    const tObjectStore = transaction.objectStore('new_transaction');
                    tObjectStore.clear();

                    alert('Saved transactions were submitted')
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };
}

window.addEventListener('online', uploadTransaction);