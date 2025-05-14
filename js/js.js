// проверяем, авторизован ли пользователь
document.addEventListener("DOMContentLoaded", () => {
    const isAuth = localStorage.getItem("isAuthenticated") === "true";
    if (isAuth) {
        showUserProfile();
    }
});

// обработка открытия модального окна по кнопкам
document.querySelectorAll(".js-open-modal").forEach((button) => {
    button.addEventListener("click", () => {
        const targetId = button.getAttribute("data-target");
        const targetContent = document.getElementById(targetId)?.innerHTML;
        const modal = document.getElementById("modal");
        const modalBody = document.getElementById("modal-body");

        if (modal && modalBody && targetContent) {
            modalBody.innerHTML = targetContent;
            modal.style.display = "block";
        }
    });
});

// закрытие модального окна при клике вне его
window.addEventListener("click", function (event) {
    document.querySelectorAll(".modal").forEach((modal) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

// закрытие модального окна по кнопке внутри него
const modal = document.getElementById("modal");
const closeBtn = modal?.querySelector(".close");
if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });
}


// форма авторизации
const authForm = document.getElementById("authForm");
const authModal = document.getElementById("authModal");
const errorBlock = document.getElementById("formError");

if (authForm && errorBlock && authModal) {
    const requiredFields = ["username", "phone", "address"];
    const phonePattern = /^\+7\s?\(?9\d{2}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/;
    const numberHouse = /(дом|д|д\.)\s*\d+/i;
    const numberApartment = /(квартира|кв|кв\.)\s*\d+/i;

    authForm.addEventListener("submit", function (e) {
        e.preventDefault(); // отменяем стандартную отправку формы

        const values = {
            username: authForm.username?.value.trim(),
            phone: authForm.phone?.value.trim(),
            address: authForm.address?.value.trim(),
        };

        errorBlock.style.display = "none";
        errorBlock.textContent = "";

        for (const field of requiredFields) {
            if (!values[field]) {
                errorBlock.textContent = "Пожалуйста, заполните все обязательные поля.";
                errorBlock.style.display = "block";
                return;
            }
        }

        if (!phonePattern.test(values.phone)) {
            errorBlock.textContent = "Введите корректный номер телефона в формате +7 (9XX) XXX-XX-XX.";
            errorBlock.style.display = "block";
            return;
        }

        if (!numberHouse.test(values.address) || !numberApartment.test(values.address)) {
            errorBlock.textContent = "Адрес должен содержать номер дома и номер квартиры.";
            errorBlock.style.display = "block";
            return;
        }

        // сохраняем данные в localStorage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("username", values.username);
        localStorage.setItem("phone", values.phone);
        localStorage.setItem("address", values.address);
        localStorage.setItem("email", authForm.email?.value.trim() || "");
        localStorage.setItem("birthdate", authForm.birthdate?.value || "");

        authModal.style.display = "block"; // показываем модалку
        showUserProfile(); // переключаемся на профиль
    });

    authForm.querySelectorAll("input").forEach((input) => {
        input.addEventListener("input", () => {
            errorBlock.style.display = "none";
            errorBlock.textContent = "";
        });
    });
}

const userProfile = document.getElementById("userProfile");

// форма "мой профиль"
function showUserProfile() {
    const name = localStorage.getItem("username");
    const phone = localStorage.getItem("phone");
    const address = localStorage.getItem("address");
    const email = localStorage.getItem("email");
    const birthdate = localStorage.getItem("birthdate");

    document.getElementById("profileName").textContent = name || "-";
    document.getElementById("profilePhone").textContent = phone || "-";
    document.getElementById("profileAddress").textContent = address || "-";
    document.getElementById("profileEmail").textContent = email || "-";
    document.getElementById("profileBirthdate").textContent = birthdate || "-";

    document.getElementById("authForm").style.display = "none";
    userProfile.style.display = "flex";
}

// кнопка вверх
const toTopBtn = document.getElementById("toTopBtn");
if (toTopBtn) {
    window.addEventListener("scroll", () => {
        const isVisible = document.documentElement.scrollTop > 300;
        toTopBtn.style.display = isVisible ? "block" : "none";
    });

    toTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// корзина
const cartItemsContainer = document.getElementById("cartItems");
const totalAmountElem = document.getElementById("totalAmount");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartButton() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartBtn = document.getElementById("cart-float-btn");
    const countElem = document.getElementById("cart-count");

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cartBtn && countElem) {
        if (totalItems > 0) {
            cartBtn.style.display = "block";
            countElem.textContent = totalItems;
        } else {
            cartBtn.style.display = "none";
        }
    }
}

function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (!cartItemsContainer || !totalAmountElem) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    // eсли корзина пустая, выводим сообщение и скрываем ненужные кнопки
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Корзина пуста</p>";
        totalAmountElem.textContent = "";
        clearCartBtn?.style.setProperty("display", "none");
        checkoutBtn?.style.setProperty("display", "none");
        document.getElementById("checkMenu")?.style.setProperty("display", "none");
        updateCartButton();
        return;
    }

    cart.forEach((item, index) => {
        const itemElem = document.createElement("div");
        itemElem.classList.add("cart-item");
        itemElem.innerHTML = `
            <p><strong>${item.name}</strong></p>
            <p>Цена: ${item.price} ₽</p>
            <div class="quantity-controls">
                <button class="decrease" data-index="${index}">–</button>
                <span>${item.quantity}</span>
                <button class="increase" data-index="${index}">+</button>
            </div>
            <p>Сумма: ${item.quantity * item.price} ₽</p>
            <hr>
        `;
        cartItemsContainer.appendChild(itemElem);
        total += item.quantity * item.price;
    });

    totalAmountElem.textContent = `Итоговая сумма: ${total} ₽`;
    // показываем кнопки в корзине
    clearCartBtn?.style.setProperty("display", "inline-block");
    checkoutBtn?.style.setProperty("display", "inline-block");
    document.getElementById("checkMenu")?.style.setProperty("display", "inline-block");

    // назначаем кнопки увеличения количества товара
    document.querySelectorAll(".increase").forEach((btn) => {
        btn.addEventListener("click", () => {
            const i = btn.dataset.index;
            cart[i].quantity++;
            saveCart(cart);
            renderCart();
        });
    });

    // назначаем кнопки уменьшения количества товара
    document.querySelectorAll(".decrease").forEach((btn) => {
        btn.addEventListener("click", () => {
            const i = btn.dataset.index;
            cart[i].quantity--;
            if (cart[i].quantity <= 0) cart.splice(i, 1);
            saveCart(cart);
            renderCart();
        });
    });

    updateCartButton();
}

