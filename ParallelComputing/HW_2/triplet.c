#include <stdlib.h>
#include <stdio.h>
#include <math.h>
#include <mpi.h>

#include "triplet.h"

MPI_Datatype MPITypeFromTriplet() {
	MPI_Datatype MPI_TRIPLET;
	MPI_Datatype dataTypes[3] = { MPI_INT, MPI_INT, MPI_INT };
	int blockLengths[3] = { 1, 1, 1 };
	MPI_Aint offsets[3];
	offsets[0] = offsetof(Triplet, first);
	offsets[1] = offsetof(Triplet, second);
	offsets[2] = offsetof(Triplet, third);
	MPI_Type_create_struct(3, blockLengths, offsets, dataTypes, &MPI_TRIPLET);
	MPI_Type_commit(&MPI_TRIPLET);
	return MPI_TRIPLET;
}


void readTripletsFromFile(char *fileName, Triplet triplets[MAX_TRIPLETS]) {
	int num;
	int isNumber;
	int i = 0;
	int current = 0;
	int fileCounter = 1;
	double inputResult;
	char ch;
	FILE *fp = fopen(fileName, "r");
	if (fp) {
		while (!feof(fp)) {
			// Read number
			isNumber = fscanf(fp, "%d", &num);
			fileCounter++;
			if (!isNumber) {
				// Clear $ signs
				ch = fgetc(fp);
			} else {
				// Populate all triplets
				switch (i) {
					case 0:
						triplets[current].first = num;
						++i;
						break;
					case 1:
						triplets[current].second = num;
						++i;
						break;
					case 2:
						triplets[current].third = num;
						i = 0;
						++current;
						break;
				}
			}
		}
		// Close file
		fclose(fp);
		inputResult = sqrt((double)fileCounter);
		if (inputResult * floor(inputResult) != fileCounter) {
			printf("Input is not a perfect square!\n");
			exit(1);
		}
	}
}

void printTriplet(Triplet t) {
	printf("Triplet = { First=%d , Second=%d , Third=%d }\n", t.first, t.second, t.third);
}

void printAllTriplets(Triplet *triplets, int size) {
	for (int i = 0; i < size; i++) {
		if (triplets[i].first != 0) {
			printTriplet(triplets[i]);
		}
	}
}

void printAllTripletsReversed(Triplet *triplets, int size) {
	for (int i = size - 1; i >= 0; i--) {
		printTriplet(triplets[i]);
	}
}

int tripletComparator(Triplet t1, Triplet t2, enum SortDirection direction) {
	int compareValue;
	if (t1.first != t2.first) {
		compareValue = direction == DESC ? t1.first - t2.first : t2.first - t1.first;
	} else if (t1.second != t2.second) {
		compareValue = direction == DESC ? t1.second - t2.second : t2.second - t2.second;
	} else if (t1.third != t2.third) {
		compareValue = direction == DESC ? t1.third - t2.third : t2.third - t1.third;
	}
	return compareValue;
}

bool isGreater(Triplet t1, Triplet t2, enum SortDirection direction){
	//Since sort direction won't allow the compare to be < 0
	//If value isn't 0 the cuboids have the same volume so we will compare them by height
	int comparison = tripletComparator(t1, t2, direction);
	return comparison > 0;
}

void writeTripletsToFile(FILE *fptr, Triplet *triplets, int size){
	for (int i = 0; i < size; i++) {
		fprintf(fptr, "(%d %d %d) ", triplets[i].first, triplets[i].second, triplets[i].third);
	}
}

void writeTripletsToFileReversed(FILE *fptr, Triplet* triplets, int size){
	for (int i = size - 1; i >= 0; i--) {
		   fprintf(fptr, "(%d %d %d) ", triplets[i].first, triplets[i].second, triplets[i].third);
		}
}

