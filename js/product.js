// form
const postFormData = document.querySelector("#postFormData");

// inputs
const prodName = document.querySelector("#prod-name");
const phPrice = document.querySelector("#ph-price");
const sellPrice = document.querySelector("#sell-price");
const ordersLimit = document.querySelector("#limit-of-order");
const prodType = document.querySelector("#prod-type");
const formFile = document.querySelector("#form-file");
const notes = document.querySelector("#notes");
const normal = document.querySelector("#normal");
const offer = document.querySelector("#offer");
const price = document.querySelector("#price-input");
const validity = document.querySelector("#validity");
const searchField = document.querySelector("#searchField");

const prodCompany = document.querySelector("#prod-company");
const priceInputContainer = document.querySelector("#price");
const hidePriceCheckbox = document.querySelector("#hide-price");
const createButton = document.querySelector("#CreateBtn");
const totalProductsNumber = document.querySelector("#total-products");
const totalCompaniesNumber = document.querySelector("#total-companies");

const buttonSpinner = document.querySelector("#btn-spinner");
const cancelEditButton = document.querySelector("#cancel-edit");
// filter 
const filterCompanies = document.querySelector("#filter-companies");
const filterState = document.querySelector("#filter-state");
const filterType = document.querySelector("#filter-type");
const filterPriceState = document.querySelector("#filter-priceState");

const apiEndpoint = '';
let productID;
let deletProdID;

let type = "";
let state = "";
let pricest = "";
let filterCompId = "";
let errors = 0;
const SID = getWithExpiry("SID");

const getCompNames =  async function () {
    try {
        const response = await fetch (`${apiEndpoint}Companies?level=selectByStore&Coid=&sid=${SID}`);
        const data = await response.json();
        if (data) {
            data.map(company => {
                prodCompany.innerHTML += `
                    <option id="comp${company.CoID}" value="${company.CoID}">${company.CoName}</option>
                `
                filterCompanies.innerHTML += `
                    <option value="${company.CoID}"> ${company.CoName}</option>

                `
            });
        }    
    } catch (err) {
        console.log(err);
    }
   
}();
const updateCompaniesNumber = async function () {
    try {
        const response = await fetch(`${apiEndpoint}Companies?level=selectByStore&Coid=1&sid=${SID}`)
        const data = await response.json();
        if (data) totalCompaniesNumber.innerText = data.length;
    } catch(error) {
        console.log(error)
    }
}();

async function updateProducts(filer) {
    let api;
    if (filer) {
        const searchKey = searchField.value.trim();
        let searchApi = `${apiEndpoint}Search?level=product&str=${searchKey}&sid=${SID}&coid=`;
        api = searchApi;
    } else {
        updateApi = `${apiEndpoint}ProFilter?level=selectSpecific&prodid=&sid=${SID}&coid=${filterCompId}&type=${type}&state=${state}&not=deleted&pricest=${pricest}`;
        api = updateApi;
    }
    
    document.querySelector("#table-body").innerHTML = "";
    try {
        const response = await fetch(api);
        const data = await response.json();
        if (data) {
            document.querySelector("#total-products").innerText = "";
            document.querySelector("#total-products").innerText = data.length;
            if (data.length !== 0) {
                data.map((product, index) => {
                
                    if (product.state == 'available') {
                        stateColor = 'table-success'
                        btnState = 'btn-dark'
                    } else if (product.state == 'unavailable') {
                        stateColor = 'table-danger'
                        btnState = 'btn-outline-dark'
                    } 
                    if (product.priceSt == 'shown') {
                        priceStateColor = 'table-success'
                    } else if (product.priceSt == 'hidden') {
                        priceStateColor = 'table-danger'
                    }

                    document.querySelector("#table-body").innerHTML += 
                    `<tr id=${product.prodID}>
                        <td>${++ index}</td>
                        <td class="prod-name-cell">${product.prodName}</td>
                        <td class="prod-comp-name">${product.companyName}</td>
                        <td class="${stateColor}">${product.state == 'available' ? 'صنف متوفر' : 'صنف مخفي'}</td>
                        <td class="priceState ${priceStateColor}">${product.priceSt == 'shown' ? 'متاح' : 'مخفي'}</td>
                        
                        <td class="type">${product.type == 'normal' ? 'عادي' : 'عرض'}</td>
                        <td class="d-none">${product.dateCreated}</td>
                        <td class="limit d-none">${product.limit}</td>
                        <td class="ph-price">${product.phPrice}</td>
                        <td class="sell-price">${product.sPrice}</td>
                        <td class="sprice">${product.price}</td>
                        <td class="validity d-none">${product.validity}</td>
                        <td class="notes d-none">${product.notes}</td>
                        <td class="price d-none">${product.price}</td>
                        <td class="year d-none">${product.year}</td>
                        <td class="month d-none">${product.month}</td>
                        <td class="day d-none">${product.day}</td>
                        <td class="validity">${product.validity.split(' ')[0]}</td>

                        <td class="text-center"><button onclick="editProductInfo(${product.prodID})" type="button" class="btn btn-outline-dark no-print"><span class="button-text">تعديل</span> <i class="bi bi-pencil-square"></i> </button></td>
                        <td class="text-center"><button onclick="hideProduct(${product.prodID})" type="button" class="btn ${product.state} hideBtn ${btnState} no-print"><span>${product.state !== 'unavailable' ? 'إخفاء' : 'إظهار'}</span> <i id="hide-btn-icon" class="bi bi-pencil-square"></i> </button></td>
                        <td><button onclick="deleteProduct(${product.prodID})" type="button" class="btn btn-danger no-print" data-bs-toggle="modal" data-bs-target="#myModal"><span class="button-text">حذف</span> <i class="bi bi-trash"></i> </button></td>
                    </tr>
                    `
                })
            } else if (data.length == 0) {
                if (filer) {
                    sendAlert('لا يوجد عناصر مُطابقة');
                    searchField.value = '';
                } else {
                    sendAlert(' لا يوجد أصناف ');
                }
                
            }
        }
        console.log(data);

    } catch (error) {
        console.log(error);
        sendAlert('تعذّر تحديث البيانات, الرجاء المحاولة مجدداً');
    }
};
updateProducts();

