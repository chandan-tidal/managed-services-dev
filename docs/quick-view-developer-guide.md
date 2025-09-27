Developer Guide: Quick View Popup on Product Listing Page (PLP)
Overview
This feature adds a "Quick View" button to product cards on the PLP, triggering a popup with product details (images, variant picker, price, and "Add to Cart" button). It leverages the Shopify Dawn theme’s "Quick Add" feature with customizations for button placement, typography, and popup element ordering.
Requirements Met

Popup Content:
Product Images: Displayed in a slider within the popup.
Variant Picker: Shows all product options (e.g., size, color).
Add to Cart Button: Allows adding the selected variant to the cart.
Product Price: Displays price, including compare-at-price if applicable.


Customization:
Typography: Configurable font size (12–20px), weight (regular, medium, semibold, bold), and text case (default, uppercase) for the Quick View button.
Element Order: Configurable positions for images, price, variant picker, and "Add to Cart" button in the popup.


Button Configuration:
Optional: Enable/disable via theme settings.
Placement: Supports top-left, top-right, bottom-left, bottom-right, or center on the product card.


Responsiveness: Fully responsive across mobile, tablet, and desktop breakpoints.

Implementation Details
Files Modified

sections/main-collection-product-grid.liquid:

Purpose: Defines schema settings and includes styles/scripts for Quick View.
Key Changes:
Added schema for:
quick_view_enabled: Toggle Quick View on/off.
quick_view_button_placement: Options for button position (top-left, top-right, bottom-left, bottom-right, center).
quick_view_button_font_size: Font size options (12px, 14px, 16px, 18px, 20px).
quick_view_button_font_weight: Font weight options (400, 500, 600, 700).
quick_view_button_text_case: Text case options (none, uppercase).
quick_view_image_position, quick_view_price_position, quick_view_variant_picker_position, quick_view_buy_buttons_position: Control popup element order (1st–4th).


Added responsive CSS for padding and popup font size.
Conditionally loads quick-add.js and product-form.js for standard Quick Add, or additional scripts for bulk add.
Passes quick_view_button_position to the card-product snippet.




snippets/card-product.liquid:

Purpose: Renders the product card and Quick View popup UI.
Key Changes:
Added quick_view_button_placement for dynamic CSS class (quick-view--{position}) to position the button.
Defined CSS grid for popup content (quick-add-modal__content-info) with dynamic row positions based on schema settings.
Included popup structure with:
Image slider (quick-add__product-media).
Price display (quick-add__price).
Variant picker (quick-add__variant-picker).
Add to Cart form (quick-add__submit).


Added debug logging for button placement and Quick View status.
Supports responsive image loading with srcset for various widths.





Technical Notes

Schema Customization: The schema uses visible_if conditions to show/hide settings based on quick_view_enabled.
CSS Grid: The popup uses a CSS grid to reorder elements dynamically based on user-defined positions.
Responsive Design: Media queries adjust padding and layout for mobile (750px and below) and desktop.
Accessibility: Includes ARIA attributes (aria-label, aria-labelledby) for the popup and buttons.
Dependencies: Relies on Dawn’s quick-add.js and product-form.js for popup and form functionality.

Testing

Verify button visibility and placement on product cards.
Test popup content (images, variants, price, Add to Cart) across products.
Check responsiveness on mobile, tablet, and desktop.
Ensure typography settings apply correctly to the button.
Validate element order changes in the popup via theme settings.

Known Limitations

Relies on Dawn’s Quick Add infrastructure, limiting some customizations.
Bulk add mode (quick_add: bulk) may override standard Quick View behavior for single-variant products.
