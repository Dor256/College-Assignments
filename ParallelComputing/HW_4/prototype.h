#pragma once

#include <stdio.h>
#include <stdbool.h>

#define MAX_TEXT_LENGTH 512
#define DEFAULT_WORDS_FILE "/usr/share/dict/words"
#define MIN_KEY_LENGTH 4
#define NUM_OF_THREADS 4

struct Result {
  char* plaintext;
  char* key;
};

struct Result* ompDecrypt(int maxKey, int fromKey, int keyLen, char* inputData, size_t inputLen, char* wordData, size_t wordLen);
struct Result* decrypt(int keyLen, char* inputData, size_t inputLen, char* wordData, size_t wordLen); 

bool validate(char *input, char *words, size_t wordLength);
char* encryptDecrypt(char *key, size_t keyLength, char *input, size_t inputLength);
char *readStringFromFile(FILE *fp, size_t allocated_size, size_t *input_length);
char* decimalToBinary(int n);
