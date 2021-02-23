#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <glib.h>
#include "prototype.h"

// For a given plaintext and known words return true if the text makes sense
int isValid(char *string, GHashTable *wordSet) {
  int i;
  int matchCount = 0;
  const char s[3] = " \n";
  char *token;
  char *tmp = strdup(string);
  token = strtok(tmp, s);
  while (token != NULL) {
    if (g_hash_table_contains(wordSet, token)) {
      matchCount++;
    }
    token = strtok(NULL, s);
  }
  return matchCount;
}

// Function to validate the deciphered text
int validate(char *input, GHashTable *wordSet) {
 return isValid(input, wordSet);
}
