#include <mpi.h>
#include <stdio.h>
#include <omp.h>
#include <stdlib.h>
#include <math.h>
#include <glib.h>
#include "prototype.h"

int main(int argc, char *argv[]) {
   int size, rank;
   MPI_Status status;
   FILE *cipherFile, *wordsFile;

   MPI_Init(&argc, &argv);
   MPI_Comm_size(MPI_COMM_WORLD, &size);
   int inputLength, wordLength;
   int fromKey, toKey, maxKey, keyLength;
   char *words, *input;
   Result *res;
   GHashTable *wordSet;

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
      } else {
         wordsFile = fopen(DEFAULT_WORDS_FILE, "r");
      }

      if (!cipherFile) {
         fprintf(stderr, "Could not open file: %s\n", argv[1]);
         MPI_Abort(MPI_COMM_WORLD, 1);
      }

      // Read input data and known words from relevant files
      input = readStringFromFile(cipherFile, MAX_TEXT_LENGTH, &inputLength);
      words = readStringFromFile(wordsFile, MAX_TEXT_LENGTH, &wordLength);

      // Send the data to processing
      fromKey = 0;
      maxKey = pow(keyLength, 2);
      toKey = floor(maxKey / 2);
      MPI_Send(&keyLength, 1, MPI_INT, 1, 0, MPI_COMM_WORLD);
      MPI_Send(&maxKey, 1, MPI_INT, 1, 0, MPI_COMM_WORLD);
      MPI_Send(&inputLength, 1, MPI_INT, 1, 0, MPI_COMM_WORLD);
      MPI_Send(&wordLength, 1, MPI_INT, 1, 0, MPI_COMM_WORLD);
      MPI_Send(input, inputLength, MPI_CHAR, 1, 0, MPI_COMM_WORLD);
      MPI_Send(words, wordLength, MPI_CHAR, 1, 0, MPI_COMM_WORLD);
   } else {
      // Receive data from main process
      MPI_Recv(&keyLength, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, &status);
      MPI_Recv(&maxKey, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, &status);
      MPI_Recv(&inputLength, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, &status);
      MPI_Recv(&wordLength, 1, MPI_INT, 0, 0, MPI_COMM_WORLD, &status);

      // Allocate memory for input data
      input = (char*) malloc(sizeof(char) * inputLength);
      words = (char*) malloc(sizeof(char) * wordLength);
      if (!input || !words) {
         fprintf(stderr, "Memory allocation failed\n");
         MPI_Abort(MPI_COMM_WORLD, __LINE__);
      }
      MPI_Recv(input, inputLength, MPI_CHAR, 0, 0, MPI_COMM_WORLD, &status);
      MPI_Recv(words, wordLength, MPI_CHAR, 0, 0, MPI_COMM_WORLD, &status);
      fromKey = floor(maxKey / 2) + 1;
      toKey = maxKey;
   }
   // Generate the hash set for the words file
   wordSet = generateWordSet(words);
   // Send data to OpenMP processes for brute-force decryption
   res = decrypt(keyLength, fromKey, toKey, input, inputLength, wordSet);
   if (rank != 0) {
      MPI_Send(res->plaintext, MAX_TEXT_LENGTH, MPI_CHAR, 0, 0, MPI_COMM_WORLD);
      MPI_Send(res->key, MAX_TEXT_LENGTH, MPI_CHAR, 0, 0, MPI_COMM_WORLD);
      MPI_Send(&res->matchCount, 1, MPI_INT, 0, 0, MPI_COMM_WORLD);
   } else {
      Result *otherResult = (Result*) malloc(sizeof(Result));
      char *key = (char*) malloc(MAX_TEXT_LENGTH);
      char *plaintext = (char*) malloc(MAX_TEXT_LENGTH);
      int matchCount;
      MPI_Recv(plaintext, MAX_TEXT_LENGTH, MPI_CHAR, 1, 0, MPI_COMM_WORLD, &status);
      MPI_Recv(key, MAX_TEXT_LENGTH, MPI_CHAR, 1, 0, MPI_COMM_WORLD, &status);
      MPI_Recv(&matchCount, 1, MPI_INT, 1, 0, MPI_COMM_WORLD, &status);
      otherResult->plaintext = plaintext;
      otherResult->key = key;
      otherResult->matchCount = matchCount;

      if (res->matchCount > otherResult->matchCount) {
         printf("\n========Decrypted Text: %s========\n========Encryption Key: %s========\n", res->plaintext, res->key);
      } else {
         printf("\n========Decrypted Text: %s========\n========Encryption Key: %s========\n", otherResult->plaintext, otherResult->key);
      }

      free(key);
      free(plaintext);
      free(otherResult);
   }

   free(words);
   free(input);
   free(res);
   g_hash_table_destroy(wordSet);

   MPI_Finalize();

   return 0;
}