function handleChangedSelect(type) {
    type === "offer" ? priceInputContainer.classList.remove("d-none") : priceInputContainer.classList.add("d-none");
}

postFormData.addEventListener('submit', (event) => {
    event.preventDefault();
    postProductData();
}); 

async function postProductData() {
    let postProductAPI; 
    let fetchOptions;
    let id;
    let level;
    let state;
    let type;
    let priceFiled;
    let priceSt;

    // check post type weather is an update or insert
    if (createButton.classList.contains('edit-product')) {
        level = 'update'
        id = productID;
    } else {
        level = 'insert'
        id = 0;
    }

    // inputs value
    const companyID = prodCompany.value;
    const prodNameValue = prodName.value.trim();
    const phPriceValue = phPrice.value.trim();
    const sellPriceValue = sellPrice.value.trim();
    const ordersLimitValue = ordersLimit.value.trim();
    const formFileValue = formFile.value;
    const notesValue = notes.value.trim();
    const priceValue = price.value.trim();
    const validityValue = validity.value;
    let img;
    
    // validate inputs
    companyID == '0' && setError(prodCompany);
    prodNameValue == '' && setError(prodName);
    validityValue == '' && setError(validity);
    phPriceValue == '' && setError(phPrice);
    ordersLimitValue == '' && setError(ordersLimit);
    if (validityValue !== '') {
        const today = new Date().toJSON();
        if(validity.value < today.slice(0,10)) {
            setError(validity , 'الرجاء إدخال تاريخ صالح');
        }
    }
    offer.checked ? type = 'offer' : type = 'normal';
    type === "normal" ? priceFiled = phPriceValue : priceFiled = priceValue;

    if (type == 'offer') priceValue == '';

    hidePriceCheckbox.checked ? priceSt = "hidden" : priceSt = "shown";

    if (errors == 0) {
        if (formFileValue !== '') {
            postProductAPI = `http://durgs.robotic-mind.com/WebService.asmx/initImgProducts`;
            const formData = new FormData();
            formData.append("img",formFile.files[0]);
            formData.append("level", level);
            formData.append("id", id);
            formData.append("prodName", prodNameValue);
            formData.append("price", priceFiled);
            formData.append("phPrice", phPriceValue);
            formData.append("sPrice", sellPriceValue);
            formData.append("limit", ordersLimitValue);
            formData.append("type", type);
            formData.append("notes", notesValue);
            formData.append("state", 'available');
            formData.append("pricest", priceSt);
            formData.append("rate", '0');
            formData.append("validity", validityValue);
            formData.append("sid", SID);
            formData.append("catid", '1');
            formData.append("coid", companyID);
            formData.append("sort", '1');
            fetchOptions = {
                method: 'POST',
                body: formData
            }
    
        } else if (formFileValue == '') {
            postProductAPI = `http://durgs.robotic-mind.com/WebService.asmx/initProducts`;
            const requestBody = JSON.stringify({
                level,
                id,
                prodName: prodNameValue,
                price: priceFiled,
                phPrice: phPriceValue,
                sPrice: sellPriceValue,
                limit: ordersLimitValue,
                type,
                notes: notesValue,
                state : 'available',
                rate: 0,
                validity: validityValue,
                sid: SID,
                coid: companyID, // essential
                sort: 1,
                catid: 1,
                priceSt: priceSt,
                img: ''
            });
            fetchOptions = {
                method: 'POST',
                headers : {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: requestBody
            } 
        };
        postFormData.classList.remove("was-validated");
        addButtonSpinner();

        try {
           const response = await fetch (postProductAPI , fetchOptions);
           const data = await response.json();
           if(data) {

                if (level == 'update') {
                    retBtnStatus(id)
                    scrollToItem(id)
                    priceInputContainer.classList.add('d-none');
                }
                removeButtonSpinner();
                postFormData.reset();
                updateProducts();
                priceInputContainer.classList.add("d-none");

                document.querySelectorAll('input').forEach(input => {
                    if(input.classList.contains('is-invalid')) input.classList.remove('is-invalid');
                });

            } else {
                removeButtonSpinner();
                priceInputContainer.classList.add("d-none");
                
            }
            console.log(data);
    
        } catch(error) {
            console.log(error)
            removeButtonSpinner();
        }
    } else {
        errors = 0;
        console.log("errors are cleared now: " + errors);
        postFormData.classList.add("was-validated")
    }
    
}
// edit product handler
function editProductInfo(prodid) {
    postFormData.reset();
    productID = prodid;
    // capture table values
    const prod_nameValue = document.getElementById(prodid).querySelector(".prod-name-cell").textContent;
    const ph_priceValue = document.getElementById(prodid).querySelector(".ph-price").textContent;
    const sell_priceValue = document.getElementById(prodid).querySelector(".sell-price").textContent;
    const limit = document.getElementById(prodid).querySelector(".limit").textContent;
    const type = document.getElementById(prodid).querySelector(".type").textContent;
    const validity = document.getElementById(prodid).querySelector(".validity").textContent;
    const year = document.getElementById(prodid).querySelector(".year").textContent;
    let month = document.getElementById(prodid).querySelector(".month").textContent;
    let day = document.getElementById(prodid).querySelector(".day").textContent;
    const notesValue = document.getElementById(prodid).querySelector(".notes").textContent;
    const priceValue = document.getElementById(prodid).querySelector(".price").textContent;
    const comp_name = document.getElementById(prodid).querySelector(".prod-comp-name").textContent;
    const priceState = document.getElementById(prodid).querySelector('.priceState').textContent;
    // format date to YYYY-MM-DD
    if(day.length == 1) day = '0' + day;
    if(month.length == 1) month = '0' + month;
    const date = year + '-' + month + '-' + day;
    // insert product values in the form
    document.querySelector("#validity").value = date;
    prodName.value = prod_nameValue;
    phPrice.value = ph_priceValue;
    sellPrice.value = sell_priceValue;
    ordersLimit.value = limit;
    typeValue = type
    notes.value = notesValue
    // select the matching company
    prodCompany.querySelectorAll("option")
        .forEach(element => {
            if (element.textContent == comp_name) {
                element.selected = true;
            }
        });
    if (priceState !== 'متاح') hidePriceCheckbox.checked = true;
    if (typeValue == 'عرض') {
        offer.checked = true
        priceInputContainer.classList.remove("d-none")
        price.value = priceValue
    } else if (typeValue == 'عادي') {
        normal.checked = true
        priceInputContainer.classList.add('d-none')
    }
    changeBtnStatus();
    postFormData.scrollIntoView({
        behavior: "smooth"
    })
}
// hide product handler
async function hideProduct(proid) {
    let newState;
    if (document.getElementById(proid).querySelector('.hideBtn').classList.contains('unavailable')) {
        newState = 'available';
    } else {
        newState = 'unavailable';
    }
    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'Accept' : 'application/json'
        }, 
        body : JSON.stringify({
            level: 'updatestate',
            id: proid,
            prodName: '',
            price: '',
            phPrice: '',
            sPrice: '',
            limit: '',
            type: '',
            notes: '',
            image: '',
            state: newState,
            rate: '',
            validity: '',
            sid: SID,
            coid: '',
            sort: '',
            catid: '',
            priceSt: ''
        })
    }
    console.log(fetchOptions.body)
    try {
        const response = await fetch('http://durgs.robotic-mind.com/WebService.asmx/initProducts', fetchOptions)
        const data = await response.json();
        console.log(data);
        if (data) {
            updateProducts();
        }

    } catch (error) {
        console.log(error)
    }
}

