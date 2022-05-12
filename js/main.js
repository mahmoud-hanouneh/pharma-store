
const row = document.querySelector("#row");
const pharmaciesList = document.querySelector("#phList");
const ordersContainer = document.querySelector("#orders-container");

// API Endpoint
const apiEndpoint = '';
const SID = getWithExpiry("SID");

const update =  function update() {
    let active = fetch (`${apiEndpoint}Order?level=selectState&OID=&phID=&sid=${SID}&state=active&date1=&date2=`)
        .then(resp => resp.json());
    let checked = fetch(`${apiEndpoint}Order?level=selectState&OID=&phID=&sid=${SID}&state=checked&date1=&date2=`)
        .then(resp => resp.json());
    let progress = fetch (`${apiEndpoint}/Order?level=selectState&OID=&phID=&sid=${SID}&state=progress&date1=&date2=`)
        .then(resp => resp.json());
    let end = fetch (`${apiEndpoint}Order?level=selectState&OID=&phID=&sid=${SID}&state=end&date1=&date2=`)
        .then(resp => resp.json());    
    let canceled = fetch(`${apiEndpoint}Order?level=selectState&OID=&phID=&sid=${SID}&state=canceled&date1=&date2=`)
        .then(resp => resp.json());
   
    const retData = async function() {
        try {
            let response = await Promise.all([active, checked, progress, end, canceled]);
            if (response) {
                const arr =  response.map(item => item.length);
                setOrdersBadge(arr)
            } 
        } catch (error) {
            console.log(error);
        }
      
    }();
}
update();

