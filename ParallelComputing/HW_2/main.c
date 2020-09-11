#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <mpi.h>

#include "triplet.h"

#define OUTPUT "output.dat"

int main(int argc, char *argv[]) {
	char *fileName = argv[1];
	int numOfWorkers, rank;
	int dim[CART_DIM], period[CART_DIM], reorder = 0, coord[CART_DIM];
	MPI_Comm comm;
	Triplet receivedTriplet;
	int numOfTriplets;
	Triplet *triplets = (Triplet*) malloc(sizeof(Triplet));

	//Init MPI:
	MPI_Init(&argc, &argv);
	MPI_Comm_rank(MPI_COMM_WORLD, &rank);
	MPI_Comm_size(MPI_COMM_WORLD, &numOfWorkers);

	MPI_Datatype MPI_TRIPLET = MPITypeFromTriplet();

	// Master rank prints array before sort
	if (isMaster(rank)) {
		if (fileName) {
			triplets = readTripletsFromFile(fileName, triplets, &numOfTriplets);
		} else {
			printf("No file entered, please insert triplets separated by $ signs: ");
			triplets = readTripletsFromInput(triplets, &numOfTriplets);
		}
		printf("\n--------------- Unsorted: ---------------\n");
		printAllTriplets(triplets, numOfTriplets);
	}

	// Send the number of triplets to all processes
	MPI_Bcast(&numOfTriplets, 1, MPI_INT, 0, MPI_COMM_WORLD);

	// Divide jobs between processes
	MPI_Scatter(triplets, 1, MPI_TRIPLET, &receivedTriplet, 1, MPI_TRIPLET, 0, MPI_COMM_WORLD);
	createCart(dim, period, reorder, &comm, sqrt(numOfTriplets));
	MPI_Cart_coords(comm, rank, CART_DIM, coord);

	// Perform shear sort
	receivedTriplet = shearSort(receivedTriplet, numOfTriplets, comm);

	// Gather results from processes
	MPI_Gather(&receivedTriplet, 1, MPI_TRIPLET, triplets, 1, MPI_TRIPLET, 0, MPI_COMM_WORLD);

	// Master rank prints sorted result and saves to file
	if (isMaster(rank)) {
		printf("\n--------------- Sorted: ---------------\n");
		printShearSortResult(triplets, numOfTriplets);
		writeShearSortResultToFile(triplets, OUTPUT, numOfTriplets);
	}

	MPI_Finalize();

	// Free triplet array
	free(triplets);

	return 0;
}
