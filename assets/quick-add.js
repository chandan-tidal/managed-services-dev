if (!customElements.get('quick-add-modal')) {
  customElements.define(
    'quick-add-modal',
    class QuickAddModal extends ModalDialog {
      constructor() {
        super();
        this.modalContent = this.querySelector('[id^="QuickAddInfo-"]');
        this.elementOrder = this.dataset.elementOrder || 'image:1,price:2,variant:3,atc:4';
        
        // Log the initial element order
        console.log('QuickAddModal initialized with elementOrder:', this.elementOrder);

        this.addEventListener('product-info:loaded', ({ target }) => {
          target.addPreProcessCallback(this.preprocessHTML.bind(this));
        });
      }

      hide(preventFocus = false) {
        const cartNotification = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        if (cartNotification) cartNotification.setActiveElement(this.openedBy);
        this.modalContent.innerHTML = '';

        if (preventFocus) this.openedBy = null;
        super.hide();
      }

      show(opener) {
        console.log('QuickAddModal show() called, opener:', opener);
        opener.setAttribute('aria-disabled', true);
        opener.classList.add('loading');
        opener.querySelector('.loading__spinner').classList.remove('hidden');

        fetch(opener.getAttribute('data-product-url'))
          .then((response) => response.text())
          .then((responseText) => {
            console.log('Fetched product HTML length:', responseText.length);
            const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
            const productElement = responseHTML.querySelector('product-info');

            if (!productElement) {
              console.error('No product-info element found in response');
              return;
            }

            console.log('Processing product element:', productElement);
            this.preprocessHTML(productElement);
            HTMLUpdateUtility.setInnerHTML(this.modalContent, productElement.outerHTML);
            
            // Log the content after insertion
            console.log('Modal content after HTML insertion:', this.modalContent.innerHTML.substring(0, 500) + '...');

            if (window.Shopify && Shopify.PaymentButton) {
              Shopify.PaymentButton.init();
            }
            if (window.ProductModel) window.ProductModel.loadShopifyXR();

            super.show(opener);
          })
          .catch(error => {
            console.error('Error fetching product:', error);
          })
          .finally(() => {
            opener.removeAttribute('aria-disabled');
            opener.classList.remove('loading');
            opener.querySelector('.loading__spinner').classList.add('hidden');
          });
      }

      preprocessHTML(productElement) {
        console.log('preprocessHTML called');
        productElement.classList.forEach((classApplied) => {
          if (classApplied.startsWith('color-') || classApplied === 'gradient')
            this.modalContent.classList.add(classApplied);
        });
        this.preventDuplicatedIDs(productElement);
        this.removeDOMElements(productElement);
        this.removeGalleryListSemantic(productElement);
        this.updateImageSizes(productElement);
        this.preventVariantURLSwitching(productElement);
        
        // Move reordering after HTML insertion
        // We'll call it after show() completes
        setTimeout(() => {
          this.reorderElementsAfterLoad();
        }, 100);
      }

      reorderElementsAfterLoad() {
        console.log('reorderElementsAfterLoad called');
        const container = this.modalContent.querySelector('.quick-add-modal__content-info');
        if (!container) {
          console.error('No .quick-add-modal__content-info container found');
          return;
        }

        console.log('Container found:', container);
        console.log('Current container children:', container.children);

        // Parse the elementOrder string
        console.log('Parsing elementOrder:', this.elementOrder);
        const orderArray = this.elementOrder.split(',').map(item => {
          const [key, position] = item.split(':');
          const parsed = { key: key.trim(), position: parseInt(position, 10) };
          console.log('Parsed item:', parsed);
          return parsed;
        });

        // Sort elements based on position
        orderArray.sort((a, b) => a.position - b.position);
        console.log('Sorted order array:', orderArray);

        // Find elements using more specific selectors for the actual product content
        const elements = {
          image: container.querySelector('.quick-add__product-media') || 
                 container.querySelector('.product__media') ||
                 container.querySelector('[id*="Slider-Gallery"]')?.closest('.product__media-wrapper') ||
                 container.querySelector('.media'),
          price: container.querySelector('.quick-add__price') ||
                 container.querySelector('.price') ||
                 container.querySelector('[class*="price"]') ||
                 container.querySelector('.product__price'),
          variant: container.querySelector('.quick-add__variant-picker') ||
                   container.querySelector('.product-form__input') ||
                   container.querySelector('select[name^="options"]')?.closest('.product-form__input, .variant-option, .form__field') ||
                   container.querySelector('.product-form__input--dropdown'),
          atc: container.querySelector('product-form') ||
               container.querySelector('.product-form') ||
               container.querySelector('form[action*="/cart/add"]') ||
               container.querySelector('.product-form__buttons') ||
               container.querySelector('button[type="submit"][name="add"]')?.closest('form, .product-form')
        };

        console.log('Found elements:', elements);

        // Clear container and append elements in the correct order
        const fragment = document.createDocumentFragment();
        let reorderedCount = 0;
        
        orderArray.forEach(({ key }) => {
          if (elements[key]) {
            console.log(`Appending ${key} element:`, elements[key]);
            fragment.appendChild(elements[key]);
            reorderedCount++;
          } else {
            console.warn(`Element ${key} not found`);
          }
        });

        // Append any remaining elements that weren't specified in order
        Array.from(container.children).forEach(child => {
          if (!orderArray.some(({ key }) => elements[key] === child)) {
            console.log('Appending remaining element:', child);
            fragment.appendChild(child);
          }
        });

        container.innerHTML = '';
        container.appendChild(fragment);
        
        console.log(`Reordered ${reorderedCount} elements successfully`);
        console.log('Final container children:', container.children);
      }

      preventVariantURLSwitching(productElement) {
        productElement.setAttribute('data-update-url', 'false');
      }

      removeDOMElements(productElement) {
        const pickupAvailability = productElement.querySelector('pickup-availability');
        if (pickupAvailability) {
          console.log('Removing pickup-availability');
          pickupAvailability.remove();
        }

        const productModal = productElement.querySelector('product-modal');
        if (productModal) {
          console.log('Removing product-modal');
          productModal.remove();
        }

        const modalDialogs = productElement.querySelectorAll('modal-dialog');
        if (modalDialogs.length > 0) {
          console.log(`Removing ${modalDialogs.length} modal-dialog elements`);
          modalDialogs.forEach((modal) => modal.remove());
        }
      }

      preventDuplicatedIDs(productElement) {
        const sectionId = productElement.dataset.section;
        console.log('Processing duplicated IDs, original sectionId:', sectionId);

        if (!sectionId) {
          console.warn('No section ID found in productElement');
          return;
        }

        const oldId = sectionId;
        const newId = `quickadd-${sectionId}`;
        
        // Replace in innerHTML
        let html = productElement.innerHTML;
        html = html.replaceAll(oldId, newId);
        productElement.innerHTML = html;
        
        // Replace in attributes
        Array.from(productElement.attributes).forEach((attribute) => {
          if (attribute.value && attribute.value.includes(oldId)) {
            const newValue = attribute.value.replaceAll(oldId, newId);
            productElement.setAttribute(attribute.name, newValue);
            console.log(`Updated attribute ${attribute.name}: ${attribute.value} -> ${newValue}`);
          }
        });

        productElement.dataset.originalSection = sectionId;
        console.log('Duplicated IDs processed, newId:', newId);
      }

      removeGalleryListSemantic(productElement) {
        const galleryList = productElement.querySelector('[id^="Slider-Gallery"]');
        if (!galleryList) {
          console.log('No gallery list found');
          return;
        }

        console.log('Updating gallery semantic roles');
        galleryList.setAttribute('role', 'presentation');
        const slides = galleryList.querySelectorAll('[id^="Slide-"]');
        slides.forEach((li) => li.setAttribute('role', 'presentation'));
        console.log(`Updated ${slides.length} slide elements`);
      }

      updateImageSizes(productElement) {
        const product = productElement.querySelector('.product');
        if (!product) {
          console.log('No product element found for image size update');
          return;
        }

        const desktopColumns = product.classList.contains('product--columns');
        if (!desktopColumns) {
          console.log('Not desktop columns layout, skipping image size update');
          return;
        }

        const mediaImages = product.querySelectorAll('.product__media img');
        if (!mediaImages.length) {
          console.log('No media images found');
          return;
        }

        console.log(`Updating sizes for ${mediaImages.length} media images`);
        let mediaImageSizes =
          '(min-width: 1000px) 715px, (min-width: 750px) calc((100vw - 11.5rem) / 2), calc(100vw - 4rem)';

        if (product.classList.contains('product--medium')) {
          mediaImageSizes = mediaImageSizes.replace('715px', '605px');
        } else if (product.classList.contains('product--small')) {
          mediaImageSizes = mediaImageSizes.replace('715px', '495px');
        }

        mediaImages.forEach((img, index) => {
          img.setAttribute('sizes', mediaImageSizes);
          if (index < 3) console.log(`Updated image ${index + 1} sizes:`, mediaImageSizes);
        });
      }
    }
  );
}