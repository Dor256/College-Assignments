#include <mpi.h>
#include <stdio.h>
#include <omp.h>
#include <stdlib.h>
#include "prototype.h"

int main(int argc, char *argv[]) {
   int size, rank, i, inputLength;
   int *input;
   int *histograms;
   int *result;
   MPI_Status status;
   FILE *file;

   MPI_Init(&argc, &argv);
   MPI_Comm_size(MPI_COMM_WORLD, &size);
   if (size != 2) {
      printf("Only two processes allowed!\n");
      MPI_Abort(MPI_COMM_WORLD, __LINE__);
   }
   if (argc != 2) {
      printf("No input file was provided, usage: 'make run file=<filename>'\n");
      MPI_Abort(MPI_COMM_WORLD, __LINE__);
   }
   MPI_Comm_rank(MPI_COMM_WORLD, &rank);

   // Delegate tasks to processes
   if (rank == 0) {
      file = fopen(argv[1], "r");

      if (!file) {
         fprintf(stderr, "Could not open file: %s\n", argv[1]);
         MPI_Abort(MPI_COMM_WORLD, 1);
      }

      inputLength = readInputLength(file);
      input = readInput(file, inputLength);

      size = (inputLength / 2);
      MPI_Send(&size, 1, MPI_INT, 1, 0, MPI_COMM_WORLD);

      MPI_Send(input + size, size, MPI_INT, 1, 0, MPI_COMM_WORLD);
   } else {
      // Receive half of the array
      MPI_Recv(&size, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, &status);
      input = (int*) malloc(size * sizeof(int));
      if (!input) {
	      fprintf(stderr, "Memory allocation failed\n");
         MPI_Abort(MPI_COMM_WORLD, __LINE__);
      }
      MPI_Recv(input, size, MPI_INT, 0, 0, MPI_COMM_WORLD, &status);
   }
   histograms = calcHistogram(input, size);

   // Receive result from process
   if (rank == 0) {
      result = (int*) malloc(BUCKET_SIZE * sizeof(int));

      if (!result) {
         fprintf(stderr, "Memory allocation failed\n");
         MPI_Abort(MPI_COMM_WORLD, __LINE__);
      }
      MPI_Recv(result, BUCKET_SIZE, MPI_INT, 1, 0, MPI_COMM_WORLD, &status);

      #pragma omp parallel for
      for (i = 0; i < BUCKET_SIZE; ++i) {
         histograms[i] += result[i];
      }
      for (i = 0; i < BUCKET_SIZE; ++i) {
         printf("%d ", histograms[i]);
      }

      printf("\n");
      free(result);
   } else {
      MPI_Send(histograms, BUCKET_SIZE, MPI_INT, 0, 0, MPI_COMM_WORLD);
   }

   free(histograms);
   free(input);

   MPI_Finalize();

   return 0;
}
