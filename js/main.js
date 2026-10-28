/*
  Небольшой скрипт поверх Bootstrap JS Bundle.
  Bootstrap сам открывает меню, модальное окно, вкладки и accordion;
  здесь только логика проекта: проверка форм, товар в модальном окне,
  фильтр каталога и уведомление об отправке.
*/

// Всплывающее уведомление (компонент toast) об успешной отправке формы.
const successToast = document.getElementById('successToast');

const showSuccess = (message) => {
  document.getElementById('successToastText').textContent = message;
  bootstrap.Toast.getOrCreateInstance(successToast).show();
};

// Проверка форм по схеме Bootstrap: класс was-validated показывает invalid-feedback.
document.querySelectorAll('.needs-validation').forEach((form) => {
  form.addEventListener('submit', (event) => {
    // Backend пока нет, поэтому настоящую отправку отменяем.
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      // fieldset тоже бывает :invalid, поэтому ищем именно поле ввода.
      form.querySelector('input:invalid, select:invalid, textarea:invalid').focus();
      return;
    }

    form.reset();

    // Если форма в модальном окне, закрываем его.
    const modal = form.closest('.modal');
    if (modal) {
      bootstrap.Modal.getInstance(modal).hide();
    }

    showSuccess(form.dataset.success);
  });

  // После очистки формы подсветка ошибок не нужна.
  form.addEventListener('reset', () => {
    form.classList.remove('was-validated');
  });
});

// Кнопка «Заказать» передаёт название товара в модальное окно.
const orderModal = document.getElementById('orderModal');

if (orderModal) {
  orderModal.addEventListener('show.bs.modal', (event) => {
    const product = event.relatedTarget?.dataset.product;
    if (product) {
      document.getElementById('quick-product').value = product;
    }
  });
}

// На странице заявки товар можно выбрать заранее: order.html?product=zhernov.
const productSelect = document.getElementById('order-product');

if (productSelect) {
  const product = new URLSearchParams(window.location.search).get('product');
  const option = Array.from(productSelect.options).find((item) => item.value === product);

  if (option && !option.disabled) {
    productSelect.value = product;
  }
}

// Ссылка «32 отзыва» открывает вкладку отзывов на странице товара.
document.querySelectorAll('[data-show-tab]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const tabButton = document.querySelector(link.getAttribute('href'));
    bootstrap.Tab.getOrCreateInstance(tabButton).show();
    tabButton.scrollIntoView({ block: 'center' });
    tabButton.focus();
  });
});

// Фильтр каталога: категория (кнопки-переключатели) и «Только в наличии».
const catalogFilter = document.querySelector('[data-catalog-filter]');

if (catalogFilter) {
  const items = document.querySelectorAll('[data-category]');
  const categoryInputs = Array.from(catalogFilter.elements.category);
  const inStockOnly = document.getElementById('filter-in-stock');
  const counter = document.getElementById('catalog-count');

  const applyFilter = () => {
    const category = catalogFilter.elements.category.value;
    let shown = 0;

    items.forEach((item) => {
      const visible = (category === 'all' || item.dataset.category === category)
        && (!inStockOnly.checked || item.dataset.stock === 'in');

      // d-none — utility-класс Bootstrap, скрывающий элемент.
      item.classList.toggle('d-none', !visible);
      if (visible) {
        shown += 1;
      }
    });

    counter.textContent = shown;
  };

  // Категория берётся из адреса: catalog.html#beans (ссылки из меню и с главной).
  const selectFromHash = () => {
    const hash = window.location.hash.slice(1);
    const input = categoryInputs.find((item) => item.value === hash) || categoryInputs[0];
    input.checked = true;
    applyFilter();
  };

  catalogFilter.addEventListener('change', (event) => {
    if (event.target.name === 'category') {
      const hash = event.target.value === 'all' ? '' : `#${event.target.value}`;
      history.replaceState(null, '', `${window.location.pathname}${hash}`);
    }
    applyFilter();
  });

  window.addEventListener('hashchange', selectFromHash);
  selectFromHash();
}
