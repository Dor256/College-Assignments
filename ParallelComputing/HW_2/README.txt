I've included a Makefile for easy compilation if needed.

In order to compile the project simply run 'make' in the terminal. This will generate main.o.

In order to run the program the following command should be executed in the terminal (assuming MPI is installed):

mpiexec -n <number-of-slaves> ./main.o.

For example, if we want to execute the program with 16 slaves:

mpiexec -n 16 ./main.o