class Navbar extends HTMLElement {
    constructor() {
        super()
        this.innerHTML = `
        <nav style="background-color: #55B073" class="navbar navbar-expand-lg bg-gradient navbar-light fw-bold">
          <div class="container">
            <a class="navbar-brand text-white" href="/">phStore</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                  <a class="nav-link text-white" aria-current="page" href="/">الرئيسية</a>
                </li>
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle text-white" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    الشركات
                  </a>
                  <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li><a class="dropdown-item" href="/companies.html">إضافة أو تعديل</a></li>
                    <li><a class="dropdown-item" href="/view.html">استعراض </a></li>
                  </ul>
                </li>
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle text-white" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    الأصناف
                  </a>
                  <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li><a class="dropdown-item" href="/products.html">إضافة أو تعديل</a></li>
                    <li><a class="dropdown-item" href="/view.html">استعراض</a></li>
                  </ul>
                </li>
                <li class="nav-item sign-link">
                  <a class="nav-link text-white" href="/login.html"> تسجيل الدخول</a>
                </li>
              <li class="nav-item d-none" id="logout-link">
                <button class="btn btn-outline-light fw-bold" data-bs-toggle="modal" data-bs-target="#logoutModal">تسجيل خروج</button>
              </li>
              </ul>
             
            </div>
          </div>
        </nav>
        `
    }
}


window.customElements.define('nav-bar', Navbar);