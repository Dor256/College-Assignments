#include <omp.h>
#include <mpi.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "prototype.h"

Result* decrypt(int keyLen, char* inputData, size_t inputLen, char* wordData, size_t wordLen) {
   Result *firstRes;
   Result *secondRes;

   // Calculate the max key length
   int maxKey = pow(keyLen, 2);
   // Calculate the mid key length
   int halfKey = floor(maxKey / 2);

   // Delegate omp tasks to calculate half of all possible encryption keys each
   firstRes = ompDecrypt(halfKey, 0, keyLen, inputData, inputLen, wordData, wordLen);
   secondRes = ompDecrypt(maxKey, halfKey + 1, keyLen, inputData, inputLen, wordData, wordLen);

   // Return null if decryption was unsuccessful
   if (!firstRes->key && !secondRes->key) {
      return NULL;
   }

   // If one of the tasks succeeds return the result;
   if (firstRes) {
      return firstRes;
   } else {
      return secondRes;
   }
   return NULL;
}

// Return a binary string representation of a decimal number
char* decimalToBinary(int n) {
   int i = 0;
   char *binary = (char*) malloc(sizeof(char) * MIN_KEY_LENGTH);
   binary = strdup("0000");
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
