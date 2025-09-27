Developer Guide: Variant Color Filtering on Product Detail Page (PDP)
Overview
This feature enhances the product media gallery on the PDP to filter images dynamically based on the selected color variant. Only images matching the selected color (via the alt attribute) are displayed, without requiring a page reload.
Requirements Met

Color-Based Filtering: Selecting a color variant (e.g., red, blue) shows only images associated with that color.
Image Hiding: Images for other colors are hidden dynamically.
Dynamic Updates: Filtering occurs without page reload, using JavaScript.
Responsiveness: The gallery remains fully responsive across breakpoints.

Implementation Details
Files Modified

snippets/product-media-gallery.liquid:

Purpose: Renders the product media gallery with color-based filtering.
Key Changes:
Added data-color attribute to media items (<li>) and thumbnails, storing the color from media.alt.
Added conditional style="display: none;" to hide media items and thumbnails where media.alt does not match the selected variant’s color (selected_color).
Modified the gallery (Slider-Gallery-{{ section.id }}) and thumbnail list (Slider-Thumbnails-{{ section.id }}) to apply the data-color filter.
Ensures featured media is prioritized and filtered correctly if it matches the selected color.
Maintains Dawn’s existing responsive layouts (e.g., media_width, gallery_layout).




assets/product-form.js:

Purpose: Handles variant changes and triggers image filtering.
Key Changes:
Added an event listener for variant changes (e.g., on <select> or radio button changes).
Implemented filterVariantImage function to:
Retrieve the selected color from the variant’s option1.
Filter gallery images and thumbnails by comparing data-color with the selected color.
Toggle display: none to show/hide media items dynamically.


Ensures no page reload is required for filtering.





Technical Notes

Color Detection: Relies on the alt attribute of media to store color information (e.g., "Red|Image1"). Assumes consistent alt tagging in Shopify admin.
Dynamic Filtering: Uses JavaScript to update the DOM directly, ensuring fast and seamless transitions.
Accessibility: Maintains ARIA attributes (e.g., aria-label, aria-controls) for gallery navigation.
Dependencies: Integrates with Dawn’s media-gallery.js for slider functionality and product-form.js for form handling.
Responsiveness: Inherits Dawn’s responsive design, with media queries for mobile, tablet, and desktop layouts.

Testing

Verify that selecting a color variant updates the gallery to show only matching images.
Check that thumbnails and main gallery images hide correctly for non-selected colors.
Test across products with multiple colors and media types (images, videos, 3D models).
Ensure responsiveness on mobile, tablet, and desktop.
Validate that filtering works without page reload.

Known Limitations

Requires accurate alt tags on media to match variant colors.
Assumes option1 is the color option; may need adjustment for other variant structures.
Non-image media (e.g., videos, 3D models) may require additional handling if color-specific.
