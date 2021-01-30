#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include "prototype.h"
#define START_SIZE 512
#define EXTEND_SIZE 32

char* readStringFromFile(FILE *fp, size_t allocated_size, int *input_length)
{
    char *string;
    int ch;
    *input_length = 0;
    string = (char*)realloc(NULL, sizeof(char) * allocated_size);
    if (!string) {
        return string;
    }
    while (EOF != (ch = fgetc(fp)))
    {
        if (ch == EOF) {
            break;
        }
        string[*input_length] = ch;
        *input_length += 1;
        if (*input_length == allocated_size) {
            string = (char*)realloc(string, sizeof(char) * (allocated_size += EXTEND_SIZE));
            if (!string) {
                return string;
            }
        }
    }
    return (char*)realloc(string, sizeof(char) * (*input_length));
}

void binaryStringToBinary(char *string, size_t num_bytes)
{
    int i, byte;
    unsigned char binary_key[num_bytes];
    for(byte = 0; byte < num_bytes; byte++)
    {
        binary_key[byte] = 0;
        for(i = 0; i < 8; i++)
        {
            binary_key[byte] = binary_key[byte] << 1;
            binary_key[byte] |= string[byte * 8 + i] == '1' ? 1 : 0;  
        }
    }
    memcpy(string, binary_key, num_bytes);
}

char* cipher(char *key, size_t key_len, char *input, size_t inputLength)
{
    int i, j = 0;
    char *output_str = (char*)malloc(inputLength * sizeof(char));
    if (!input || !output_str)
    {
        fprintf(stderr, "Error reading string\n");
        exit(0);
    }
    for (i = 0; i < inputLength; i++, j++)
    {
        if (j == key_len) {
            j = 0;
        }
        output_str[i] = input[i] ^ key[j];
    }
    return output_str;
}

char* encryptDecrypt(char *key, size_t keyLength, char *input, size_t inputLength)
{
    char *out;

    binaryStringToBinary(key, keyLength / MIN_KEY_LENGTH);
    out = cipher(key, keyLength / MIN_KEY_LENGTH, input, inputLength);

    // DEBUG WRITE TO out.txt
    // FILE *fp = fopen("lahout.txt", "w");
    // fwrite(out, sizeof(char), inputLength, fp);
    // fclose(fp);

    return out;
}