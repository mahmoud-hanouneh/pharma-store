const row = document.querySelector("#row");
const offcanvasRight = document.querySelector("#offcanvasRight");
const offcanvasBody = document.querySelector(".offcanvas-body");
const filterCompany = document.querySelector("#filter-company");
const tableBody = document.querySelector("#table-body");
const table = document.querySelector("#table");
const message = document.querySelector("#message");
const addProductToOrder = document.querySelector(".addProductToOrder");
const confirmBtnDiv = document.querySelector(".confirmBtn");
const addedProductsContainer = document.querySelector("#added-products");
const prodSpinner = document.querySelector("#prod-spinner");
const addproductsbutton = document.querySelector("#add-products-button");
const phTableBody = document.querySelector("#ph-table-body");
const ordsTableBody = document.querySelector("#ords-table-body");
const editOrderBtn = document.querySelector("#edit-order");
const confirmEditBtn = document.querySelector("#confirm-edit-btn");
const SID = getWithExpiry("SID")

const endpoint = '';

const orid = JSON.parse(sessionStorage.getItem("orderDetails")).orderID;
const ordState = JSON.parse(sessionStorage.getItem("orderDetails")).state;
let quans = [];
let PIDs = [];


// companies select options
const getCompNames =  async function () {
    try {
        const response = await fetch (`${endpoint}/Companies?level=selectByStore&Coid=&sid=${SID}`);
        const data = await response.json();
        if (data) {
            data.map(company => {
                filterCompany.innerHTML += `
                    <option value="${company.CoID}"> ${company.CoName}</option>
                    `
            });
        }    
    } catch (err) {
        console.log(err);
    }
   
}();

async function getPhDetails () {
    phTableBody.innerHTML = "";
    try {
        const response = await fetch(`${endpoint}/Order?level=selectState&OID=&phID=&sid=${SID}&state=${ordState}&date1=&date2=`);
        const data = await response.json();
        if (data) {
            const phDetails = data.find(ph => ph.OID == orid)
            console.log(phDetails);
            phTableBody.innerHTML += `
            <tr>    
                <td>${phDetails.pharmName}</td>
                <td>${phDetails.address}</td>
                <td>${phDetails.phone}</td>
                <td id="total-order-price">${phDetails.totalPrice}</td>
                <td>${phDetails.dateCreated.split(" ")[0]}</td>
                <td>${phDetails.date.split(" ")[0]}</td>
                <td>${phDetails.notes}</td>

            </tr>
                `
        }
     } catch (error) {
        console.log(error);
    }
};
getPhDetails();

