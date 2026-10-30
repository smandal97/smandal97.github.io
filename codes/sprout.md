---
layout: manual
title: "Sprout manual"
permalink: /codes/sprout/
lede: "How to build Sprout, set up a problem, run it, and read the results."
toc:
  - { id: about, title: "What Sprout does" }
  - { id: install, title: "Requirements and building" }
  - { id: modules, title: "Choosing modules" }
  - { id: parameters, title: "The parameter file" }
  - { id: running, title: "Running" }
  - { id: mesh, title: "Mesh motion" }
  - { id: output, title: "Output" }
  - { id: restart, title: "Restarting" }
  - { id: new-problem, title: "Setting up a new problem" }
  - { id: python, title: "Reading output in Python" }
  - { id: cite, title: "Citing Sprout" }
---

## What Sprout does {#about}

Sprout solves the equations of ideal hydrodynamics on a 3D Cartesian grid that can expand with the flow. The number of cells stays fixed while the cell size grows, so a single run can follow an outflow, such as a supernova remnant, from a tiny initial size to many orders of magnitude larger, with little numerical diffusion and longer time steps than a static grid would allow. The method is described in [Mandal & Duffell (2023)](https://ui.adsabs.harvard.edu/abs/2023ApJS..269...30M).

It runs in parallel with MPI, writes HDF5 checkpoints that ParaView or VisIt can open directly, and can restart from any checkpoint. 1D and 2D problems use the same code with the unused dimensions set to a single cell.

## Requirements and building {#install}

You need:

- an MPI C compiler (`mpicc`)
- the HDF5 library, built with MPI support

Get the source:

```bash
git clone https://github.com/smandal97/Sprout.git
cd Sprout
```

Open `Makefile` and point `H55` at your HDF5 installation. The file has one path for Linux and one for macOS (`/opt/homebrew/opt/hdf5-mpi` if you installed `hdf5-mpi` with Homebrew):

```make
ifeq ($(UNAME),Linux)
H55 = /path/to/your/hdf5
endif
```

Then build:

```bash
make            # builds the executable ./cube
make clean      # removes object files and the executable
make rmdata     # removes *.h5 output in the current folder
make cleanall   # removes objects, the executable, and all .h5 and .dat output
```

Run `make clean && make` whenever you change a module in the Makefile, so every object is rebuilt.

## Choosing modules {#modules}

Each piece of physics or numerics is a separate C file, picked by name at the top of the `Makefile`. To change one, set the variable to a file name from the matching folder, without `.c`:

```make
RESTART   = h5in
BOUNDARY  = cornermirror
INITIAL   = read_1d
HYDRO     = euler
RIEMANN   = hllc
GRAVITY   = slab
NOZZLE    = wind
SPACE     = plm
TIMESTEP  = rk2
MESHSPEED = follow_shock
OUTPUT    = h5out
```

| Variable | Folder | Options in the repository |
| --- | --- | --- |
| `INITIAL` | `Initial/` | Problem setups: `sedov`, `sedov2d`, `chevalier`, `exp_ejecta`, `homologous_flow`, `idealized_sn`, `read_1d` (reads a 1D profile from a `.dat` file), shock tubes (`1D_shocktube`, `2D_shocktube`, `1D_rel_shocktube`, `1D_twoshocks`), pulses, `khi`, `rti`, `implosion`, `kooshball`, `pwn`, `bondi`, `uniform`, `static` and more |
| `BOUNDARY` | `Boundary/` | `cornermirror`, `facemirror`, `periodic`, `dirichlet`, `dirichlet_periodic`, `neumann_zero`, `neumann_local`, `neumann_alt`, `hse_and_ho` |
| `HYDRO` | `Hydro/` | `euler` (Newtonian), `rel` (special relativistic) |
| `RIEMANN` | `Riemann/` | `hll`, `hllc`, `hllc_lm` |
| `SPACE` | `Space/` | Reconstruction: `pcm`, `plm`, `ppm`, `weno3`, `weno3.1`, `none` |
| `TIMESTEP` | `Timestep/` | `feuler`, `rk2`, `rk3` |
| `MESHSPEED` | `Meshspeed/` | How the grid expands; see [Mesh motion](#mesh) |
| `GRAVITY` | `Gravity/` | `point`, `slab`, `slab_powerlaw`, `best`; switched on with `Gravity_Switch` |
| `NOZZLE` | `Nozzle/` | Mass or energy injection: `wind`, `coffeewarmer`; switched on with `Nozzle_Switch` |
| `OUTPUT` | `Output/` | `h5out`, `h5out_1d`, `h5out_withghost`, `ph5out`, `ascii` |
| `RESTART` | `Restart/` | `h5in` (can restart from file), `no_restart` |

Files ending in `_bad` are experimental and kept for reference.

## The parameter file {#parameters}

Run-time settings live in `in.par`, which Sprout reads from the folder you run it in. Each line is a name followed by a value; anything after `//` is a comment. Keep every parameter below in the file, even unused ones: a missing name is reported as `… not found` and its value is left at zero.

| Parameter | Meaning |
| --- | --- |
| `Restart` | `1` to restart from `input.h5`, `0` to start from the initial conditions |
| `T_Start`, `T_End` | Start and end time of the run |
| `Num_Reports` | Number of lines written to `report.dat` over the run |
| `Num_Checkpoints` | Number of HDF5 checkpoints over the run |
| `Num_Snapshots` | Number of 2D slices (`map_NNNN.dat`) over the run; `0` turns them off |
| `Use_Logtime` | `1` spaces reports, checkpoints and snapshots evenly in log time between `T_Start` and `T_End`; `0` spaces them linearly |
| `Num_X`, `Num_Y`, `Num_Z` | Number of cells in each direction. Set `Num_Z 1` for 2D, and `Num_Y 1` too for 1D |
| `Lx`, `Ly`, `Lz` | Initial size of the domain in each direction |
| `CFL` | Courant number |
| `PLM` | Slope-limiter parameter for `plm` reconstruction, from 1 (minmod, most diffusive) to 2 (monotonized central, sharpest) |
| `Density_Floor` | Minimum density |
| `Pressure_Floor` | Minimum pressure, in units of the local density |
| `W0` | Expansion rate used by the `constant` and `homologous` mesh modules |
| `eta_on` | Mesh motion starts at `T_Start × eta_on` |
| `Mesh_motion_x0`, `_y0`, `_z0` | Centre of the expansion, as a fraction of `Lx`, `Ly`, `Lz` (`0` = the lower corner) |
| `Adiabatic_Index` | Ratio of specific heats, γ |
| `Gravity_Switch` | `0` none, `1` gravity as a force, `2` as a potential |
| `Central_Mass`, `Grav_G` | Mass and gravitational constant for the gravity modules |
| `Nozzle_Switch` | `1` turns on the injection module |
| `Nozzle_Power`, `Nozzle_Speed` | Power and speed of the injected flow |
| `Nozzle_x0`, `_y0`, `_z0` | Position of the injection, as a fraction of the domain size |

Sprout uses whatever units your initial conditions use; it has no built-in unit system.

## Running {#running}

From the folder that holds `in.par`:

```bash
mpirun -np 64 ./cube
```

Sprout splits the grid across processes automatically. Progress is printed as `t = …` lines, and each checkpoint is announced as it is written.

To stop a run early but cleanly, create a file named `abort` in the run folder:

```bash
touch abort
```

Sprout finishes the current step, writes a final `output.h5`, and exits. The file is deleted at the start of the next run.

## Mesh motion {#mesh}

The grid expands at a rate *W*: every step, all cell sizes and the domain size are multiplied by (1 + *W* d*t*), about the centre set by `Mesh_motion_x0/y0/z0`. The fluid equations include the matching source terms, so the expansion is consistent with the flow. How *W* is chosen depends on the `MESHSPEED` module:

| Module | Expansion rate |
| --- | --- |
| `zero` | No expansion (a static grid) |
| `constant` | *W* = `W0` |
| `homologous` | *W* = `W0` / *t*, starting at `T_Start × eta_on`; matches a homologous outflow |
| `follow_chevalier` | *W* = (*n* − *d*) / (*n* − *s*) / *t*, the self-similar Chevalier expansion for ejecta density index *n* and ambient index *s* (set inside the file; *d* is the number of dimensions) |
| `follow_shock` | Measures the outermost fast-moving gas each step and sets *W* so the forward shock stays inside the domain |
| `follow_fastest` | Sets *W* from the fastest outflowing material and its distance to the domain edge |
| `broken_pl`, `drift` | Specialised schedules kept for particular problems |

For outflows that grow by orders of magnitude, `follow_shock` or `homologous` with `Use_Logtime 1` is the usual choice.

## Output {#output}

| File | Contents |
| --- | --- |
| `checkpoint_NNNN.h5` | Full state of the grid, written `Num_Checkpoints` times |
| `checkpoint_NNNN.xmf` | Companion file so ParaView or VisIt can open the checkpoint directly |
| `output.h5` | Final state at the end of the run (or when stopped with `abort`) |
| `report.dat` | One line per report: time, d*t*, *W*, d*x*, d*y*, d*z*, thermal energy, total energy, total mass |
| `map_NNNN.dat` | 2D slices of the grid, if `Num_Snapshots` > 0 |
| `times.log` | Performance summary: wall time, cells, steps, zones per second |

Inside each HDF5 file:

- `Grid/T`: simulation time
- `Grid/Ntots`: number of cells in x, y, z
- `Grid/dxs`: cell size in x, y, z at that time
- `Grid/Origin`: position of the lower corner
- `Data/Cells`: an array indexed `[variable, z, y, x]`. Variable 0 is density, 1 is pressure, 2–4 are the x, y, z velocities, and 5–10 are passive scalars.

## Restarting {#restart}

Build with `RESTART = h5in`, then:

```bash
cp checkpoint_0012.h5 input.h5
```

Set `Restart 1` in `in.par` and run as usual. Sprout reads the time, grid size, cell size and all variables from `input.h5` and carries on to `T_End`.

## Setting up a new problem {#new-problem}

An initial-conditions module is a short C file in `Initial/` with two functions. `setICParams` runs once at start-up, and `initial` fills in the primitive variables for one cell at position `xi`:

```c
#include "../defs.h"

static double r0, p0;

void setICParams( struct domain * theDomain ){
   r0 = 0.02;                                   // radius of the energy deposit
   double E = 1.0;
   double gam = theDomain->theParList.Adiabatic_Index;
   p0 = (gam - 1.) * E / ( 4.*M_PI*r0*r0*r0/3. );
}

void initial( double * prim , double * xi , double t ){
   double r = sqrt( xi[0]*xi[0] + xi[1]*xi[1] + xi[2]*xi[2] );
   prim[RHO] = 1.0;
   prim[PPP] = ( r <= r0 ) ? p0 : 1e-4;
   prim[UU1] = 0.0;                              // x, y, z velocities
   prim[UU2] = 0.0;
   prim[UU3] = 0.0;
}
```

This is a simplified version of `Initial/sedov.c`. Save your file as, say, `Initial/myproblem.c`, set `INITIAL = myproblem` in the Makefile, and rebuild. Passive scalars (`XXX` onward) can be set the same way to tag material, for example ejecta versus ambient gas.

## Reading output in Python {#python}

```python
import h5py
import numpy as np
import matplotlib.pyplot as plt

f   = h5py.File("checkpoint_0010.h5", "r")
t   = f["Grid/T"][0]
dx, dy, dz = f["Grid/dxs"][:]
x0, y0, z0 = f["Grid/Origin"][:]

cells = f["Data/Cells"]          # [variable, z, y, x]
rho   = cells[0, 0]              # density in the z = 0 plane
ny, nx = rho.shape

plt.imshow(np.log10(rho), origin="lower", cmap="inferno_r",
           extent=[x0, x0 + nx*dx, y0, y0 + ny*dy])
plt.colorbar(label="log density")
plt.title(f"t = {t:.3e}")
plt.show()
```

Because the grid expands, `dxs` changes from one checkpoint to the next, so always build coordinates from the values in that file. The `Analysis/` folder also has tools for radial averages (`RadAvg`), mapping to polar coordinates (`Cart2Pol`), and turning snapshots into a movie (`snap2movie.py`).

## Citing Sprout {#cite}

If you use Sprout in published work, please cite:

Mandal, S. & Duffell, P. C. 2023, *Sprout: A Moving-Mesh Hydro Code Using a Uniformly Expanding Cartesian Grid*, ApJS, 269, 30. [ADS](https://ui.adsabs.harvard.edu/abs/2023ApJS..269...30M)

Questions or bugs: open an issue on [GitHub](https://github.com/smandal97/Sprout/issues) or email me at [{{ site.author.email }}](mailto:{{ site.author.email }}).
