#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <math.h>
#include "prototype.h"

#define MAX_WORD_LENGTH 20

long getFileContentsAsString(FILE *file, char **contents) {
  long length;
  if (file) {
    fseek(file, 0, SEEK_END);
    length = ftell(file);
    fseek(file, 0, SEEK_SET);
    *contents = (char*)malloc(length);
    if (*contents) {
      fread(*contents, 1, length, file);
    }
    fclose(file);
  }
  return length;
}

char** readValidWords(FILE *file, long *length) {
  int i = 0;
  char **words = (char**)malloc(sizeof(char*));
  words[i] = (char*)malloc(sizeof(char) * MAX_WORD_LENGTH);
  while (fscanf(file, "%s", words[i]) != EOF) {
    i++;
    words = (char**)realloc(words, sizeof(char*) * (i + 1));
    words[i] = (char*)malloc(sizeof(char) * MAX_WORD_LENGTH);
  }
  *length = i;
  return words;
}

bool isValid(char *string, char *words, long size) {
  int i;
  const char s[2] = "\n";
  char *token;
  token = strtok(words, s);
  while (token != NULL) {
    if (strstr(string, token) != NULL) {
      return true;
    }
    token = strtok(NULL, s);
  }
  return false;
}

bool validate(char *input, char *words, size_t wordLength) {
 return isValid(input, words, wordLength);
}
