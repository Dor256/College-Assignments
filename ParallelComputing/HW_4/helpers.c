#include <omp.h>
#include <mpi.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <glib.h>
#include "prototype.h"

Result* decrypt(int keyLen, int fromKey, int toKey, char* inputData, size_t inputLen, GHashTable* wordSet) {
   Result *result;
   // Delegate omp tasks to calculate half of all possible encryption keys each
   result = ompDecrypt(toKey, fromKey, keyLen, inputData, inputLen, wordSet);

   // Return null if decryption was unsuccessful
   if (!result->key) {
      return NULL;
   }

   // If one of the tasks succeeds return the result;
   if (result) {
      return result;
   }
   return NULL;
}

// Return a binary string representation of a decimal number
char* decimalToBinary(int n, int keyLen) {
   int i = 0;
   int j;
   char *binary = (char*) malloc(sizeof(char) * keyLen);
   for (j = 0; j < keyLen; j++) {
      binary[j] = '0';
   }
   if (n == 0) {
      return binary;
   }
   while (n > 0) {
      binary[MIN_KEY_LENGTH - 1 - i] = n % 2 + '0';
      n = n / 2;
      i++;
   }
   return binary;
}

GHashTable *generateWordSet(char *words) {
   GHashTable *table = g_hash_table_new(g_int_hash, g_int_equal);
   const char separator[2] = "\n";
   char *token;
   token = strtok(words, separator);
   while (token != NULL) {
      g_hash_table_add(table, token);
      token = strtok(NULL, separator);
   }
   return table;
}
