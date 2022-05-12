const mobileInput = document.querySelector("#mobile-login");
const password = document.querySelector("#password");

const loginForm = document.querySelector("#loginForm")
const submitBtn = document.querySelector("#submit-button");
const apiEndpoint = '';
let errors = 0;
mobileInput.value = getWithExpiry("phone");

loginForm.addEventListener("submit", e => {
    e.preventDefault();
    checkInfo();
})

async function checkInfo() {
    document.querySelector("#result").innerText = "";
    const mobileInputValue = mobileInput.value.trim();
    const passwordValue = password.value.trim();

    mobileInputValue == '' && setError(mobileInput, 'لا يمكن ترك رقم الهاتف فارغاً');
    if (passwordValue == '' || passwordValue.length < 6) setError(password, 'كلمة المرور خاطئة')

    if (errors == 0) {
        disableButton(true);
        loginForm.classList.remove('was-validated');

        const fetchOptions = {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                'Accept' : 'application/json'
            }, 
            body: JSON.stringify({
                phone: mobileInputValue,
                password: passwordValue
            })
        }
        try {
            const response = await fetch(`${apiEndpoint}/loginStore`, fetchOptions)
            const data = await response.json();
            console.log(data)
            if (data.d.length == 1) {
                setLocalStorgeWithExpiry("SID",data.d[0].SID, 86400000);
                setLocalStorgeWithExpiry("fk_address",data.d[0].fk, 86400000);
                setLocalStorgeWithExpiry("fk_address",data.d[0].fk, 86400000);
                setLocalStorgeWithExpiry("phone",mobileInputValue, 86400000);
                location.replace("/companies.html");
            } else {
                console.log("Failed logging in ..");
                disableButton(false);
                document.querySelector("#result").innerText = ' تعذّر تسجيل الدخول, رقم الموبايل أو كلمة المرور خاطئة ' 
            }
        } catch (error) {
            console.log(error)
            disableButton(false);
        }
    } else {
        errors = 0
        loginForm.classList.add('was-validated');
    }
    
}

const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector(".invalid-feedback");
    errorDisplay.innerText = message;
    element.classList.add("is-invalid");
    element.classList.remove("is-valid");
    errors ++;
}

const setSuccess = (element) => {
    element.classList.add("is-valid");
    element.classList.remove("is-invalid");
}

const disableButton = (state) => {
    submitBtn.disabled = state;
}

// Set Local Storage With Expiry
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