function logOut () {
    localStorage.removeItem('SID');
    window.location.replace('/login.html');
}
