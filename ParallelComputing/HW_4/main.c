#include <mpi.h>
#include <stdio.h>
#include <omp.h>
#include <stdlib.h>
#include <math.h>
#include "prototype.h"

int main(int argc, char *argv[]) {
   // Variable declaration for master process
   int size, rank;
   size_t inputLength;
   char *input, *words;
   int keyLength;
   MPI_Status status;
   FILE *cipherFile, *wordsFile;

   // Variable declaration for child process
   size_t wordLength;
   char *key, *inputData, *wordData, *decrypted;
   int inputLen, keyLen, wordLen;
   struct Result* res;

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

      // Read input data and known words from relevant files
      input = readStringFromFile(cipherFile, MAX_TEXT_LENGTH, &inputLength);
      words = readStringFromFile(wordsFile, MAX_TEXT_LENGTH, &wordLength);

      // Send the data to processing
      MPI_Send(&keyLength, 1, MPI_INT, 1, 0, MPI_COMM_WORLD);
      MPI_Send(&inputLength, 1, MPI_INT, 1, 0, MPI_COMM_WORLD);
      MPI_Send(&wordLength, 1, MPI_INT, 1, 0, MPI_COMM_WORLD);
      MPI_Send(input, inputLength, MPI_CHAR, 1, 0, MPI_COMM_WORLD);
      MPI_Send(words, wordLength, MPI_CHAR, 1, 0, MPI_COMM_WORLD);
   } else {
      char *key, *inputData, *wordData, *decrypted;
      int inputLen, keyLen, wordLen;
      struct Result* res;

      // Receive data from main process
      MPI_Recv(&keyLen, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, &status);
      MPI_Recv(&inputLen, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, &status);
      MPI_Recv(&wordLen, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, &status);

      // Allocate memory for input data
      inputData = (char*) malloc(sizeof(char) * inputLen);
      wordData = (char*) malloc(sizeof(char) * wordLen);
      if (!inputData || !wordData) {
         fprintf(stderr, "Memory allocation failed\n");
         MPI_Abort(MPI_COMM_WORLD, __LINE__);
      }
      MPI_Recv(inputData, inputLen, MPI_CHAR, 0, 0, MPI_COMM_WORLD, &status);
      MPI_Recv(wordData, wordLen, MPI_CHAR, 0, 0, MPI_COMM_WORLD, &status);

      // Print the deciphered text and the correct key
      printf("text: %s\nkey: %s\n", res->plaintext, res->key);
   }

   // Send data to OpenMP processes for brute-force decryption
   res = decrypt(keyLen, inputData, inputLen, wordData, wordLen);
   if (res && res->key && res-> plaintext) {
      printf("\n========Decrypted Text: %s========\n========Encryption Key: %s========\n", res->plaintext, res->key);
   }

   // Free allocated memory
   if (rank == 0) {
      free(input);
      free(words);
   } else {
      free(inputData);
      free(wordData);
      free(res);
   }

   MPI_Finalize();

   return 0;
}
