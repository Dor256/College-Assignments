#pragma once

#include <stdio.h>
#include <stdbool.h>

#define MAX_TEXT_LENGTH 512
#define DEFAULT_WORDS_FILE "/usr/share/dict/words"
#define MAX_KEY_LENGTH 4

struct Result {
  char* plaintext;
  char* key;
};

int readInputLength(FILE *file);
int* readInput(FILE *file, int size);
int* calcHistogram(int* arr, int size);
struct Result* ompDecrypt(int maxKey, int fromKey, int keyLen, char* inputData, size_t inputLen, char* wordData, size_t wordLen);
struct Result* decrypt(int keyLen, char* inputData, size_t inputLen, char* wordData, size_t wordLen); 

// int* cudaHistogramCalc(int* arr, int size);
bool validate(char *input, char *words, size_t wordLength);
char* encryptDecrypt(char *key, size_t keyLength, char *input, size_t inputLength);
long getFileContentsAsString(FILE *file, char **contents);
char *readStringFromFile(FILE *fp, size_t allocated_size, size_t *input_length);
char* decimalToBinary(int n);
