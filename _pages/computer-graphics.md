---
permalink: /me/computer-graphics/
title: Gallery
subtitle: Playing with Computer Graphics
previous-title: Works
previous-url: /works
---

<link rel="stylesheet" href="/assets/css/computer-graphics.css">

## Computer graphics is a fun topic

{%
    include figure.html
    alt="A typical teapot"
    name="teapot.gif"
    caption="You can't mention computer graphics without showing a teapot."
%}

I'm no expert in computer graphics, but I wanted to know how they projected objects in a virtual 3D
space to a 2D on the screen. Especially the math behind it. So I decided to take a course on it.

It was one of the best courses I have taken.

## Started with Blender

One of the first things I did that are related to computer graphics was with Google SketchUp.
Yes, SketchUp was still owned by Google. Later I switched to Blender and started making realistic
renderings.

## Renderings

<ul id="renderings-list">
    {% for rendering in site.data.renderings %}
    <li>{% include image.html alt=rendering.alt name=rendering.file %}</li>
    {% endfor %}
</ul>