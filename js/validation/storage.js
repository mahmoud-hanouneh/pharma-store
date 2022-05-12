if (!getWithExpiry("SID")) location.replace("/login.html");

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