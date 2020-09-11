
#include <stdio.h>
#include <string.h>
#include <mpi.h>

#include "triplet.h"

#define NOT_ENOUGTH_PROCS_STR "proccesses needed in order to run the program\n"
#define INPUT "input.dat"
#define OUTPUT "result.dat"

int main(int argc, char *argv[]) {
	int workersCount, rank;
	int dim[CART_DIM], period[CART_DIM], reorder = 0, coord[CART_DIM];
	MPI_Comm comm;
	Triplet receivedTriplet;

	Triplet triplets[16];

	//Init MPI:
	MPI_Init(&argc, &argv);
	MPI_Comm_rank(MPI_COMM_WORLD, &rank);
	MPI_Comm_size(MPI_COMM_WORLD, &workersCount);
	// if (workersCount != AMOUNT_OF_CUBOIDS) {
	// 	printf("%d",AMOUNT_OF_CUBOIDS);
	// 	printf(NOT_ENOUGTH_PROCS_STR);
	// 	MPI_Finalize();
	// 	return 1;
	// }

	MPI_Datatype MPI_TRIPLET = MPITypeFromTriplet();

	if (isMaster(rank)) {
		readTripletsFromFile(INPUT, triplets);
		printf("\n--------------- Unsorted: ---------------\n");
		printAllTriplets(triplets, 16);
	}


	MPI_Scatter(triplets, 1, MPI_TRIPLET, &receivedTriplet, 1, MPI_TRIPLET, 0, MPI_COMM_WORLD);
	createCart(dim, period, reorder, &comm);
	MPI_Cart_coords(comm, rank, CART_DIM, coord);

	receivedTriplet = shearSort(receivedTriplet, 16, comm);

	MPI_Gather(&receivedTriplet, 1, MPI_TRIPLET, triplets, 1, MPI_TRIPLET, 0, MPI_COMM_WORLD);
	if (isMaster(rank)) {
		printf("\n--------------- Sorted: ---------------\n");
		printShearSortResult(triplets, 16);
		writeShearSortResultToFile(triplets, OUTPUT);
	}

	MPI_Finalize();

	return 0;
}
