#ifndef TRIPLET_H_
#define TRIPLET_H_

#define TRIPLET_SIZE 3
#define MAX_TRIPLETS 100
#define MAT_ROW_SIZE 4
#define MAT_SIZE (MAT_ROW_SIZE * MAT_ROW_SIZE)
#define CART_DIM 2
#define AVOID_CILCLIC 0

#include <stdio.h>
#include <stdbool.h>
#include <stddef.h>
#include <stdlib.h>
#include <math.h>
#include <mpi.h>

#include "utils.h"

typedef struct Triplet{
	int first;
	int second;
	int third;
} Triplet;

MPI_Datatype MPITypeFromTriplet();

void readTripletsFromFile(char *fileName, Triplet triplets[MAX_TRIPLETS]);

void printTriplet(Triplet t);

void printAllTriplets(Triplet *triplets, int size);

void printAllTripletsReversed(Triplet *triplets, int size);

int tripletComparator(Triplet t1, Triplet t2, enum SortDirection direction);

bool isGreater(Triplet t1, Triplet t2, enum SortDirection direction);

void writeTripletsToFile(FILE *fptr, Triplet *triplets, int size);

void writeTripletsToFileReversed(FILE *fptr, Triplet *triplets, int size);

void createCart(int *dim, int *period, int reorder, MPI_Comm *comm);

void printShearSortResult(Triplet *triplets, int size);

void writeShearSortResultToFile(Triplet *triplets, char *fileName);

Triplet shearSort(Triplet receivedTriplet, int size, MPI_Comm comm);

Triplet oddEvenTranspositionSort(int *coord, Triplet triplet, enum MatrixPassBy direction, MPI_Comm comm);

Triplet exchangeCuboids(Triplet myCuboid, int commMethod, enum SortDirection driection, int neighbor, MPI_Comm comm);


#endif
