

function setLocalStorgeWithExpiry(key, value, ttl) {
    const now = new Date();

    const item = {
        value : value,
        expiry: now.getTime() + ttl
    }

    localStorage.setItem(key, JSON.stringify(item));

}

function getWithExpiry(key) {
    const itemString = localStorage.getItem(key) 
    if (!itemString) return null;

    const item = JSON.parse(itemString)
    const now = new Date();

    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key)
        return null
    }
    return item.value
}

if (getWithExpiry("SID")) {
    document.querySelectorAll('.sign-link').forEach(link => {
        link.classList.add('d-none')
    })
    document.querySelector('#logout-link').classList.remove('d-none')
}