async function insertDetails (orid) {
    ordState == 'active' && addproductsbutton.classList.remove("d-none")
    ordState == 'active' && editOrderBtn.classList.remove('d-none');
    try {
        const response = await fetch(`${endpoint}/OrderDetails?level=SelectbyOrd&orID=&OID=${orid}`);
        const data = await response.json();
        console.log(data);
        ordsTableBody.innerHTML = "";
        data.map(item => {
            ordsTableBody.innerHTML += `
            <tr class="prod-tr" id="card${item.prodID}">    
                <td>${item.prodName}</td>
                <td>${item.companyName}</td>
                <td class="quantityTD" style="width: 10%">${item.quantity}</td>
                <td class="sPrice" style="width: 10%">${item.phPrice}</td>
                <td class="wholePrice" style="width: 10%">${item.phPrice * item.quantity}</td>
                <td>${item.type == 'normal' ? 'عادي' : 'عرض'}</td>
                <td class="ordDetID d-none">${item.ordDetID}</td>
                <td class="limit d-none">${item.limit}</td>

                <td style="width: 10%"> 
                    <button onclick="deleteFromOdrder(${item.prodID})" class="btn btn-danger delete-from-order d-none">حذف <i class="bi bi-trash"></i>  </button>
                </td>
                <td style="width: 10%">
                    <button onclick="cancelDeletion(${item.prodID})" class="btn btn-outline-danger cancel-delete-from-order d-none">تراجع  <i class="bi bi-arrow-counterclockwise"></i>  </button>
                </td>
            </tr>
                `
        });
       
    } catch (error) {
        console.log(error)
    }
    
}
insertDetails(orid);
// products table 
async function getRelatedProducts() {
    const coid = filterCompany.value;
    console.log(coid);

    if(coid == 0) return;
    toggleSpinner();

    tableBody.innerHTML = "";
    try {
        const response = await fetch(`${endpoint}/ProFilter?level=selectSpecific&prodid=&sid=${SID}&coid=${coid}&type=&state=&not=deleted&pricest=`)
        const data = await response.json();
        console.log(data);
        if (data) {
            toggleSpinner();
            if (data.length == 0) {
                table.classList.add("d-none");
                message.innerHTML = `
                    <h5 class="mt-4">لا توجد أصناف مضافة تابعة لهذه الشركة </h5>
                `
            } else {
                message.innerHTML = "";
                table.classList.remove("d-none");
                data.map((product, index) => {
                    tableBody.innerHTML += `
                        <tr class="prod-tr-oc" id="${product.prodID}">
                            <td class="prod-name">${product.prodName}</td>
                            <td class="price">${product.phPrice}</td>
                            <td class="d-none company-name">${product.companyName}</td>
                            <td><input class="quantity" style="width: 90%" min="1" max="${product.limit}" type="number" value="0"></td>
                            <td><button onclick="addToOrderList(${product.prodID})" type="button" class="btn addProductToOrder bg-gradient btn-success">إضافة</button></td>
                        </tr>
                        `
                    });
                    // validate quantity input
                    for (let i=0; i<document.querySelectorAll('.quantity').length; i++) {
                        document.querySelectorAll('.quantity')[i].value = 1;
                        document.querySelectorAll('.quantity')[i].oninput = function () {
                            var max = parseInt(this.max);
                            if (parseInt(this.value) > max) {
                                this.value = max; 
                            }
                        }
                    }
                    disableAddedProductsButtons();
                    disbleOrderedProducts();
                }
        }
    } catch (error) {
        console.log(error)
        message.innerHTML = `
                    <h5 class="mt-4">تعذّر الحصول على بيانات , الرجاء المحاولة مجددّاً </h5>
                `
    }
}
let totalPriceAdded = [];
// add to order list 
function addToOrderList (prodid) {
    
    confirmBtnDiv.innerHTML = ` <button class="btn btn-dark px-5" data-bs-toggle="modal" data-bs-target="#myModal">تأكيد</button>`
    // fetch product table values
    let quantity = document.getElementById(prodid).querySelector(".quantity").value;
    let prodName = document.getElementById(prodid).querySelector(".prod-name").textContent;
    let companyName = document.getElementById(prodid).querySelector(".company-name").textContent
    let price = document.getElementById(prodid).querySelector(".price").textContent;
    //disble quantity input box
    document.getElementById(prodid).querySelector(".quantity").disabled = true;

    totalPriceAdded.push({
        id: prodid,
        agPrice: price*quantity
    });

    console.log(totalPriceAdded);

    disableProdBtn(prodid);
    
    PIDs.push(prodid);
    quans.push(quantity);

    sessionStorage.setItem("PIDs", JSON.stringify(PIDs))
    sessionStorage.setItem("quans", JSON.stringify(quans));

    document.querySelector("#list-header").classList.remove("d-none")

    addedProductsContainer.querySelector(".list-group").innerHTML += `
        <li id="prod${prodid}" class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 ms-auto">
                <div class="fw-bold d-flex justify-content-between">${prodName}</div>
                 شركة ${companyName}

            </div>
            <div>
                <span class="badge bg-success rounded-pill d-block mb-1">${quantity}</span>
                <button onclick="deleteProduct(${prodid})" class="btn btn-danger badge rounded-pill d-block">حذف</button>
            </div>
        </li>
    `
}

// handle confirmation 
async function confirmAddtoOrder() {
    const PIDsArray = sessionStorage.getItem('PIDs');
    const quansArray = sessionStorage.getItem('quans');

    let wholePrice = 0;
    let totalOrderedPrice = 0;
    let totalAddedProducts = Number(document.querySelector('#total-order-price').textContent);

    for (let i=0; i<totalPriceAdded.length; i++) {
        totalAddedProducts = totalAddedProducts + totalPriceAdded[i].agPrice
    }

    wholePrice = totalOrderedPrice + totalAddedProducts;
    console.log(wholePrice)
    
    const fetchOptions = {
        method: 'POST',
        headers : {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            level: 'insertM',
            ids: [], 
            quans: JSON.parse(quansArray),
            PIDs: JSON.parse(PIDsArray),
            orderID: orid,
            totalPrice: wholePrice
        })
    }
    console.log(fetchOptions.body)
    try {
        const response = await fetch(`${endpoint}/initOrderDetails`, fetchOptions);
        const data = await response.json();
        console.log(data);
        if (data) {
            insertDetails(orid);
            clearProducts();
            getPhDetails();
            document.querySelector(".offcanvas-header").querySelector("button").click();

        }
    } catch (error) {
        console.log(error);
    }
    
}