async function confirmDeletion() {
    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'Accept' : 'application/json'
        }, 
        body : JSON.stringify({
            level: 'delete',
            id: deletProdID,
            prodName: '',
            price: '',
            phPrice: '',
            sPrice: '',
            limit: '',
            type: '',
            notes: '',
            image: '',
            state: '',
            rate: '',
            validity: '',
            sid: SID,
            coid: '',
            sort: '',
            catid: '',
            priceSt: ''
        })
    }
    try {
        const response = await fetch('http://durgs.robotic-mind.com/WebService.asmx/initProducts', fetchOptions)
        const data = await response.json();
        console.log(data);
        if (data) updateProducts();
    } catch (error) {
        console.log(error)
    }
} 

// ------------- REUSABLE Functions ------------- //

function deleteProduct(prodid) {
    deletProdID = prodid;
    console.log(deletProdID);
    postFormData.reset();
}
function changeBtnStatus() {
     createButton.classList.remove("btn-success")
     createButton.classList.add("btn-dark")
     createButton.innerText = "تعديل"
     createButton.innerHTML += `<i class="bi bi-pencil-square me-3"></i>`
     createButton.innerHTML += `<span id="btn-spinner" class="spinner-grow spinner-grow-sm d-none" role="status" aria-hidden="true"></span>`
     createButton.classList.add('edit-product')

     totalProductsNumber.classList.remove("bg-success")
     totalProductsNumber.classList.add("bg-dark");
     totalCompaniesNumber.classList.remove('bg-success')
     totalCompaniesNumber.classList.add('bg-dark')
     cancelEditButton.classList.remove("d-none");
}

