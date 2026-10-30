---
title: "Sprout: a hydro code with an expanding mesh"
order: 2
summary: "Sprout solves ideal hydrodynamics on a Cartesian grid that expands with the flow. Following an outflow over several orders of magnitude in size keeps shocks and fine structure sharp, with little numerical diffusion and longer time steps, which makes it well suited to supernova remnants and AGN outflows."
image: /images/sprout.png
image_alt: "Schematic of the Sprout grid: a small cubic mesh at t = 0 grows into a larger mesh with the same number of cells at t = 0.1."
paper: "https://ui.adsabs.harvard.edu/abs/2023ApJS..269...30M"
paper_label: "Mandal & Duffell 2023, ApJS 269, 30"
---

We present the publicly available moving-mesh hydrodynamics code Sprout. Sprout solves the equations of ideal hydrodynamics on an expanding Cartesian mesh. The expanding mesh can follow fluid outflows for several orders of magnitude with very little numerical diffusion, thereby capturing shocks and fine structures accurately. Following the bulk flow accurately also allows for longer time steps in general. This makes Sprout particularly suitable for studying expanding outflows such as supernova remnants and active galactic nuclei. Relative to other moving-mesh codes, the simple mesh structure in Sprout is also convenient for implementing additional physics or algorithms. Many code tests are performed to test the accuracy and performance of the numerical scheme.

Sprout is public. Read the [Sprout manual](/codes/sprout/) or get the code on [GitHub](https://github.com/smandal97/Sprout).
