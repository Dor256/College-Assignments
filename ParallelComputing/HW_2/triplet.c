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


Triplet* readTripletsFromFile(char *fileName, Triplet *triplets, int *size) {
	FILE *fp = fopen(fileName, "r");
	int isNumber;
	int number;
	int length = 0;
	int i = 0;
	int inputResult;
	int ch;

	if (fp) {
		// Read as untill end of file encountered
		while (!feof(fp)) {
			isNumber = fscanf(fp, "%d", &number);
			if (!isNumber) {
				// Clear $ signs
				ch = fgetc(fp);
			} else {
				// Populate triplets, allocating memory if needed
				if (i == 0) {
					length++;
					triplets = (Triplet*) realloc(triplets, length * sizeof(Triplet));
				}
				switch (i) {
					case 0:
						triplets[length - 1].first = number;
						i++;
						break;
					case 1:
						triplets[length - 1].second = number;
						i++;
						break;
					case 2:
						triplets[length - 1].third = number;
						i = 0;
						break;
				}
			}
		}
		// Close file
		fclose(fp);
		// Set the number of triplets
		*size = length;
		// Check for correct input
		inputResult = sqrt((double) length);
		if (inputResult * floor(inputResult) != length) {
			printf("ERROR - Input is not a perfect square!\n");
			MPI_Abort(MPI_COMM_WORLD, 1);
		}
	}
	return triplets;
}

Triplet* readTripletsFromInput(Triplet *triplets, int *size) {
	char userInput[MAX_INPUT_LENGTH];
	char *ptr = userInput;
	int length = 0;
	int i = 0;
	int inputResult;
	int number;
	fgets(userInput, sizeof(userInput), stdin);

	while (*ptr) {
		// If the input is a number process it, otherwise continue
		if (isdigit(*ptr)) {
			number = strtol(ptr, &ptr, 10);

			// Populate triplets, allocating memory if needed
			if (i == 0) {
				length++;
				triplets = (Triplet*) realloc(triplets, length * sizeof(Triplet));
			}
			switch (i) {
				case 0:
					triplets[length - 1].first = number;
					i++;
					break;
				case 1:
					triplets[length - 1].second = number;
					i++;
					break;
				case 2:
					triplets[length - 1].third = number;
					i = 0;
					break;
			}
		}
		ptr++;
	}
	// Set the number of triplets
	*size = length;
	// Check for correct input
	inputResult = sqrt((double) length);
	if (inputResult * floor(inputResult) != length) {
		printf("ERROR - Input is not a perfect square!\n");
		MPI_Abort(MPI_COMM_WORLD, 1);
	}
	return triplets;
}

// Print single triplet
void printTriplet(Triplet t) {
	printf("Triplet = { First=%d , Second=%d , Third=%d }\n", t.first, t.second, t.third);
}

// Traverse and print triplet array
void printAllTriplets(Triplet *triplets, int size) {
	for (int i = 0; i < size; i++) {
		printTriplet(triplets[i]);
	}
}

// Print reversed triplets for snake matrix
void printAllTripletsReversed(Triplet *triplets, int size) {
	for (int i = size - 1; i >= 0; i--) {
		printTriplet(triplets[i]);
	}
}

// Compares between triplets
int tripletComparator(Triplet t1, Triplet t2, enum SortDirection direction) {
	int compareValue;

	if (t1.first != t2.first) {
		compareValue = direction == ASC ? t1.first - t2.first : t2.first - t1.first;
	} else if (t1.second != t2.second) {
		compareValue = direction == ASC ? t1.second - t2.second : t2.second - t2.second;
	} else if (t1.third != t2.third) {
		compareValue = direction == ASC ? t1.third - t2.third : t2.third - t1.third;
	}
	return compareValue;
}

// Decides if a triplet is greater or lesser than the other
bool isGreater(Triplet t1, Triplet t2, enum SortDirection direction){
	//Since sort direction won't allow the compare to be < 0
	//If value isn't 0 the cuboids have the same volume so we will compare them by height
	int comparison = tripletComparator(t1, t2, direction);
	return comparison < 0;
}

// Prints triplets to output file
void writeTripletsToFile(FILE *fptr, Triplet *triplets, int size){
	for (int i = 0; i < size; i++) {
		fprintf(fptr, "(%d %d %d) ", triplets[i].first, triplets[i].second, triplets[i].third);
	}
}

// Prints triplets to output file reversed for snake matrix
void writeTripletsToFileReversed(FILE *fptr, Triplet* triplets, int size){
	for (int i = size - 1; i >= 0; i--) {
		   fprintf(fptr, "(%d %d %d) ", triplets[i].first, triplets[i].second, triplets[i].third);
		}
}

