#include <omp.h>
#include <mpi.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "prototype.h"

int readInputLength(FILE *file) {
   int inputLength;
   if (!fscanf(file, "%d", &inputLength)) {
      fprintf(stderr, "Error reading from file at: %d", __LINE__);
      MPI_Abort(MPI_COMM_WORLD, EXIT_FAILURE);
   }

   return inputLength;
}

// int* readInput(FILE *file, int size) {
//    // int* input, i;
//    // input = (int*) malloc(size * sizeof(int));
//    // if (!input) {
//    //    fprintf(stderr, "Could not allocate array\n");
//    //    MPI_Abort(MPI_COMM_WORLD, EXIT_FAILURE);
//    // }
//    // for (i = 0; i < size; i++) {
//    //    if (!fscanf(file, "%s ", &input[i])) {
//    //       fprintf(stderr, "Error reading from file at: %d", __LINE__);
//    //       MPI_Abort(MPI_COMM_WORLD, EXIT_FAILURE);
//    //    }
//    //    if (input[i] < 1 || input[i] > 256) {
//    //       fprintf(stderr, "Found %d inside input file, the allowed values are between 1 and 256", input[i]);
//    //       MPI_Abort(MPI_COMM_WORLD, EXIT_FAILURE);
//    //    }
//    // }
//    // fclose(file);

//    // return input;
// }

// int* calcHistogram(int* arr, int size) {
// 	int *histogram, *ompHistogram, *cudaHistogram;
// 	ompHistogram = ompHistogramCalc(arr, size / 2);
// 	// cudaHistogram = cudaHistogramCalc(arr + size / 2, size / 2);
// 	histogram = (int*) malloc(sizeof(int) * BUCKET_SIZE);

// 	if (!histogram) {
// 		fprintf(stderr, "Memory allocation failed\n");
//  		MPI_Abort(MPI_COMM_WORLD, EXIT_FAILURE);	
// 	}
//    #pragma omp for
// 	for (int i = 0; i < BUCKET_SIZE; i++) {
// 		histogram[i] = 0;
// 		histogram[i] += ompHistogram[i];
// 	}
// 	free(ompHistogram);
// 	// free(cudaHistogram);

// 	return histogram;
// }
struct Result* decrypt(int keyLen, char* inputData, size_t inputLen, char* wordData, size_t wordLen) {
   struct Result *firstRes;
   struct Result *secondRes;

   int maxKey = pow(keyLen, 2);
   int halfKey = floor(maxKey / 2);
   firstRes = ompDecrypt(halfKey, 0, keyLen, inputData, inputLen, wordData, wordLen);
   secondRes = ompDecrypt(maxKey, halfKey + 1, keyLen, inputData, inputLen, wordData, wordLen);

   if (!firstRes->key) {
      printf("Result came from second process!\n");
   }
   if (!secondRes->key) {
      printf("Result came from first process!\n");
   }
   if (!firstRes->key && !secondRes->key) {
      printf("Program failed to decrypt!\n");
      MPI_Abort(MPI_COMM_WORLD, 1);
   }
   if (firstRes) {
      return firstRes;
   } else {
      return secondRes;
   }
}

char* decimalToBinary(int n) {
   int i = 0;
   char *binary = (char*) malloc(sizeof(char) * MAX_KEY_LENGTH);
   binary = strdup("0000");
   if (n == 0) {
      return binary;
   }
   while (n > 0) {
      binary[MAX_KEY_LENGTH - 1 - i] = n % 2 + '0';
      n = n / 2;
      i++;
   }
   return binary;
}
