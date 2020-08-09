all: dynamic.o static.o sequential.o

dynamic.o: Dynamic.c
	mpicc Dynamic.c -o dynamic.o

static.o: Static.c
	mpicc Static.c -o static.o

sequential.o: Sequential.c
	mpicc Sequential.c -o sequential.o