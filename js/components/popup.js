class Popup extends HTMLElement {
    constructor () {
        super()
        this.innerHTML = `
        <!--Logout Modal -->
        <div class="modal fade" id="logoutModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" dir="rtl">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">تأكيد تسجيل الخروج ؟</h5>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-dark" data-bs-dismiss="modal">إلغاء</button>
                <button style="background-color: #55B073" onclick="logOut()" type="button" class="btn text-white">تسجيل الخروج</button>
              </div>
            </div>
          </div>
        </div>
        `
    }
}

window.customElements.define("log-out", Popup);