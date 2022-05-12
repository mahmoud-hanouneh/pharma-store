const filterCompany = document.querySelector("#filter-company");
const prodSpinner = document.querySelector("#prod-spinner");
const confirmBtnDiv = document.querySelector("#confirmBtn");
const addedProductsContainer = document.querySelector("#added-products");
const addOrderTable =  document.querySelector("#addOrder-table");
const alertBox = document.querySelector("#alert");
const listHeader = document.querySelector("#list-header");
const totalPriceBox = document.querySelector("#total-price-box");

let totalPriceAdded = [];
let PIDs = [];
let quans = [];

let executed = false;
let compExecuted = false;
//companies select options
const getCompNames =  async () => {
    try {
        const response = await fetch (`${apiEndpoint}/Companies?level=selectByStore&Coid=&sid=${SID}`);
        const data = await response.json();
        if (data) {
            compExecuted = true;
            data.map(company => {
                filterCompany.innerHTML += `
                    <option value="${company.CoID}"> ${company.CoName}</option>
                    `
            });
        }    
    } catch (err) {
        console.log(err);
    }
   
};
const getPhList = async () => {
    try {
        const response = await fetch(`${apiEndpoint}Pharmacy?level=select&PID=`);
        const data = await response.json();
        if (data) {
            executed = true;
            data.map (ph => {
                document.querySelector('#pharmList').innerHTML += `
                    <option value="${ph.PID}">${ph.PName}</option>
                `
            });
        }
    } catch (error) {
        console.log(error);
    }
}
document.querySelector('#addOrderBtn').addEventListener('click', () => {
    if (!executed) getPhList();
    if (!compExecuted) getCompNames();
    recieveDate = document.querySelector("#recieve-date").value = new Date().toJSON().slice(0, 10);
    
});

