#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <math.h>
#include "prototype.h"

// For a given plaintext and known words return true if the text makes sense
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

// Function to validate the deciphered text
bool validate(char *input, char *words, size_t wordLength) {
 return isValid(input, words, wordLength);
}
