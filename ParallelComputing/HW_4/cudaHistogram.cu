#include <cuda_runtime.h>
#include <helper_cuda.h>
#include <stdlib.h>
#include "prototype.h"

__global__  void calculationKernel(int *arr, int part, int *bucket, int numOfBlocks, int threadsPerBlock) {
	int threadId, blockId, start, end, startOfBucket, i;

	threadId = threadIdx.x;
	blockId = blockIdx.x;

	start = threadId * part;
	end = start + part;

	if (threadId < threadsPerBlock) {
		startOfBucket = (blockId * threadsPerBlock + threadId) * BUCKET_SIZE;
		for (i = start; i < end; ++i) {
			bucket[startOfBucket + arr[i]]++;
		}
	}
}

__global__  void mergeKernel(int *histogram, int *bucket, int numOfBlocks, int threadsPerBlock) {
	int threadId, i, j;

	threadId = threadIdx.x;

	for (i = 0; i < numOfBlocks; i++) {
		for (j = 0; j < threadsPerBlock; j++) {
			histogram[threadId] += bucket[(i * threadsPerBlock + j) * BUCKET_SIZE+ threadId];
		}
	}
}


int* cudaHistogramCalc(int *arr, int size) {

    // Holds error strings for cuda errors
    cudaError_t err = cudaSuccess;

    int threadsPerBlock, blocksPerGrid, *histogram;
    size_t length = size * sizeof(int);

    threadsPerBlock = 32;
    blocksPerGrid = 2;

    // Allocate memory on GPU for data from the host
    int *d_A;
    err = cudaMalloc((void **)&d_A, length);
    if (err != cudaSuccess) {
        fprintf(stderr, "Memory allocation failed: %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }

    // Copy host data to GPU memory
    err = cudaMemcpy(d_A, arr, length, cudaMemcpyHostToDevice);
    if (err != cudaSuccess) {
        fprintf(stderr, "Failed to copy data from host to device: %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }

   // Allocate GPU memory for each bucket
    int *bucket;
    err = cudaMalloc((void **)&bucket, threadsPerBlock * blocksPerGrid * BUCKET_SIZE * sizeof(int));
    if (err != cudaSuccess) {
        fprintf(stderr, "Memory allocation failed: %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }

    // Reset bucket
    err = cudaMemset(bucket, 0, threadsPerBlock * blocksPerGrid * BUCKET_SIZE * sizeof(int));
    if (err != cudaSuccess) {
        fprintf(stderr, "Failed to free allocated memory: %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }

   // Allocate GPU memory for each bucket
    int *temp;
    err = cudaMalloc((void **)&temp, BUCKET_SIZE * sizeof(int));
    if (err != cudaSuccess) {
        fprintf(stderr, "Failed to allocate device memory: %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }

    // Reset bucket
    err = cudaMemset(temp, 0, BUCKET_SIZE * sizeof(int));
    if (err != cudaSuccess) {
        fprintf(stderr, "Failed to free allocated memory: %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }

    // Call calculation kernel
    calculationKernel<<<blocksPerGrid, threadsPerBlock>>>(d_A, size / (threadsPerBlock * blocksPerGrid), bucket, blocksPerGrid, threadsPerBlock);
    err = cudaGetLastError();
    if (err != cudaSuccess) {
        fprintf(stderr, "Call to calculationKernel failed: %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }

    err = cudaDeviceSynchronize();
    if (err != cudaSuccess) {
        fprintf(stderr, "cudaDeviceSynchronize failed after call to calculationKernel:  %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }

    // Call merge kernel
    mergeKernel<<<1, BUCKET_SIZE>>>(temp, bucket, blocksPerGrid, threadsPerBlock);
    err = cudaGetLastError();
    if (err != cudaSuccess) {
        fprintf(stderr, "Call to mergeKernel failed:  %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }

    err = cudaDeviceSynchronize();
    if (err != cudaSuccess) {
        fprintf(stderr, "cudaDeviceSynchronize failed after call to mergKernel -  %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }

    // Copy result from GPU to the host memory.
    histogram = (int*) malloc(sizeof(int) * BUCKET_SIZE);
    if (!histogram) {
        fprintf(stderr, "Memory allocation failed\n");
        exit(EXIT_FAILURE);	
    }
    err = cudaMemcpy(histogram, temp, sizeof(int) * BUCKET_SIZE, cudaMemcpyDeviceToHost);
    if (err != cudaSuccess) {
        fprintf(stderr, "Failed to copy from device to host: %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }

    // Free memory on GPU
    if (cudaFree(d_A) != cudaSuccess) {
        fprintf(stderr, "Failed to free device memory: %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }

    // Free memory on GPU
    if (cudaFree(bucket) != cudaSuccess) {
        fprintf(stderr, "Failed to free device memory: %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }
    // Free memory on GPU
    if (cudaFree(temp) != cudaSuccess) {
        fprintf(stderr, "Failed to free device memory: %s\n", cudaGetErrorString(err));
        exit(EXIT_FAILURE);
    }

    return histogram;
}

