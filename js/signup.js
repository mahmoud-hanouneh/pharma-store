const endpoint = '';
let errors = 0;

const getCityIDs = async function () {
    try {
        const response = await fetch(`${endpoint}City?level=select&id=`);
        const data = await response.json();
        console.log(data)
        if (data) {
            data.map((city, index) => {
                document.querySelector("#cityID").innerHTML += `
                <option value="${city.CityID}">${city.CtName}</option>
                 `
            })
       
        }
    } catch (error) {
        console.log(error)
    }
}();

const form = document.querySelector("#createStoreForm");
const submitBtn = document.querySelector("#submit-button");
// inputs
const storeName = document.querySelector("#store-name");
const storePhone1 = document.querySelector("#phone");
const storePhone2 = document.querySelector("#phone2");
const storePassword = document.querySelector("#password");
const storeConfirmPassword = document.querySelector("#confirm-password");
const storeNotes = document.querySelector("#notes");
const CityID = document.querySelector("#cityID");
const address = document.querySelector("#address");



form.addEventListener('submit', (e) => {
    e.preventDefault();
    handelPostStoreDate();
})

// validate passwords
const validatePasswords = (sPassValue, sConfPassValue) => {
    // validate first password 
    if(sPassValue === "") {
        setError(storePassword, "الرجاء إدخال كلمة مرور");
        
    } else if (sPassValue.length < 6) {
        setError(storePassword, "الرجاء إدخال كلمة مرور من 6 أحرف أو أرقام على الأقل");
        
    } else {
        setSuccess(storePassword);
    }

    //validate second password 
    if(sConfPassValue === "") {
        setError(storeConfirmPassword, "الرجاء تأكيد كلمة المرور");
    
    } else if (sConfPassValue == sPassValue) {
            if (sConfPassValue.length < 6) {
                setError(storeConfirmPassword, "لرجاء إدخال كلمة مرور من 6 أحرف أو أرقام على الأقل");
               
            } else {
                setSuccess(storeConfirmPassword);
            }
    } else {
        setError(storePassword, "كلمتي المرور غير متطابقة");
        setError(storeConfirmPassword, "كلمتي المرور غير متطابقة");
       
    }
}

async function handelPostStoreDate() {

    const storeNameValue = storeName.value.trim();
    const storePhone1Value = storePhone1.value.trim();
    const storePhone2Value = storePhone2.value.trim();
    const sPassValue = storePassword.value.trim();
    const sConfPassValue = storeConfirmPassword.value.trim();
    const storeNotesValue = storeNotes.value.trim();
    const CityIDValue = CityID.value;
    const addressValue = address.value.trim();

    storeNameValue == '' && setError(storeName, 'حقل مطلوب');
    storePhone1Value == '' && setError(storePhone1, 'حقل مطلوب');
    addressValue == '' && setError(address, 'حقل مطلوب');
    validatePasswords(sPassValue, sConfPassValue);

    if (errors == 0) {
        disableButton(true)
        form.classList.remove('was-validated');

        const fetchOptions = {
            method: 'POST', 
            headers: {
                'Content-Type' : 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                level: 'insert',
                id: '0',
                SName: storeNameValue,
                phone: storePhone1Value,
                phone2: storePhone2Value,
                password: sPassValue,
                notes: storeNotesValue,
                state: '1',
                image: '',
                rate: '0',
                cityid: CityIDValue,
                address: addressValue
            })
        }
        try {
            const response = await fetch(`${endpoint}initStore`, fetchOptions)
            const data = await response.json();
            console.log(data)
            if (data) {
                setLocalStorgeWithExpiry("phone", storePhone1Value, 8640000)
                window.location.replace("/login.html")
            }
        } catch (error) {
            console.log(error)
            disableButton(false)
        }
    } else {
        form.classList.add('was-validated');
        errors = 0;
    }
    
} 
// -------- Reusable Functions -----------//
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

function setLocalStorgeWithExpiry(key, value, ttl) {
    const now = new Date();
    const item = {
        value : value,
        expiry: now.getTime() + ttl
    }
    localStorage.setItem(key, JSON.stringify(item));

}
