I've included a Makefile for easy compilation if needed.

In order to compile the project simply run 'make' in the terminal. This will generate sequential.o, dynamic.o, and static.o.

In order to run each one of the programs the following command should be executed in the terminal (assuming MPI is installed):

mpiexec -n <number-of-slaves> <path-to-program>.

For example, if we want to execute the static solution with 3 slaves:

mpiexec -n 3 ./static.o