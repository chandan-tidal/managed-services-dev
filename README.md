Project Overview: Quick View Popup and Variant Color Filtering
This project implements two enhancements for an e-commerce platform built on Shopify using the Dawn theme:

Quick View Popup on Product Listing Page (PLP): Adds a customizable "Quick View" button to product cards, displaying a popup with product details, including images, variant picker, price, and an "Add to Cart" button.
Variant Color Filtering on Product Detail Page (PDP): Enhances the product media gallery to dynamically filter images based on the selected color variant without requiring a page reload.

Repository Structure


Working Branch: feature/variant_color_filtering(For both the tasks- Quick View and Variant color Filtering)
Quick View Popup (PLP):
Developer Documentation: docs/quick-view-developer-guide.md
User Guide: docs/quick-view-user-guide.md


Variant Color Filtering (PDP):
Developer Documentation: docs/variant-color-filtering-developer-guide.md
User Guide: docs/variant-color-filtering-user-guide.md



Setup Instructions

Ensure the Shopify Dawn theme is installed.
Copy the modified files (sections/main-collection-product-grid.liquid, snippets/card-product.liquid, snippets/product-media-gallery.liquid, and assets/product-form.js) to the respective directories in the theme.
Configure settings in the Shopify Theme Editor as described in the user guides.
Test the functionality on PLP and PDP to ensure responsiveness and correct behavior.

Technologies Used

Shopify Liquid: For templating and rendering dynamic content.
JavaScript: For dynamic interactions (e.g., variant filtering, popup functionality).
CSS: For styling and responsive design.
HTML: For structuring the popup and media gallery.

Development Notes

The implementation leverages Dawn's built-in "Quick Add" feature for the Quick View popup, with customizations for typography and element ordering.
Variant color filtering uses JavaScript to dynamically filter images based on the alt attribute of media, ensuring seamless user interaction.
Both features are fully responsive, tested across mobile, tablet, and desktop breakpoints.

Support
For issues or further customization, refer to the developer guides or contact the development team.