function retBtnStatus(id) {
    createButton.classList.remove('edit-product')
    createButton.classList.remove("btn-dark")
    createButton.classList.add("btn-success")
    createButton.innerText = "إضافة منتج"
    createButton.innerHTML += `<i class="bi bi-plus-square me-2"></i>`
    createButton.innerHTML += `<span id="btn-spinner" class="spinner-grow spinner-grow-sm d-none" role="status" aria-hidden="true"></span>`
    totalProductsNumber.classList.remove("bg-dark")
    totalProductsNumber.classList.add("bg-success")
    totalCompaniesNumber.classList.remove('bg-dark')
    totalCompaniesNumber.classList.add('bg-success')
    cancelEditButton.classList.add("d-none");

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
function cancelEdit() {
    retBtnStatus();
    postFormData.reset();
    priceInputContainer.classList.add('d-none')

}
function addButtonSpinner() {
    buttonSpinner.classList.remove("d-none");
    createButton.disabled = true;
}

function removeButtonSpinner() {
    buttonSpinner.classList.add("d-none");
    createButton.disabled = false;
}
function sendAlert(message) {
    document.querySelector("#table-body").innerHTML = "";
    document.querySelector("#table-body").innerHTML += `
    <div class="alert alert-info mt-2" role="alert">
        ${message}
    </div>`;
}
// fire an error on an invalid input value
const setError = (element, message) => {
    if (message) element.parentElement.querySelector('.invalid-feedback').innerText = message;
    element.classList.add("is-invalid");
    element.classList.remove("is-valid");
    errors ++;
    
}

// ------------- Filters ------------- //
function setFilterCompany() {
    console.log(filterCompanies.value)
    filterCompId = filterCompanies.value;
    updateProducts();
}
function setFilterState() {
    switch (filterState.value) {
        case 'all':
            state = '';
            updateProducts();
            break;
        case 'available':
            state = 'available';
            updateProducts();
            break;
        case 'unavailable':
            state = 'unavailable';
            updateProducts();
            break;
        }
}
function setFilterPriceState() {
    switch (filterPriceState.value) {
        case 'all':
            pricest = '';
            updateProducts();
            break;
        case 'shown':
            pricest = 'shown';
            updateProducts();
            break;
        case 'hidden':
            pricest = 'hidden';
            updateProducts();
            break;
    }
}
function setFilterType() {
    switch(filterType.value) {
        case 'all':
            type = '';
            updateProducts();
            break;
        case 'normal':
            type = 'normal';
            updateProducts();
            break;
        case 'offer':
            type = 'offer';
            updateProducts();
            break;
    }
}
// refresh products 
function refresh() {
    state = '';
    type = '';
    pricest = '';
    filterCompId = '';
    filterCompanies.selectedIndex = 0;
    filterState.selectedIndex = 0; 
    filterType.selectedIndex = 0; 
    filterPriceState.selectedIndex = 0;
     updateProducts();
}
searchField.addEventListener('keyup', (event)=> {
    if(event.keyCode == 13) {
        event.preventDefault();
        document.querySelector('#search-btn').click();
    }
});

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
