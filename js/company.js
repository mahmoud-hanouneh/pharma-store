const form = document.querySelector("#postFormData");
const tableBody = document.querySelector("#table-body");

// captureing input elements
const companyName = document.querySelector("#comp-name");
const formFile = document.querySelector("#formFile");
const totalCompaniesNumber = document.querySelector("#total-companies");
const totalProductsNumber = document.querySelector("#total-pros")
const buttonSpinner = document.querySelector("#btn-spinner");

// submit button 
const cancelEditButton = document.querySelector("#cancel-edit");
const createButton = document.querySelector("#createBtn");

const apiEndpoint = '';
let compID;
let deleteCompID;
let errors = 0;

form.onsubmit = e => {

    e.preventDefault();

    const handlePostData = async function () {
        let id;
        let level;
        let postCompanyAPI;
        let fetchOptions;

        if (createButton.classList.contains('edit-company')) {
            level = 'update'
            id = compID;
        } else {
            level = 'insert'
            id = 0;
        }

        const companyNameValue = companyName.value.trim();
        const formFileValue = formFile.value.trim();
        const SID = getWithExpiry("SID");

        companyNameValue == '' && setError(companyName);
        
        if (errors == 0) {
            if (formFileValue !== '') {
                postCompanyAPI = `${apiEndpoint}/initImgCompanies`;
                const data = new FormData();
                data.append('level', level);
                data.append('id', id);
                data.append('state', 1);
                data.append('CoName', companyNameValue);
                data.append('address', 'اللاذقية');
                data.append('phone', '');
                data.append('notes', '');
                data.append('image', formFile.files[0]);
                data.append('sid', SID);
                fetchOptions = {
                    method: 'POST',
                    body: data
                }
            } else if (formFileValue == '') {
                postCompanyAPI = `${apiEndpoint}/initCompanies`;
                const requestBody = JSON.stringify({
                    level,
                    id,
                    state: 1,
                    CoName: companyNameValue,
                    address: 'اللاذقية',
                    phone: '',
                    notes: '',
                    image: '',
                    sid: SID // store id
                });
                //declar fetch options
                fetchOptions = {
                    method: 'POST',
                    headers : {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: requestBody
                } 
            }
            
            addButtonSpinner();  
            form.classList.remove("was-validated");
            try {
                const response = await fetch(postCompanyAPI, fetchOptions);
                const data = await response.json();
                if (data) {
                    if (level == 'update') {
                        retBtnStatus(id);
                        scrollToItem(id);
                    }
                form.reset();
                companyName.classList.remove('is-valid');
                removeButtonSpinner();
                updateCompanies();
                } else {
                    removeButtonSpinner();
                }
                console.log(data);

            } catch (err) { 
                console.log(err) 
                removeButtonSpinner();
            }
        } else {
            console.log("There are " + errors + " errors");
            errors = 0;
            console.log("errors are cleared now " + errors);
        }
        
    }();
    
};

const updateProductsNumber = async function () {
    const SID = getWithExpiry("SID")

    try {
        const response = await fetch(`${apiEndpoint}/ProFilter?level=selectSpecific&prodid=&sid=${SID}&coid=&type=&state=&not=deleted&pricest=`)
        const data = await response.json();
        console.log(data);
        if (data) totalProductsNumber.innerText = data.length;
    } catch (error) {
        console.log(error)
    }
}();

async function updateCompanies() {
    // const SID = localStorage.getItem("SID");
    const SID = getWithExpiry("SID")
    console.log(SID)
    try {
        const response = await fetch (`${apiEndpoint}/Companies?level=selectByStore&Coid=1&sid=${SID}`);
        const data = await response.json();
        console.log(data)
        
        if (data) {totalCompaniesNumber.innerText = data.length}
        tableBody.innerHTML = "";
        data.map((company, index) => {
        tableBody.innerHTML += `
        <tr id=${company.CoID}>
            <td>${++ index}</td>
            <td class="co-name">${company.CoName}</td>
            <td>${company.StoreName}</td>
            <td class="address">${company.address}</td>
            <td class="phone d-none">${company.phone}</td>
            <td>${company.dateCreated}</td>
            <td class="notes d-none">${company.notes}</td>
            <td class="text-center"><button onclick="editCompany(${company.CoID})" type="button" class="btn btn-outline-dark px-2 no-print"> <span class="button-text">تعديل</span>   <i class="bi bi-pencil-square"></i> </button></td>
            <td><button onclick="deleteCompany(${company.CoID})" type="button" class="btn btn-danger no-print" data-bs-toggle="modal" data-bs-target="#myModal"> <span class="button-text">حذف</span>  <i class="bi bi-trash"></i> </button></td>
           
        </tr>
    `
    })
    } catch (err) { 
        console.log(err) 
    }
    
}
// get companies list and insert it into dropdown list
updateCompanies()

async function editCompany(coid) {
    form.reset();
    compID = coid;
    const compNameValue = document.getElementById(coid).querySelector(".co-name").textContent
    companyName.value = compNameValue
    changeBtnStatus()
    form.scrollIntoView({
        behavior: "smooth"
    })
}

function changeBtnStatus() {
    createButton.classList.add('edit-company');
    createButton.classList.remove("btn-success");
    createButton.classList.add("btn-dark");

    createButton.innerText = "تعديل"
    createButton.innerHTML += `<i class="bi bi-pencil-square me-3"></i>`
    createButton.innerHTML += `<span id="btn-spinner" class="spinner-grow spinner-grow-sm d-none" role="status" aria-hidden="true"></span>`

    totalCompaniesNumber.classList.remove("bg-success");
    totalCompaniesNumber.classList.add("bg-dark");
    totalProductsNumber.classList.remove('bg-success');
    totalProductsNumber.classList.add('bg-dark');

    cancelEditButton.classList.remove("d-none");

}

function retBtnStatus(id) {
    createButton.classList.remove('edit-company')
    createButton.classList.remove("btn-dark")
    createButton.classList.add("btn-success")
            
    createButton.innerText = "إضافة شركة"
    createButton.innerHTML += `<i class="bi bi-plus-square me-2"></i>`
    createButton.innerHTML += `<span id="btn-spinner" class="spinner-grow spinner-grow-sm d-none" role="status" aria-hidden="true"></span>`
                
    totalCompaniesNumber.classList.remove("bg-dark")
    totalCompaniesNumber.classList.add("bg-success")
    totalProductsNumber.classList.add('bg-success');
    totalProductsNumber.classList.remove('bg-dark');
    cancelEditButton.classList.add("d-none");

}


function deleteCompany(coid) {
    deleteCompID = coid;
    console.log(deleteCompID)
}

async function confirmDeletion() {
    const SID = getWithExpiry("SID")
    console.log("deleting now .. ")
    const fetchOptions = {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json',
                    'Accept' : 'application/json'
                }, 
                body : JSON.stringify({
                    level: 'delete',
                    id: deleteCompID,
                    state: '',
                    CoName:'',
                    address: '',
                    phone: '',
                    notes: '',
                    image: '',
                    sid: SID // store id
                })
            }
    try {
        const response = await fetch(`${apiEndpoint}/initCompanies`, fetchOptions)
        const data = await response.json();
        console.log(data);
        if (data) {
            document.getElementById(deleteCompID).remove();
            updateCompanies();
        }

    } catch (error) {
        console.log(error)
    }
}

function scrollToItem(id) {
    document.getElementById(id).scrollIntoView({
        behavior: "smooth"
    })
                
    window.setTimeout(() => {
        document.getElementById(id).classList.add("bg-success");
        document.getElementById(id).classList.add("bg-opacity-25");
    }, 1000);
               
    // hide after 3 seconds
    window.setTimeout(() => {
        document.getElementById(id).classList.remove("bg-success");
        document.getElementById(id).classList.remove("bg-opacity-25");
    }, 1500);
}

function addButtonSpinner() {
    buttonSpinner.classList.remove("d-none");
    createButton.disabled = true;
}

function removeButtonSpinner() {
    buttonSpinner.classList.add("d-none");
    createButton.disabled = false;
}

function cancelEdit() {
    retBtnStatus();
    form.reset()
    companyName.classList.remove('is-valid');
}

const setError = (element) => {
    element.classList.add("is-invalid");
    element.classList.remove("is-valid");
    errors ++;
}

const setSuccess = (element) => {
    element.classList.add("is-valid");
    element.classList.remove("is-invalid");
}

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