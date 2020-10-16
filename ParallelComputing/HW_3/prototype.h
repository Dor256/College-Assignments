#pragma once

#include <stdio.h>

#define BUCKET_SIZE 256

int readInputLength(FILE *file);
int* readInput(FILE *file, int size);
int* calcHistogram(int* arr, int size);
int* ompHistogramCalc(int* arr, int size);
int* cudaHistogramCalc(int* arr, int size);
