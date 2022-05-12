const apiEndpoint = '';
const baseURL = ``;
const SID = getWithExpiry("SID");
const mainRow = document.querySelector("#main-row");
const filter =  document.querySelector("#filter");
const backBtn = document.querySelector("#btn-back");
const header = document.querySelector("#header");
const title = document.querySelector("title");
const spinner = document.querySelector("#spinner");
const compName = document.querySelector("#compname");

async function insertCompanies() {
    toggleSpinner(true);
    setHeaderText('company');
    setTitle('companies');
    toggleFilter(false);
    toggleBackBtn(false);
    let api = `${apiEndpoint}/Companies?level=SelectbyStore&CoId=&sid=${SID}`
    try {   
        const response = await fetch(api);
        const data = await response.json();
        if (data) {
            toggleSpinner(false)
            mainRow.innerHTML = "";
            data.map((company,index) => {
                mainRow.innerHTML += `
                <div id="${company.CoID}" class="col-xl-3 col-lg-3 coFl-md-4 col-sm-6">
                    <div class="card mx-auto p-3" style="width: 16rem">
                        <img class="w-100 h-100"src="${baseURL + company.img}" alt="شركة ${company.CoName}">
                        <div class="card-body">
                            <h5 class="card-title fw-bold fs-4">${company.CoName}</h5>
                            <button style="background-color: #55B073" onclick="insertProducts(${company.CoID})" class="btn text-white mt-4 w-100">عرض المنتجات</button>
                        </div>
                    </div>
                </div>
                `
            })
           
        }
    } catch (error) {
        console.log(error);
    }
}
insertCompanies();

let compID;
let type = "";
async function insertProducts(coID) {
    toggleSpinner(true);
    setHeaderText('product');
    checkParam(coID);
    setTitle('products');
    let api = `${apiEndpoint}/ProFilter?level=selectSpecific&prodid=&sid=${SID}&coid=${compID}&type=${type}&state=&not=unavailable&pricest=`
    try {
        const response = await fetch(api);
        const data = await response.json();
        console.log(data);
        if (data.length == 0){
            toggleBackBtn(true);
            toggleSpinner(false)

            mainRow.innerHTML = `<h3>لا يوجد أصناف تابعة لهذه الشركة</h3>`
        }
        if (data.length !== 0) {
            toggleSpinner(false)
            toggleBackBtn(true);
            toggleFilter(true);
            mainRow.innerHTML = "";
            data.map((product, index) => {
                mainRow.innerHTML += `
                <div id="${product.CoID}" class="col-xl-3 col-lg-3 col-md-4 col-sm-6">
                    <div class="card mx-auto p-3" style="width: 16rem">
                        <img class="w-100 h-100" src="${baseURL + product.img}" alt="${product.prodName}">
                        <div class="card-body">
                            <h5 class="card-title fw-bold fs-4">${product.prodName}</h5>
                            <p class="ph-price">سعر الصيدلي: ${product.phPrice} ل.س</p>
                            <p class="fw-bold">الصلاحية : ${product.validity.split(" ")[0]}</p>
                            <p class="fw-bold">نوع الصنف : ${product.type == "normal" ? "عادي" : "عرض"}</p>
                        </div>
                    </div>
                </div>
                `
            })
        }
    } catch(error) {
        console.log(error);
        toggleBtnState({id: coID, state: false});
    }
}



// Reusable Functions
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
function toggleBtnState(btn) {
    const {id, state} = btn
    document.getElementById(id).querySelector(".btn").disabled = state
}
function toggleBackBtn(state) {
    state === false && backBtn.classList.add("d-none");
    state === true && backBtn.classList.remove("d-none");
}
function toggleFilter(state) {
    state === true && filter.classList.remove('d-none');
    state === false && filter.classList.add('d-none');
}
function toggleSpinner(state) {
    state === true && spinner.classList.remove("d-none");
    state === false && spinner.classList.add("d-none");
}
function setHeaderText(type) {
   if(type === 'product') header.innerText = "المنتجات المُضافة";
   if(type === 'company') header.innerText = "الشركات المُضافة";
}
function setTitle(text) {
    if(text === "products") title.innerText = "المنتجات";
    if(text === "companies") title.innerText = "الشركات";
}
function checkParam(coID) {
    switch (coID) {
        case "all":
            type = "";
            break;
        case "normal":
            type = "normal";
            break;
        case "offer":
            type = "offer";
            break;
        default:
            compID = coID;
            toggleBtnState({id: coID, state: true})
        }
}