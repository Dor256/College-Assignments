#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <math.h>
#include "prototype.h"

// For a given plaintext and known words return true if the text makes sense
bool isValid(char *string, char *words) {
  int i;
  const char s[3] = " \n";
  char *token;
  char *tmp = strdup(string);
  token = strtok(tmp, s);
  while (token != NULL) {
    if (strstr(words, token) != NULL) {
      return true;
    }
    token = strtok(NULL, s);
  }
  return false;
}

// Function to validate the deciphered text
bool validate(char *input, char *words) {
 return isValid(input, words);
}
