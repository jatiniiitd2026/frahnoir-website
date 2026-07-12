Frahnoir 3D texture starter pack
=================================

This pack contains clean starter PNG textures extracted/rebuilt from the uploaded box dieline PDF and product references.

Recommended first website hero: textures/velvet_ember/
- velvet_ember_box_front.png
- velvet_ember_box_left_character.png
- velvet_ember_box_right_recommended.png
- velvet_ember_box_back_legal.png
- velvet_ember_box_top.png
- velvet_ember_box_bottom.png
- velvet_ember_bottle_label_wrap.png
- velvet_ember_logo_label_transparent_gold.png
- velvet_ember_crest_transparent_gold.png

Second variant: textures/sweet_s1n/
- sweet_s1n_box_front.png
- sweet_s1n_box_left_character.png
- sweet_s1n_box_right_recommended.png
- sweet_s1n_box_back_legal.png
- sweet_s1n_box_top.png
- sweet_s1n_box_bottom.png
- sweet_s1n_bottle_label_wrap.png
- sweet_s1n_logo_label_transparent_gold.png
- sweet_s1n_crest_transparent_gold.png

How to use in Three.js / React Three Fiber:
- Apply front/back/left/right/top/bottom PNGs as six materials on a BoxGeometry.
- Apply bottle_label_wrap.png to the cylindrical bottle body/wrap.
- Use transparent_gold PNGs for overlays, decals, or extra emissive/gold-foil details.

Notes:
- These are MVP/starter web textures, not print-production files.
- For final production, export the original Corel/AI/CDR artwork directly as high-resolution SVG/PNG panels.
- The back/legal texture contains packaging contact/manufacturing details from the PDF. Replace it if you don't want that visible on the public site.


Alternate extracted render textures
-----------------------------------
Also included inside each variant's alt_render_extracted/ folder are perspective-cropped textures from the polished product renders. These preserve the exact visual render better, but are not as clean as the rebuilt flat textures. Use them for quick MVP testing if they look better on the 3D model.
