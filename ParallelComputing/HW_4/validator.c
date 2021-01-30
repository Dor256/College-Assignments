#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <math.h>
#include <glib.h>
#include "prototype.h"

// For a given plaintext and known words return true if the text makes sense
bool isValid(char *string, GHashTable *wordSet) {
  int i;
  const char s[3] = " \n";
  char *token;
  char *tmp = strdup(string);
  token = strtok(tmp, s);
  while (token != NULL) {
    if (g_hash_table_contains(wordSet, token)) {
      return true;
    }
    token = strtok(NULL, s);
  }
  return false;
}

// Function to validate the deciphered text
bool validate(char *input, GHashTable *wordSet) {
 return isValid(input, wordSet);
}