async function confirmEdition() {
    confirmEditBtn.disabled = true;
    let editedProducts = [];

    let ids = [];
    let quans = [];
    let totalPrice = 0;

    editedProducts.length = 0;

    document.querySelectorAll('.prod-tr').forEach(e => {
        editedProducts.push({
            edQ: e.querySelector('.quantityTD').querySelector('input').value,
            pID : e.id.replace('card', ''),
            orDetID : e.querySelector('.ordDetID').textContent
        });
        totalPrice = totalPrice + e.querySelector('.quantityTD').querySelector('input').value * e.querySelector('.sPrice').textContent
    });
   
    console.log(totalPrice)
    editedProducts.map ((pro , ind) => {
        if (originalOrderDetails[ind].quant !== pro.edQ) {
            ids.push(pro.orDetID)
            quans.push(pro.edQ)
        }
    });

    sessionStorage.setItem("ids", JSON.stringify(ids));
    sessionStorage.setItem("quans", JSON.stringify(quans));

    try {
        const fetchOptions = {
            method : 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                'level': 'UpdateM', 
                'orderID': orid, 
                'ids': JSON.parse(sessionStorage.getItem("ids")), 
                'quans': JSON.parse(sessionStorage.getItem("quans")), 
                'PIDs': [], 
                'totalPrice': totalPrice
            })
        }
        console.log(fetchOptions.body)
        const response = await fetch(`http://durgs.robotic-mind.com/WebService.asmx/initOrderDetails`, fetchOptions);
        const data = await response.json();
        if (data) {
            editOrderBtn.disabled = false;
            insertDetails(orid);
            getPhDetails();
            confirmEditBtn.disabled = false;
            confirmEditBtn.classList.add("d-none")
            document.querySelector("#cancel-edit-btn").classList.add("d-none")
        } 
        console.log(data)
    } catch (error) {
        console.log(error)
        confirmEditBtn.disabled = false;
    }
}


let originalOrderDetails = [];

function editOrder() {
    originalOrderDetails.length = 0;
    editOrderBtn.disabled = true;
    // capture original order details and push them to an array
    document.querySelectorAll('.prod-tr').forEach(el => {
        originalOrderDetails.push(
            {proid: el.id, quant: el.querySelector('.quantityTD').textContent}
        );
    });
    console.log(originalOrderDetails);
    // replace quantity <td> content with an input filed
    document.querySelectorAll(".quantityTD").forEach(q => {
        q.innerHTML = `
        <input style="width: 90%" class="quantity-input" min="1" max="${q.parentElement.querySelector(".limit").textContent}" type="number" value="${q.textContent}">
        `
    });
    // show deletion buttons
    document.querySelectorAll(".delete-from-order").forEach(btn => {
        btn.classList.remove('d-none');
    });
    // validate quantity input
    for (let i=0; i<document.querySelectorAll('.quantity-input').length; i++) {
        document.querySelectorAll('.quantity-input')[i].oninput = function () {
            var max = parseInt(this.max);
            if (parseInt(this.value) > max) {
                this.value = max; 
            }
        }
    }
    confirmEditBtn.classList.remove("d-none");
    document.querySelector("#cancel-edit-btn").classList.remove("d-none");
}

function cancelEdit() {
    editOrderBtn.disabled = false;

    document.querySelectorAll(".delete-from-order").forEach(btn => {
        btn.classList.add('d-none')
        btn.disabled = false;
    });

    document.querySelectorAll(".quantityTD").forEach((q,i) => {
        q.textContent = originalOrderDetails[i].quant;
    });

    confirmEditBtn.classList.add("d-none");
    document.querySelector("#cancel-edit-btn").classList.add("d-none");

    document.querySelectorAll(".cancel-delete-from-order").forEach(cancelbtn => {
        cancelbtn.classList.add('d-none');
        cancelbtn.disabled = false;
    })
  
    originalOrderDetails.length = 0;
    console.log(originalOrderDetails);

}

