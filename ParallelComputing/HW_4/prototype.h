#pragma once

#include <stdio.h>
#include <mpi.h>
#include <glib.h>

#define MAX_TEXT_LENGTH 512
#define DEFAULT_WORDS_FILE "/usr/share/dict/words"
#define MIN_KEY_LENGTH 4
#define NUM_OF_THREADS 4

typedef struct {
  char* plaintext;
  char* key;
  int matchCount;
} Result;

Result* ompDecrypt(int maxKey, int fromKey, int keyLen, char* inputData, size_t inputLen, GHashTable* wordSet);
Result* decrypt(int keyLen, int fromKey, int toKey, char* inputData, size_t inputLen, GHashTable* wordSet); 

int validate(char *input, GHashTable *table);
char* encryptDecrypt(char *key, size_t keyLength, char *input, size_t inputLength);
char *readStringFromFile(FILE *fp, size_t allocated_size, int *input_length);
char* decimalToBinary(int n, int keyLen);
GHashTable *generateWordSet(char* words);