// Creates the cartesian communicator
void createCart(int *dim, int *period, int reorder, MPI_Comm *comm, int numOfDim) {
	dim[0] = numOfDim;
	dim[1] = numOfDim;
	period[0] = AVOID_CILCLIC;
	period[1] = AVOID_CILCLIC;
	if (MPI_Cart_create(MPI_COMM_WORLD, CART_DIM, dim, period, reorder, comm)) {
		MPI_Abort(MPI_COMM_WORLD, 1);
	}
}

// Prints the result of the Shear Sort
void printShearSortResult(Triplet *triplets, int size){
	Triplet *temp = triplets;
	int count, i;
	for (count = 0, i = 0; i < size; i += sqrt(size), count++) {
		triplets = &(temp[i]);
		if (isEven(count)) {
			printAllTriplets(triplets, sqrt(size));
		} else {
			printAllTripletsReversed(triplets, sqrt(size));
		}
	}
}

// Writes the result of Shear Sort to output file
void writeShearSortResultToFile(Triplet *triplets, char *fileName, int size) {
	FILE *fptr;
	Triplet *temp = triplets;
	int count, i;
	fptr = fopen(fileName, "w");
	if (fptr == NULL) {
		printf("ERROR - Couldn't open result file\n");
		MPI_Abort(MPI_COMM_WORLD, 1);
	}
	for (count = 0, i = 0; i < size; i += sqrt(size), count++) {
		triplets = &(temp[i]);
		if (isEven(count)) {
			writeTripletsToFile(fptr, triplets, sqrt(size));
		} else {
			writeTripletsToFileReversed(fptr, triplets, sqrt(size));
		}
	}

	// Close dangling file pointer
	fclose(fptr);
}

// Perofmr shear sort
Triplet shearSort(Triplet receivedTriplet, int size, MPI_Comm comm) {
	int myRank;
	int coord[2];
	MPI_Comm_rank(comm, &myRank);
	MPI_Cart_coords(comm, myRank, CART_DIM, coord);

	// According to Shear Sort formula
	int iterations = (int) ceil(log2((double) size)) + 1;

	for (int iter = 0; iter <= iterations; iter++) {
		if (isEven(iter)) {
			// Sort Cols
			receivedTriplet = oddEvenTranspositionSort(coord, receivedTriplet, COLS, comm);
		} else {
			// Sort Rows
			receivedTriplet = oddEvenTranspositionSort(coord, receivedTriplet, ROWS, comm);
		}
	}
	return receivedTriplet;
}

// Performs the odd even transposition sort
Triplet oddEvenTranspositionSort(int *coord, Triplet triplet, enum MatrixPassBy direction, MPI_Comm comm) {
	int neighborToExchangeWith, neighbor1, neighbor2;
	int sortDirection = getSortDirection(coord[0], direction);

	MPI_Cart_shift(comm, direction, 1, &neighbor1, &neighbor2);

	for (int iter = 0; iter < TRIPLET_SIZE; iter++) {
		int commMethod = getCommMethod(iter, coord[direction]);
		neighborToExchangeWith = getNeighborToExchangeWith(commMethod, neighbor1, neighbor2);

		if (neighborToExchangeWith != MPI_PROC_NULL) {
			// Exchange between triplets
			triplet = exchangeTriplets(triplet, commMethod, sortDirection, neighborToExchangeWith, comm);
		}
	}
	return triplet;
}

// Performs the exchange between two triplets
Triplet exchangeTriplets(Triplet triplet, int commMethod, enum SortDirection direction, int neighbor, MPI_Comm comm) {
	MPI_Datatype MPI_TRIPLET = MPITypeFromTriplet();
	MPI_Status status;
	Triplet resultTriplet;
	Triplet receivedTriplet;

	resultTriplet = triplet;

	if (commMethod == SEND) {
		MPI_Send(&triplet, 1, MPI_TRIPLET, neighbor, 0, comm);
		MPI_Recv(&resultTriplet, 1, MPI_TRIPLET, neighbor, 0, comm, &status);
	} else if (commMethod == REC) {
		MPI_Recv(&receivedTriplet, 1, MPI_TRIPLET, neighbor, 0, comm, &status);
		// Checks if replacement is needed and if so performs it
		if (isGreater(triplet, receivedTriplet, direction)) {
			resultTriplet = receivedTriplet;
			receivedTriplet = triplet;
		}
		MPI_Send(&receivedTriplet, 1, MPI_TRIPLET, neighbor, 0, comm);
	}

	return resultTriplet;
}