function deleteFromOdrder(proid) {
    document.querySelector("#card" + proid).querySelector(".delete-from-order").disabled = true;
    document.querySelector("#card" + proid).querySelector(".quantityTD").querySelector('input').value = 0;
    document.querySelector("#card" + proid).querySelector(".quantityTD").querySelector('input').disabled = true;
    document.querySelector("#card" + proid).querySelector(".cancel-delete-from-order").classList.remove("d-none");
}
function cancelDeletion(proid) {
    document.querySelector("#card" + proid).querySelector(".delete-from-order").disabled = false;
    const prodInfo = originalOrderDetails.find(item => item.proid.replace('card', '') == proid);
    document.querySelector("#card" + proid).querySelector(".quantityTD").querySelector('input').disabled = false;
    document.querySelector("#card" + proid).querySelector(".quantityTD").querySelector('input').value = prodInfo.quant;
    document.querySelector("#card" + proid).querySelector(".cancel-delete-from-order").classList.add("d-none");
} 

// ------------- REUSABLE Functions ------------- //
function disableProdBtn(prodid) {
    document.getElementById(prodid).querySelector(".addProductToOrder").disabled = true;

}
function activeButton(prodid) {
    if (document.getElementById(prodid)) {
        document.getElementById(prodid).querySelector(".addProductToOrder").disabled = false;
    }
}

function EnableAllButtons() {
    document.querySelectorAll(".addProductToOrder").forEach(e => {
        e.disabled = false;
    });
    document.querySelectorAll('.quantity').forEach(q => {
        q.disabled = false;
    });
}
function clearProducts() {
    PIDs.length = 0;
    quans.length = 0;
    totalPriceAdded.length = 0;
    
    sessionStorage.removeItem("PIDs")
    sessionStorage.removeItem("quans")

    addedProductsContainer.querySelector(".list-group").innerHTML = "";
    confirmBtnDiv.innerHTML = "";
    EnableAllButtons();
    disbleOrderedProducts()
   
}

function deleteProduct(proid) {
    document.querySelector('#table-body').querySelectorAll('tr').forEach(tr => {
        if (tr.id == proid) document.getElementById(proid).querySelector('.quantity').disabled = false;
    }); 

    totalPriceAdded.splice(totalPriceAdded.findIndex (p => p.id == proid), 1);
    // find PROID index in PIDs array to remove it
    const idIndex = PIDs.findIndex(pid => pid == proid)
    // remove proid & it's quantity from their arrays 
    PIDs.splice(idIndex,1)
    quans.splice(idIndex,1)
    // update session storage
    sessionStorage.setItem("PIDs", JSON.stringify(PIDs))
    sessionStorage.setItem("quans", JSON.stringify(quans))
    // remove product from added products list
    document.getElementById("prod" + proid).remove();
    // reactive product add button
    if (document.querySelector('#table-body').querySelectorAll('tr').length !== 0) activeButton(proid)
    const lists = document.querySelector('.list-group').querySelectorAll('li')
    if (lists.length  == 0) confirmBtnDiv.innerHTML = "";
}

function disableAddedProductsButtons() {
    tableBody.querySelectorAll(".prod-tr-oc").forEach(tr => {
        addedProductsContainer.querySelectorAll("li").forEach(li => {
            if (li.id.replace("prod", "") == tr.id) disableProdBtn(tr.id)
        })
    })
}
function disbleOrderedProducts() {
    tableBody.querySelectorAll(".prod-tr-oc").forEach(tr => {
        document.querySelectorAll(".prod-tr").forEach(card => {
            if (card.id.replace("card", "") == tr.id) disableProdBtn(tr.id)
        })
    });
    tableBody.querySelectorAll(".prod-tr-oc").forEach(tr => {
        document.querySelectorAll(".prod-tr").forEach(card => {
            if (card.id.replace("card", "") == tr.id) {
                document.getElementById(tr.id).querySelector('.quantity').disabled = true;
            }
        })
    });
}

function toggleSpinner() {
    prodSpinner.classList.toggle("d-none");
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