void createCart(int *dim, int *period, int reorder, MPI_Comm *comm) {
	dim[0] = 4;
	dim[1] = 4;
	period[0] = AVOID_CILCLIC;
	period[1] = AVOID_CILCLIC;
	if (MPI_Cart_create(MPI_COMM_WORLD, CART_DIM, dim, period, reorder, comm)) {
		MPI_Abort(MPI_COMM_WORLD, 1);
	}
}

void printShearSortResult(Triplet *triplets, int size){
	Triplet *temp = triplets;
	int count, i;
	for (count = 0, i = 0; i < 16; i += 4, count++) {
		triplets = &(temp[i]);
		if (isEven(count)) {
			printAllTriplets(triplets, 4);
		} else {
			printAllTripletsReversed(triplets, 4);
		}
	}
}

//We know there is some code duplication with print and write
// but we wanted the code to be more readable
void writeShearSortResultToFile(Triplet *triplets, char *fileName) {
	FILE *fptr;
	Triplet *temp = triplets;
	int count, i;
	fptr = fopen(fileName, "w");
	if (fptr == NULL) {
		printf("ERROR - Couldn't open result file\n");
		MPI_Abort(MPI_COMM_WORLD, 1);
	}
	for (count = 0, i = 0; i < 16; i += 4, count++) {
		triplets = &(temp[i]);
		if (isEven(count)) {
			writeTripletsToFile(fptr, triplets, 4);
		} else {
			writeTripletsToFileReversed(fptr, triplets, 4);
		}
	}

	fclose(fptr);
}

Triplet shearSort(Triplet receivedTriplet, int size, MPI_Comm comm) {
	int myRank;
	int coord[2];
	MPI_Comm_rank(comm, &myRank);
	MPI_Cart_coords(comm, myRank, CART_DIM, coord);

	// According to formula:
	int iterations = (int) ceil(log2((double) size)) + 1;

	for (int iter = 0; iter <= iterations; iter++) {
		if (isEven(iter)) {
			// Rows sorting:
			receivedTriplet = oddEvenTranspositionSort(coord, receivedTriplet, COLS, comm);
		} else {
				// Columns sorting:
			receivedTriplet = oddEvenTranspositionSort(coord, receivedTriplet, ROWS, comm);
		}
	}
	return receivedTriplet;
}

Triplet oddEvenTranspositionSort(int *coord, Triplet triplet, enum MatrixPassBy direction, MPI_Comm comm) {
	int neighborToExchangeWith, neighbor1, neighbor2;
	int sortDirection = getSortDirection(coord[0], direction);

	MPI_Cart_shift(comm, direction, 1, &neighbor1, &neighbor2);

	for (int iter = 0; iter < TRIPLET_SIZE; iter++) {
		int commMethod = getCommMethod(iter, coord[direction]);
		neighborToExchangeWith = getNeighborToExchangeWith(commMethod, neighbor1, neighbor2);

		if (neighborToExchangeWith != MPI_PROC_NULL) {
			triplet = exchangeCuboids(triplet, commMethod, sortDirection, neighborToExchangeWith, comm);
		}
	}
	return triplet;
}

Triplet exchangeCuboids(Triplet triplet, int commMethod, enum SortDirection direction, int neighbor, MPI_Comm comm) {
	MPI_Datatype MPI_CUBOID = MPITypeFromTriplet();
	MPI_Status status;
	Triplet resultTriplet;
	Triplet receivedTriplet;

	resultTriplet = triplet;

	if (commMethod == SEND) {
		MPI_Send(&triplet, 1, MPI_CUBOID, neighbor, 0, comm);
		MPI_Recv(&resultTriplet, 1, MPI_CUBOID, neighbor, 0, comm, &status);
	} else if (commMethod == REC) {
		MPI_Recv(&receivedTriplet, 1, MPI_CUBOID, neighbor, 0, comm, &status);
		if (isGreater(triplet, receivedTriplet, direction)) {
			resultTriplet = receivedTriplet;
			receivedTriplet = triplet;
		}
		MPI_Send(&receivedTriplet, 1, MPI_CUBOID, neighbor, 0, comm);
	}

	return resultTriplet;
}



