#include <mpi.h>
#include <stdio.h>
#include <omp.h>
#include <stdlib.h>
#include <math.h>
#include "prototype.h"

int main(int argc, char *argv[]) {
   int size, rank, i;
   size_t inputLength;
   size_t wordLength;
   char *input, *words;
   int *histograms;
   int *result;
   int keyLength;
   MPI_Status status;
   FILE *cipherFile, *wordsFile;

   MPI_Init(&argc, &argv);
   MPI_Comm_size(MPI_COMM_WORLD, &size);
   if (size != 2) {
      printf("Only two processes allowed!\n");
      MPI_Abort(MPI_COMM_WORLD, __LINE__);
   }
   if (argc < 3) {
      printf("Not enough arguments provided, usage: 'make run length=<keylength> file=<filename> [OPTIONAL]words=<wordsfilename>'\n");
      MPI_Abort(MPI_COMM_WORLD, __LINE__);
   }
   MPI_Comm_rank(MPI_COMM_WORLD, &rank);

   // Delegate tasks to processes
   if (rank == 0) {
      keyLength = atoi(argv[1]);
      cipherFile = fopen(argv[2], "r");
      if (argc == 4) {
         wordsFile = fopen(argv[3], "r");
      }

      if (!cipherFile) {
         fprintf(stderr, "Could not open file: %s\n", argv[1]);
         MPI_Abort(MPI_COMM_WORLD, 1);
      }

      input = readStringFromFile(cipherFile, 512, &inputLength);
      words = readStringFromFile(wordsFile, 512, &wordLength);
      MPI_Send(&keyLength, 1, MPI_INT, 1, 0, MPI_COMM_WORLD);
      MPI_Send(&inputLength, 1, MPI_INT, 1, 0, MPI_COMM_WORLD);
      MPI_Send(&wordLength, 1, MPI_INT, 1, 0, MPI_COMM_WORLD);
      MPI_Send(input, inputLength, MPI_CHAR, 1, 0, MPI_COMM_WORLD);
      MPI_Send(words, wordLength, MPI_CHAR, 1, 0, MPI_COMM_WORLD);
   } else {
      // Receive half of the array
      char *key, *inputData, *wordData, *decrypted;
      int inputLen, keyLen, wordLen, maxKey, i;
      MPI_Recv(&keyLen, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, &status);
      MPI_Recv(&inputLen, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, &status);
      MPI_Recv(&wordLen, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, &status);
      inputData = (char*) malloc(sizeof(char) * inputLen);
      wordData = (char*) malloc(sizeof(char) * wordLen);
      if (!inputData || !wordData) {
         fprintf(stderr, "Memory allocation failed\n");
         MPI_Abort(MPI_COMM_WORLD, __LINE__);
      }
      MPI_Recv(inputData, inputLen, MPI_CHAR, 0, 0, MPI_COMM_WORLD, &status);
      MPI_Recv(wordData, wordLen, MPI_CHAR, 0, 0, MPI_COMM_WORLD, &status);
      maxKey = floor(pow(keyLen, 2) / 2);
      ompDecrypt(maxKey, keyLen, inputData, inputLen, wordData, wordLen);
      // for (i = 8; i < maxKey * 2; i++) {
      //    key = decimalToBinary(i);
      //    decrypted = encryptDecrypt(key, keyLen, inputData, inputLen);
      //    if (validate(decrypted, wordData, wordLen)) {
      //       printf("The string is %s for key %s\n", decrypted, key);
      //       break;
      //    }
      // }
   }
   // histograms = calcHistogram(input, size);

   // Receive result from process
   // if (rank == 0) {
   //    result = (int*) malloc(BUCKET_SIZE * sizeof(int));

   //    if (!result) {
   //       fprintf(stderr, "Memory allocation failed\n");
   //       MPI_Abort(MPI_COMM_WORLD, __LINE__);
   //    }
   //    MPI_Recv(result, BUCKET_SIZE, MPI_INT, 1, 0, MPI_COMM_WORLD, &status);

   //    #pragma omp parallel for
   //    for (i = 0; i < BUCKET_SIZE; ++i) {
   //       // histograms[i] += result[i];
   //    }
   //    for (i = 0; i < BUCKET_SIZE; ++i) {
   //       // printf("%d ", histograms[i]);
   //    }

   //    printf("\n");
   //    free(result);
   // } else {
   //    // MPI_Send(histograms, BUCKET_SIZE, MPI_INT, 0, 0, MPI_COMM_WORLD);
   // }

   // free(histograms);
   // free(input);

   MPI_Finalize();

   return 0;
}
