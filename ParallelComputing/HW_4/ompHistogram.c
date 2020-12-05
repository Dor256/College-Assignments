#include <omp.h>
#include <mpi.h>
#include <stdio.h>
#include <stdlib.h>
#include "prototype.h"

int* ompHistogramCalc(int* arr, int size) {
	int numberOfThreads, threadId;
	int *bucket, *result;

	// Create thread pool where each thread has a copy of the variable
	#pragma omp parallel private(threadId) shared(numberOfThreads, arr, size, bucket, result)
	{
		threadId = omp_get_thread_num();
		numberOfThreads = omp_get_num_threads();
		#pragma omp single
		{
			bucket = (int*) malloc(numberOfThreads * BUCKET_SIZE * sizeof(int));
			if (!bucket) {
				fprintf(stderr, "Memory allocation failed\n");
				MPI_Abort(MPI_COMM_WORLD, EXIT_FAILURE);	
			}
			result = (int*) malloc(BUCKET_SIZE * sizeof(int));
			if (!result) {
				fprintf(stderr, "Memory allocation failed\n");
						MPI_Abort(MPI_COMM_WORLD, EXIT_FAILURE);	
			}
		}
		#pragma omp for
		for (int i = 0; i < BUCKET_SIZE * numberOfThreads; i++) {
			if (i < BUCKET_SIZE) {
				result[i] = 0;
			}
			bucket[i] = 0;
		}

		#pragma omp for
		for (int i = 0; i < size; i++) {
			bucket[threadId * BUCKET_SIZE + arr[i]]++;
		}

		#pragma omp for
		for (int i = 0; i < BUCKET_SIZE; i++) {
			for (int j = 0; j < numberOfThreads; j++) {
				result[i] += bucket[i + (j * BUCKET_SIZE)];
			}
		}
	}
	free(bucket);
	return result;
}


