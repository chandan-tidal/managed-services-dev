if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.sectionId = this.dataset.sectionId || this.closest('product-info')?.dataset.section || this.closest('quick-add-modal')?.dataset.sectionId;
        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('span');

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
        // Get full product JSON from script
        this.product = JSON.parse(document.getElementById(`ProductJSON-${this.sectionId}`)?.textContent || '{}');
        this.variants = this.product.variants || [];
        console.log('Product JSON:', this.product); // Debug
        console.log('Variants:', this.variants); // Debug
        // Add change listener for variant selection
        this.form.addEventListener('change', this.onVariantChange.bind(this));
        // Initial filter call and button state update
        const initialVariant = this.variants.find(v => v.id.toString() === this.variantIdInput.value);
        this.toggleSubmitButton(!initialVariant?.available, initialVariant?.available ? window.variantStrings.addToCart : window.variantStrings.soldOut);
        // this.filterMedia();
      }

      onVariantChange(event) {
        // // Get selected options
        // const variantInputs = this.form.querySelectorAll('[name^="options["]');
        // const selectedOptions = Array.from(variantInputs).map(input => input.value);
        
        // // Find matching variant
        // const variant = this.variants.find(v => {
        //   return selectedOptions.every((value, index) => v[`option${index + 1}`] === value);
        // });

        // if (variant) {
        //   console.log('Manually setting variant ID:', variant.id);
        //   this.variantIdInput.value = variant.id;
        //   this.toggleSubmitButton(!variant.available, variant.available ? window.variantStrings.addToCart : window.variantStrings.soldOut);
        //   this.filterMedia();
        // }
        this.filterVariantImage();
      }

      filterVariantImage(){
        const currentVariant = this.getCurrentVariant();
        console.log('Variant data: ', currentVariant);
        console.log('LOOP OUT: ', currentVariant?.featured_image);
        if (currentVariant?.featured_image && currentVariant?.featured_image.alt) {
          console.log('IN-IF');
          // show only the thumbnails for the selected color
          // [thumbnail-alt = 'red']
          document.querySelectorAll('[thumbnail-alt]').forEach(img => img.style.display = 'none')
          const currentImgAlt = currentVariant.featured_image.alt
          const thumbnailSelector = `[thumbnail-alt = '${currentImgAlt}']`
          document.querySelectorAll(thumbnailSelector).forEach(img => img.style.display = 'block')
        } else {
          console.log('IN-ELSE');
          // show all thumbnails
          document.querySelectorAll('[thumbnail-alt]').forEach(img => img.style.display = 'block')
        }
      }

      getCurrentVariant() {
        // First, check URL for variant ID
        const urlParams = new URLSearchParams(window.location.search);
        const variantIdFromUrl = urlParams.get('variant');
        if (variantIdFromUrl) {
          const variant = this.variants.find(v => v.id.toString() === variantIdFromUrl.toString());
          if (variant) {
            console.log('Variant found from URL variant ID:', variant);
            return variant;
          }
        }
      }

      filterMedia() {
        // Get current variant ID from hidden input
        const currentVariantId = this.variantIdInput.value;
        console.log('Current Variant ID:', currentVariantId); // Debug
        // Find current variant
        const currentVariant = this.variants.find(v => v.id.toString() === currentVariantId.toString());
        console.log('Current Variant:', currentVariant); // Debug
        // Try option1, then option2, then option3 for color
        const selectedColor = currentVariant
          ? (currentVariant.option1 || currentVariant.option2 || currentVariant.option3 || '')
          : '';
        console.log('Selected Color:', selectedColor); // Debug
        if (!selectedColor) {
          console.warn('No color selected - check variant ID, option1, option2, or option3');
          return;
        }

        // Scope media to Quick View popup if present
        const isQuickAdd = this.closest('quick-add-modal');
        const selectorPrefix = isQuickAdd ? `#QuickAddInfo-${this.product.id} ` : '';
        const allItems = document.querySelectorAll(`${selectorPrefix}[data-color]`);
        allItems.forEach(item => {
          item.style.display = 'none';
        });

        // Show matching media
        const matchingItems = document.querySelectorAll(`${selectorPrefix}[data-color="${selectedColor}"]`);
        matchingItems.forEach(item => {
          item.style.display = 'block';
        });

        console.log('Matching items:', matchingItems.length); // Debug
        console.log('Matching item IDs:', Array.from(matchingItems).map(el => el.id)); // Debug

        // Reset sliders after DOM update
        setTimeout(() => {
          // Main slider reset
          const mainSlider = document.getElementById(`Slider-Gallery-${this.sectionId}`);
          if (mainSlider) {
            console.log('Resetting main slider...');
            mainSlider.resetPages(); // Recalculates visible items
            mainSlider.slider.scrollTo({ left: 0 }); // Scroll to first
            const slides = mainSlider.querySelectorAll('.slider__slide');
            slides.forEach(el => el.classList.remove('is-active'));
            const firstVisible = Array.from(slides).find(el => el.style.display !== 'none' && el.clientWidth > 0);
            if (firstVisible) {
              firstVisible.classList.add('is-active');
              console.log('First visible slide:', firstVisible.id);
            } else {
              console.warn('No visible slides after filter');
            }
            mainSlider.update();
          } else {
            console.error('Main slider not found');
          }

          // Thumbnail slider reset
          const thumbSlider = document.getElementById(`GalleryThumbnails-${this.sectionId}`);
          if (thumbSlider) {
            console.log('Resetting thumbnail slider...');
            thumbSlider.resetPages(); // Recalculates visible thumbs
            thumbSlider.slider.scrollTo({ left: 0 });
            const thumbLinks = thumbSlider.querySelectorAll('.thumbnail');
            thumbLinks.forEach(el => el.removeAttribute('aria-current'));
            const firstThumb = Array.from(thumbLinks).find(el => el.closest('.thumbnail-list__item').style.display !== 'none' && el.closest('.thumbnail-list__item').clientWidth > 0);
            if (firstThumb) {
              firstThumb.setAttribute('aria-current', 'true');
              console.log('First visible thumb:', firstThumb.parentElement.id);
            } else {
              console.warn('No visible thumbs after filter');
            }
            thumbSlider.update();
          } else {
            console.error('Thumbnail slider not found');
          }

          window.dispatchEvent(new Event('resize'));
          console.log('Slider reset complete');
        }, 500); // Retain original delay
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);

              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButtonText.classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            const startMarker = CartPerformance.createStartingMarker('add:wait-for-subscribers');
            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              }).then(() => {
                CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    CartPerformance.measure("add:paint-updated-sections", () => {
                      this.cart.renderContents(response);
                    });
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              CartPerformance.measure("add:paint-updated-sections", () => {
                this.cart.renderContents(response);
              });
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner').classList.add('hidden');

            CartPerformance.measureFromEvent("add:user-action", evt);
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent = window.variantStrings.addToCart;
        }
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}