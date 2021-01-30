#include <cuda_runtime.h>
#include <helper_cuda.h>
#include <stdlib.h>
#include "prototype.h"

__global__  void decryptKernel(struct Result* result, int maxKey, int fromKey, char* inputData, size_t inputLen, char* wordData, size_t wordLen) {
	for (i = fromKey; i < maxKey; i++) {
		// Get threadId
		threadId = omp_get_thread_num();
		// Get binary string representation fo key
		key = decimalToBinary(i);
		// Try to decrypt the cipher with the current key
		decrypted = encryptDecrypt(key, keyLen, inputData, inputLen);
		// Check if the decrypted plaintext makes sense by matching it with the known words text
		if (validate(decrypted, wordData, wordLen)) {
			// Print the threadId that managed to decrypt
			printf("Solving thread is: %d\n", threadId);
			// Allocate memory for encryption key & plaintext
			result->key = (char*) malloc(keyLen * sizeof(char));
			result->plaintext = (char*) malloc(MAX_TEXT_LENGTH * sizeof(char));

			// Save encryption key & plaintext
			strcpy(result->key, key);
			strcpy(result->plaintext, decrypted);
		}
	}
}


struct Result* cudaDecrypt(int maxKey, int fromKey, int keyLen, char* inputData, size_t inputLen, char* wordData, size_t wordLen) {

    // Holds error strings for cuda errors
    cudaError_t err = cudaSuccess;
    struct Result *result;
    char *key, *decrypted;

    // Allocate memory on GPU for data from the host
    err = cudaMalloc((struct Result**)&result, sizeof(struct Result*));
    if (err != cudaSuccess) {
        fprintf(stderr, "Memory allocation failed: %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }
    result->key = NULL;
    result->plaintext = NULL;
    
    decryptKernel<<<1, 5>>>(result, maxKey, fromKey, inputData, inputLen, wordData, wordLen);
    err = cudaGetLastError();
    if (err != cudaSuccess) {
        fprintf(stderr, "Call to decryptKernel failed: %s\n", cudaGetErrorString(err));
    }

    // Call calculation kernel
    // calculationKernel<<<blocksPerGrid, threadsPerBlock>>>(d_A, size / (threadsPerBlock * blocksPerGrid), bucket, blocksPerGrid, threadsPerBlock);
    // err = cudaGetLastError();
    // if (err != cudaSuccess) {
    //     fprintf(stderr, "Call to calculationKernel failed: %s\n", cudaGetErrorString(err));
    //     exit(EXIT_FAILURE);
    // }

    err = cudaDeviceSynchronize();
    if (err != cudaSuccess) {
        fprintf(stderr, "cudaDeviceSynchronize failed after call to calculationKernel:  %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }

    if (result && result->key) {
        printf("%s", result->key);
    } else {
        printf("OK");
    }

    // Call merge kernel
    // mergeKernel<<<1, BUCKET_SIZE>>>(temp, bucket, blocksPerGrid, threadsPerBlock);
    // err = cudaGetLastError();
    // if (err != cudaSuccess) {
    //     fprintf(stderr, "Call to mergeKernel failed:  %s\n", cudaGetErrorString(err));
    //     exit(EXIT_FAILURE);
    // }

    // err = cudaDeviceSynchronize();
    // if (err != cudaSuccess) {
    //     fprintf(stderr, "cudaDeviceSynchronize failed after call to mergKernel -  %s\n", cudaGetErrorString(err));
    //     exit(EXIT_FAILURE);
    // }

    // // Copy result from GPU to the host memory.
    // histogram = (int*) malloc(sizeof(int) * BUCKET_SIZE);
    // if (!histogram) {
    //     fprintf(stderr, "Memory allocation failed\n");
    //     exit(EXIT_FAILURE);	
    // }
    // err = cudaMemcpy(histogram, temp, sizeof(int) * BUCKET_SIZE, cudaMemcpyDeviceToHost);
    // if (err != cudaSuccess) {
    //     fprintf(stderr, "Failed to copy from device to host: %s\n", cudaGetErrorString(err));
    //     exit(EXIT_FAILURE);
    // }

    // Free memory on GPU
    // if (cudaFree(d_A) != cudaSuccess) {
    //     fprintf(stderr, "Failed to free device memory: %s\n", cudaGetErrorString(err));
    //     exit(EXIT_FAILURE);
    // }

    // // Free memory on GPU
    // if (cudaFree(bucket) != cudaSuccess) {
    //     fprintf(stderr, "Failed to free device memory: %s\n", cudaGetErrorString(err));
    //     exit(EXIT_FAILURE);
    // }
    // // Free memory on GPU
    // if (cudaFree(temp) != cudaSuccess) {
    //     fprintf(stderr, "Failed to free device memory: %s\n", cudaGetErrorString(err));
    //     exit(EXIT_FAILURE);
    // }

    // return histogram;
}

