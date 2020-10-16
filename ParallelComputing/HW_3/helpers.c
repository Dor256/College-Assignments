#include <omp.h>
#include <mpi.h>
#include "prototype.h"
#include <stdio.h>
#include <stdlib.h>

int readInputLength(FILE *file) {
   int inputLength;
   if (!fscanf(file, "%d", &inputLength)) {
      fprintf(stderr, "Error reading from file at: %d", __LINE__);
      MPI_Abort(MPI_COMM_WORLD, EXIT_FAILURE);
   }

   return inputLength;
}

int* readInput(FILE *file, int size) {
   int* input, i;
   input = (int*) malloc(size * sizeof(int));
   if (!input) {
      fprintf(stderr, "Could not allocate array\n");
      MPI_Abort(MPI_COMM_WORLD, EXIT_FAILURE);
   }
   for (i = 0; i < size; i++) {
      if (!fscanf(file, "%d", &input[i])) {
         fprintf(stderr, "Error reading from file at: %d", __LINE__);
         MPI_Abort(MPI_COMM_WORLD, EXIT_FAILURE);
      }
      if (input[i] < 1 || input[i] > 256) {
         fprintf(stderr, "Found %d inside input file, the allowed values are between 1 and 256", input[i]);
         MPI_Abort(MPI_COMM_WORLD, EXIT_FAILURE);
      }
   }
   fclose(file);

   return input;
}

int* calcHistogram(int* arr, int size) {
	int *histogram, *ompHistogram, *cudaHistogram;
	ompHistogram = ompHistogramCalc(arr, size / 2);
	cudaHistogram = cudaHistogramCalc(arr + size / 2, size / 2);
	histogram = (int*) malloc(sizeof(int) * BUCKET_SIZE);

	if (!histogram) {
		fprintf(stderr, "Memory allocation failed\n");
 		MPI_Abort(MPI_COMM_WORLD, EXIT_FAILURE);	
	}
   #pragma omp for
	for (int i = 0; i < BUCKET_SIZE; i++) {
		histogram[i] = 0;
		histogram[i] += ompHistogram[i] + cudaHistogram[i];
	}
	free(ompHistogram);
	free(cudaHistogram);

	return histogram;
}
