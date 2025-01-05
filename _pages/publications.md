---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
---

My astro related publications are listed in the following NASA ADS link:

All of my publications (including those in electrical engineering) can be found in the following Google Scholar link:



{% if author.googlescholar %}
  You can also find my articles on <u><a href="{{author.googlescholar}}">my Google Scholar profile</a>.</u>
{% endif %}

{% include base_path %}

{% for post in site.publications reversed %}
  {% include archive-single.html %}
{% endfor %}
