---
title: "Viewing angle and the diversity of interacting supernovae"
order: 0
summary: "Mass transfer in a binary leaves the circumstellar material around an exploding star strongly aspherical. Building that material in 3D with Sprout and computing light curves along different lines of sight, the same explosion can look up to five times brighter or fainter depending on where we view it from, and spherical 1D fits can misjudge its mass-loss rate by more than 200%."
paper: "https://arxiv.org/abs/2607.28519"
paper_label: "Mandal et al. 2026, arXiv:2607.28519"
---

Many core-collapse supernovae explode inside circumstellar material (CSM) shed by the star before it died, and the collision shapes what we see. Most stars this massive live in binaries, so that material need not be spherical.

This project follows binaries that go through stable Roche-lobe overflow, using MESA models with a 16 solar-mass primary, companions of 12 to 15 solar masses, and initial orbital periods longer than 500 days. Their mass-loss histories are turned into 3D CSM structures with [Sprout](/research/sprout/). Density profiles taken along three lines of sight then feed multi-band light curves computed with the radiation-hydrodynamics code Stella.

The binary-shaped CSM is strongly aspherical, and the light curves change with viewing angle. Peak luminosities differ by about a factor of five, and the late-time B−V colour varies by about 1.5 magnitudes.

Fitting such events with one-dimensional models that assume an isolated progenitor and a spherical wind can bias the inferred explosion properties by up to 50% and the inferred mass-loss rates by more than 200%. Binary-shaped CSM seen from different angles could account for a substantial share of the diversity among interacting Type II supernovae, which makes the case for multidimensional modelling.