async function getRelatedProducts() {
    const coid = filterCompany.value;
    if(coid == 0) return;
    hideAlert();
    toggleSpinner('show');
    try {
        const response = await fetch(`${apiEndpoint}/ProFilter?level=selectSpecific&prodid=&sid=${SID}&coid=${coid}&type=&state=&not=unavailable&pricest=`)
        const data = await response.json();
        console.log(data);
        if (data) {
            toggleSpinner('hide');
            if (data.length == 0) {
                sendAlert('لا يوجد عناصر مضافة تابعة لهذه الشركة')
            } else {
                document.querySelector("#alert").innerText = "";
                addOrderTable.classList.remove("d-none");
                addOrderTable.querySelector("#addOrder-table-body").innerHTML = "";
                data.map((product, index) => {
                    addOrderTable.querySelector("#addOrder-table-body").innerHTML += `
                        <tr class="prod-tr-oc" id="product${product.prodID}">
                            <td class="prod-name">${product.prodName}</td>
                            <td class="price">${product.phPrice}</td>
                            <td class="d-none company-name">${product.companyName}</td>
                            <td><input class="quantity" style="width: 90%" min="1" max="${product.limit}" type="number" value="0"></td>
                            <td><button onclick="addToOrderList(${product.prodID})" type="button" class="btn addProductToOrder bg-gradient btn-dark">إضافة</button></td>
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
                }
        }
    } catch (error) {
        console.log(error);
        sendAlert("تعذّر تحديث البيانات , حاول مجدداً");
    }
}
function sendAlert(message) {
    addOrderTable.classList.add("d-none");
    alertBox.classList.remove("d-none");
    alertBox.innerText = "";
    alertBox.innerText = message;
}


// add to order list 
function addToOrderList (prodid) {
    
    confirmBtnDiv.innerHTML = `<button class="btn btn-dark px-5" data-bs-toggle="modal" data-bs-target="#myModal">تأكيد</button>`
    // fetch product table values
    let quantity = document.querySelector("#product" + prodid).querySelector(".quantity").value;
    let prodName = document.querySelector("#product" + prodid).querySelector(".prod-name").textContent;
    let companyName = document.querySelector("#product" + prodid).querySelector(".company-name").textContent
    let price = document.querySelector("#product" + prodid).querySelector(".price").textContent;

    disableProdInputs(prodid);
    toggleListHeader('show');
    toggleTotPriceBox('show')
    // store total product price & it's id in an array of objects
    totalPriceAdded.push({
        id: prodid,
        agPrice: price*quantity
    });
    console.log(totalPriceAdded);

    PIDs.push(prodid);
    quans.push(quantity);

    addedProductsContainer.querySelector(".list-group").innerHTML += `
        <li id="prod${prodid}" class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 ms-auto">
                <div class="fw-bold d-flex justify-content-between">${prodName}</div>
                 شركة ${companyName}

            </div>
            <div>
                <span class="badge bg-dark rounded-pill d-block mb-1">${quantity}</span>
                <button onclick="deleteProduct(${prodid})" class="btn btn-danger badge rounded-pill d-block">حذف</button>
            </div>
        </li>
    `
   
    setTotalPrice(); 
 }
 function deleteProduct(proid) {
    document.querySelector('#addOrder-table-body').querySelectorAll('tr').forEach(tr => {
        if (tr.id.replace("product", "") == proid) document.querySelector("#product" + proid).querySelector('.quantity').disabled = false;
    }); 
    totalPriceAdded.splice(totalPriceAdded.findIndex(p => p.id == proid), 1);
    // find PROID index in PIDs array to remove it
    const idIndex = PIDs.findIndex(pid => pid == proid)
    // remove proid & it's quantity from their arrays 
    PIDs.splice(idIndex,1)
    quans.splice(idIndex,1)
    // remove product from added products list
    document.querySelector("#prod" + proid).remove();
    // reactive product add button
    if (document.querySelector('#table-body').querySelectorAll('tr').length !== 0) activeButton(proid)
    const lists = document.querySelector('.list-group').querySelectorAll('li')
    if (lists.length  == 0) confirmBtnDiv.innerHTML = "";
    setTotalPrice();

}
function activeButton(prodid) {
    if (document.querySelector("#product" + prodid)) {
        document.querySelector("#product" + prodid).querySelector(".addProductToOrder").disabled = false;
    }
}
function disableProdInputs(prodid) {
    //disble quantity input box
    document.querySelector("#product" + prodid).querySelector(".quantity").disabled = true;
    //disable product button
    document.querySelector("#product"+ prodid).querySelector(".addProductToOrder").disabled = true;

}
function enableAllButtons() {
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

    addedProductsContainer.querySelector(".list-group").innerHTML = "";
    confirmBtnDiv.innerHTML = "";
    enableAllButtons();
    setTotalPrice();
}
function disableAddedProductsButtons() {
    document.querySelector("#addOrder-table-body").querySelectorAll(".prod-tr-oc").forEach(tr => {
        addedProductsContainer.querySelectorAll("li").forEach(li => {
            if (li.id.replace("prod", "") == tr.id.replace("product", "")) disableProdInputs(li.id.replace("prod", ""))
        })
    })
}
async function confirmAddtoOrder() {
    const recieveDate = document.querySelector("#recieve-date").value;
    const phID = document.querySelector('#pharmList').value;

    if (recieveDate != '') {
        let wholePrice = 0;
        for (let i=0; i < totalPriceAdded.length; i++) {
            wholePrice = wholePrice + totalPriceAdded[i].agPrice;
        }
        const fetchOptions = {
            method: 'POST',
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                address: '',
                phone: '',
                note: '',
                totalPrice: wholePrice,
                delPrice: '0',
                delComp: '',
                date: recieveDate,
                pharmID: phID,
                storeID: SID,
                type: 'normal',
                Pid: PIDs,
                Quan: quans
            })
        }
        console.log(fetchOptions.body);
        try {
            const response = await fetch(`http://durgs.robotic-mind.com/WebService.asmx/Payment`, fetchOptions);
            const data = await response.json();
            if (data) {
                clearProducts();
                document.querySelector(".offcanvas-header").querySelector("button").click();
                getOrders('active');
            }
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    } else {
        document.querySelector("#recieve-date").parentElement.querySelector("small").innerText = "الرجاء إدخال تاريخ التسليم"
        document.querySelector("#recieve-date").scrollIntoView({
            behavior: "smooth"
        });
    }
        
}

// ------------- REUSABLE Functions ------------- //
function hideAlert() {
    document.querySelector("#alert").classList.add('d-none');
}
function toggleSpinner(state) {
    state == "show" && prodSpinner.classList.remove("d-none");
    state == "hide" && prodSpinner.classList.add("d-none");
    
}
function toggleListHeader(state) {
    state == "show" && listHeader.classList.remove("d-none")    
}
function toggleTotPriceBox(state) {
    state == "show" && totalPriceBox.classList.remove("d-none")
}
function setTotalPrice() {
    let wholePrice = 0;
    for (let i=0; i < totalPriceAdded.length; i++) {
        wholePrice = wholePrice + totalPriceAdded[i].agPrice;
    }
    totalPriceBox.querySelector("span").innerText = wholePrice
}