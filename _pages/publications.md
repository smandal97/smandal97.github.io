---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
---

My astro related publications are listed in [my NASA ADS library](https://ui.adsabs.harvard.edu/public-libraries/g4GAXvjxTSKkJCB4581imA).

All of my publications (astrophysics and soft computing techniques in engineering) can be found in [my Google Scholar profile](https://scholar.google.com/citations?user=xH4Kyp8AAAAJ&hl=en).


{% include base_path %}

{% for post in site.publications reversed %}
  {% include archive-single.html %}
{% endfor %}