async function getOrders(state) {
    checkState(state);
    
    document.querySelectorAll(".tab-link").forEach(tab => {
        tab.id === state ? tab.classList.add("active") : tab.classList.remove("active")
    });
    row.innerHTML = "";
    ordersContainer.innerHTML = `
    <div class="text-center">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
    `;
    try {
        const response = await fetch(`${apiEndpoint}Order?level=selectState&OID=&phID=&sid=${SID}&state=${state}&date1=&date2=`);
        const data = await response.json();
        console.log(data);
        if (data.length != 0) {
        ordersContainer.innerHTML = "";
            ordersContainer.innerHTML += `
                <div class="table-responsive">
                    <table id="table" class="table table-hover table-bordered table-sm print" dir="ltr">
                    <button onclick="window.print();" style="float: left; font-size: 20px;" class="btn"><i class="bi bi-printer"></i></button>

                    <thead class="table-light">
                        <tr>
                            <th> تسلسل </th>
                            <th>رقم الطلب</th>
                            <th> الصيدلية</th>
                            <th>رقم الهاتف</th>
                            <th>حالة الطلب</th>
                            <th>تاريخ الطلب</th>
                            <th>تاريخ التسليم</th>
                        </tr>
                    </thead>
                    <tbody id="table-body">

                    </tbody>
                    </table>
                </div>
            `
            data.map((item, index) => {
                    document.querySelector("#table-body").innerHTML += `
                        <tr id=${item.OID}>
                            <td class="fw-bold">${++index}</td>
                            <td>${item.OID}</td>
                            <td>${item.pharmName}</td>
                            <td>${item.phone}</td>
                            <td class="fw-bolder ${stateColor}">${stateMessage}</td>
                            <td>${item.dateCreated}</td>
                            <td class="year d-none">${item.year}</td>
                            <td class="month d-none">${item.month}</td>
                            <td class="day d-none">${item.day}</td>
                            <td class="rec-date"> 
                               ${item.date.split(' ')[0]}
                            </td>

                            <td class="${displayEditBox}"> 
                                <button onclick="editRecieveDate(${item.OID})" class="btn edit-date-btn"><i class="bi bi-pencil-square"></i> 
                                </button>
                            </td>
                            <td class="d-none">${item.address}</td>
                            <td class="date d-none">${item.date.split(' ')[0]}</td>
                            <td class="d-none">${item.totalPrice}</td>
                            <td class="d-none">${item.notes}</td>
                            <td id="${item.state}" class="d-none state"></td>
                            <td class="${display}"><button onclick="confirmOrder(${item.OID})" class="btn btn-dark fs-6 px-3 confirmationButton no-print"> تأكيد </button></td>
                            <td><button onclick="getDetails(${item.OID})" class="btn btn-outline-dark details-btn no-print">التفاصيل</button></td>
                            <td><button onclick="finishOrder(${item.OID})" class="finish-btn btn btn-dark ${displayFinish} no-print">إنهاء</button></td>
                            <td><button onclick="cancelOrder(${item.OID})" class="cancel-btn btn btn-danger ${displayCancel} no-print">إلغاء</button></td>
                            <td><button onclick="sendOrder(${item.OID})" class="btn btn-success send-order ${displaySend} no-print">إرسال</button></td>
                        </tr>
                    `
        });
        } else {
            ordersContainer.innerHTML = "";
            ordersContainer.innerHTML += `<h1>لا يوجد طلبيات ${stateMessage}</h1>`
        }
    } catch (error) {
        console.log(error)
        ordersContainer.innerHTML = "";
        ordersContainer.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center" role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
            <div>
            تعذّر تحديث البيانات
            </div>
            <button onclick="getOrders('${state}')" class="btn btn-outline-dark me-5">حاول مجدداً <i class="bi bi-arrow-clockwise"></i> </button>
        </div>
        `
    }
    
}
getOrders('active');

async function confirmOrder(oid) {
    disableBtn(oid, true);

    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept' : 'application/json'
        }, 
        body: JSON.stringify({
            level : 'UpdateState',
            OID : oid,
            paid : 0,
            date : '',
            state : 'checked'
        })
    }
    try {
        const response = await fetch(`${apiEndpoint}initOrder`, fetchOptions);
        const data = await response.json();
        if (data) {
            changeBtnText(oid);
            setTimeout(() => {document.getElementById(oid).remove()} , 2000)
            update();
        }
        console.log(data);
    } catch (error) {
        console.log(error);
        disableBtn(oid, false);;
    }
}

async function sendOrder(orid) {
    disableBtnn(orid, true, 'send-order');

    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept' : 'application/json'
        }, 
        body: JSON.stringify({
            level : 'UpdateState',
            OID : orid,
            paid : 0,
            date : '',
            state : 'progress'
        })
    }
    try {
        const response = await fetch(`${apiEndpoint}initOrder`, fetchOptions);
        const data = await response.json();
        if (data) {
            setTimeout(() => {document.getElementById(orid).remove()} , 1000)
            update();
        }
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}
async function cancelOrder(orid) {
    document.getElementById(orid).querySelector(".cancel-btn").disabled = true;
    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept' : 'application/json'
        }, 
        body: JSON.stringify({
            level : 'UpdateState',
            OID : orid,
            paid : 0,
            date : '',
            state : 'canceled'
        })
    }
    try {
        const response = await fetch(`${apiEndpoint}initOrder`, fetchOptions);
        const data = await response.json();
        if (data) {
            setTimeout(() => {document.getElementById(orid).remove()} , 1000)
            update();
            
        }
    } catch (error) {
        console.log(error);
        document.getElementById(orid).querySelector(".cancel-btn").disabled = false;

    }
}

async function finishOrder(orid) {
    document.getElementById(orid).querySelector(".finish-btn").disabled = true;
    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept' : 'application/json'
        }, 
        body: JSON.stringify({
            level : 'UpdateState',
            OID : orid,
            paid : 0,
            date : '',
            state : 'end'
        })
    }
    try {
        const response = await fetch(`${apiEndpoint}initOrder`, fetchOptions);
        const data = await response.json();
        if (data) {
            setTimeout(() => {document.getElementById(orid).remove()} , 1000)
            update();
        }
    } catch (error) {
        console.log(error);
        document.getElementById(orid).querySelector(".finish-btn").disabled = false;

    }
}

async function getDetails(oid) {
    function OrderDetails() {
        this.state = state,
        this.orderID = oid
    }
    toggleDetailsBtnState(oid, true)
    console.log(oid);
    const state = document.getElementById(oid).querySelector('.state').id;
    try {
        const response = await fetch(`${apiEndpoint}OrderDetails?level=SelectbyOrd&orID=&OID=${oid}`);
        const data = await response.json();
        if (data) {
            const ordDetails = new OrderDetails(state, oid)
            sessionStorage.setItem("orderDetails", JSON.stringify(ordDetails))
            data && window.location.replace("/details.html");
        }
    } catch (error) {
        console.log(error)
        toggleDetailsBtnState(oid, false)
    }
    
}


// ------------- REUSABLE Functions ------------- //
function checkState (state) {
    switch (state) {
        case "active":
            stateMessage = "ورادة"
            stateColor = "table-primary"
            displayFinish = "d-none"
            displaySend = "d-none"
            displayCancel = ""
            display = ""
            displayEditBox = ""
            break;
        case "canceled":
            stateMessage = "مُلغاة"
            stateColor = "table-danger"
            displayFinish = "d-none"
            display = "d-none"
            displayCancel = "d-none"
            displaySend = "d-none"
            displayEditBox = "d-none"
            break;
        case "end":
            stateMessage = "مُنتهية"
            stateColor = "table-success"
            display = "d-none"
            displayFinish = "d-none"
            displayCancel = "d-none"
            displaySend = "d-none"
            displayEditBox = "d-none"
            break;
        case "progress":
            stateMessage = "قيد التنفيذ"
            stateColor = "table-info"
            display = "d-none"
            displayFinish = ""
            displayCancel = ""
            displaySend = "d-none"
            displayEditBox = ""
            break;
        case 'checked':
            stateMessage = 'مؤكدة '
            displayCancel = ""
            displaySend = ""
            display = "d-none";
            displayEditBox = ""
    }
    return stateMessage;
}
// let ed;
let prevDates = [];
function editRecieveDate(ordID) {
    
    document.getElementById(ordID).querySelector('.edit-date-btn').classList.add('d-none');
    prevDate = document.getElementById(ordID).querySelector('.rec-date').textContent.trim();
    prevDates.push({ordID: ordID, prevDate: prevDate});

    let day = document.getElementById(ordID).querySelector('.day').textContent;
    let year = document.getElementById(ordID).querySelector('.year').textContent;
    let month = document.getElementById(ordID).querySelector('.month').textContent;

    if (day.length == 1) day = '0' + day; 
    if (month.length == 1) month = '0' + month; 

    let newDate = year + '-' + month + '-' + day;

    document.getElementById(ordID).querySelector('.rec-date').innerHTML = `<input type='date' class='form-control' value='${newDate}'>`;
    document.getElementById(ordID).querySelector('.rec-date').innerHTML += `
    <div class="d-flex justify-content-center">
        <button onclick="cancelDateEdit(${ordID})" type="button" class="btn btn-danger bg-gradient mt-2 mx-3 btn-sm">إلغاء</button>
        <button onclick="confirmEditRecDate(${ordID})" type="button" class="btn btn-success bg-gradient mt-2 mx-3 btn-sm">تأكيد</button>
    </div>
    `
}
async function confirmEditRecDate(ordID) {
    const newDate = document.getElementById(ordID).querySelector('.rec-date').querySelector('input').value;
    try {
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept' : 'application/json'
            },
            body: JSON.stringify ({
                level: 'UpdateState',  
                OID: ordID,  
                paid: 0,  
                date: newDate,  
                state: 'active'
            })
        }
        const response = await fetch(`${apiEndpoint}initOrder`, fetchOptions);
        const data = await response.json();
        console.log(data);
        if (data.d == 'Successful') {
            document.getElementById(ordID).querySelector('.rec-date').innerHTML = '';
            document.getElementById(ordID).querySelector('.rec-date').textContent = newDate;
            document.getElementById(ordID).querySelector('.edit-date-btn').classList.remove('d-none')
        }

    } catch (error) {
        console.log(error);
    }
}
function cancelDateEdit(ordID) {
    document.getElementById(ordID).querySelector('.rec-date').innerText = prevDates.find(date => date.ordID == ordID).prevDate;
    document.getElementById(ordID).querySelector('.edit-date-btn').classList.remove('d-none');
 }
function setOrdersBadge(arr) {
    document.querySelector(".active-span").innerText = arr[0];
    document.querySelector(".checked-span").innerText = arr[1];
    document.querySelector(".progress-span").innerText = arr[2];
    document.querySelector(".end-span").innerText = arr[3];
    document.querySelector(".canceled-span").innerText = arr[4];
}

function toggleDetailsBtnState(oid, state) {
    document.getElementById(oid).querySelector(".details-btn").disabled = state
}
function disableBtn(oid, state) {
    document.getElementById(oid).querySelector(".confirmationButton").disabled = state;
}
function disableBtnn(orid, state, className) {
    document.getElementById(orid).querySelector("." + className).disabled = state;
} 
function changeBtnText(oid) {
    document.getElementById(oid).querySelector(".confirmationButton").innerText = "";
    document.getElementById(oid).querySelector(".confirmationButton").innerText = "تم التأكيد";
    document.getElementById(oid).querySelector(".confirmationButton").classList.remove("btn-dark")
    document.getElementById(oid).querySelector(".confirmationButton").classList.add("btn-success")
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