// очистка корзины
if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
        localStorage.removeItem("cart");
        renderCart();
    
        const errorBlock = document.getElementById("formError");
        if (errorBlock){
            errorBlock.style.display = "none";
            errorBlock.innerHTML = "";
        }
    });
}

// оформление заказа
if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
        const isAuth = localStorage.getItem("isAuthenticated") === "true";
        const errorBlock = document.getElementById("formError");

        if (!isAuth) {
            if (errorBlock) {
                errorBlock.innerHTML = 'Перед оформлением заказа зарегистрируйтесь <a href="../html/account.html" style="color: rgb(221, 34, 34); text-decoration: underline;">в личном кабинете</a>.';
                errorBlock.style.display = "block";
            }
            return;
        }
        showOrderSuccessModal();
        localStorage.removeItem("cart");
        renderCart();
    });
}
renderCart();
updateCartButton();

// показ модального окна при добавлении товара
function showCustomModal(message) {
    document.querySelector(".custom-cart-modal")?.remove();

    const modal = document.createElement("div");
    modal.className = "custom-cart-modal";
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-box">
            <p>${message}</p>
            <button class="modal-close">OK</button>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".modal-close").addEventListener("click", () => modal.remove());
    modal.querySelector(".modal-overlay").addEventListener("click", () => modal.remove());
}

// добавление товара в корзину
function addToCart(name, price, img) {
    if (!name || name === "null" || !price || price === 0 || isNaN(price)) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const index = cart.findIndex((p) => p.name === name);

    if (index !== -1) {
        cart[index].quantity += 1;
    } else {
        cart.push({ name, price, img, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    showCustomModal(`Товар <strong>«${name}»</strong> добавлен в корзину`);
    updateCartButton();
}

// обработчики кнопок "заказать"
document.querySelectorAll(".order").forEach((button) => {
    button.addEventListener("click", () => {
        const name = button.getAttribute("data-name");
        const price = parseInt(button.getAttribute("data-price")) || 0;
        const img = button.getAttribute("data-img") || "";
        addToCart(name, price, img);
    });
});

// добавление из модального окна
document.querySelectorAll(".modal-item").forEach((item) => {
    const button = item.querySelector(".modal-order-go-menu");
    if (!button) return;

    button.addEventListener("click", () => {
        const name = item.querySelector("strong")?.textContent.trim() || "Без названия";
        const priceText = item.querySelector(".price-modal-item")?.textContent.trim() || "";
        const price = parseInt(priceText.replace(/\D/g, "")) || 0;
        const img = item.querySelector("img")?.getAttribute("src") || "";
        addToCart(name, price, img);
    });
});

// переход в корзину по кнопке
function goToCart() {
    window.location.href = "../html/korzina.html";
}

// Переход в меню
const checkMenuBtn = document.getElementById("checkMenu");
if (checkMenuBtn) {
    checkMenuBtn.addEventListener("click", () => {
        window.location.href = "../html/menu.html";
    });
}

// модалка "Спасибо за заказ! ..."
function showOrderSuccessModal() {
    const existing = document.querySelector(".success-modal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.className = "modal success-modal";
    modal.style.display = "block";
    modal.innerHTML = `
        <div class="modal-content modal-block-container">
            <span class="close">&times;</span>
            <div class="modal-sop">Спасибо за заказ!</div>
            <div class="modal-sop-tovar">Мы с вами скоро свяжемся.</div>
            <div style="text-align: center; margin-top: 15px;">
                <a href="../html/menu.html" class="modal-a">Вернуться в меню</a>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".close").addEventListener("click", () => {
        modal.style.display = "none";
        modal.remove();
    });

    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
            modal.remove();
        }
    });
}

// кнопка выхода (выход из аккаунта)
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        // очищаем данные
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("username");
        localStorage.removeItem("phone");
        localStorage.removeItem("address");
        localStorage.removeItem("email");
        localStorage.removeItem("birthdate");

        // показываем форму, скрываем профиль
        const authForm = document.getElementById("authForm");
        const userProfile = document.getElementById("userProfile");
        if (authForm && userProfile) {
            userProfile.style.display = "none";
            authForm.style.display = "flex";
            authForm.reset();

            // скрываем блок ошибок, если он остался
            const errorBlock = document.getElementById("formError");
            if (errorBlock) {
                errorBlock.style.display = "none";
                errorBlock.textContent = "";
            }
        }
    });
}

// поиск на странице меню
document.getElementById("menuSearch").addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();
    const cards = document.querySelectorAll(".container-product-card, .container-product-card-menu");

    cards.forEach(card => {
        const titleElement = card.querySelector(".container-text-name");
        const structureElement = card.querySelector(".text-structure");

        const title = titleElement ? titleElement.textContent.toLowerCase() : "";
        const structure = structureElement ? structureElement.textContent.toLowerCase() : "";

        if (title.includes(query) || structure.includes(query)) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
});