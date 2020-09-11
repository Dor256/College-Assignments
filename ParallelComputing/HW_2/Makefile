all: main.o

cuboid.o: triplet.c
	mpicc -c triplet.c

helpers.o: utils.c
	mpicc -c utils.c

main.o: main.c utils.c triplet.c
	mpicc -o main.o main.c triplet.c utils.c