#include <mpi.h>
#include <stdio.h>
#include <math.h>
#include <time.h>
#include <stdlib.h>

#define HEAVY 100000
#define SHORT 1
#define LONG 10
#define PRIMARY_RANK 0
#define CALCULATION_TAG 0
#define TERMINATE_TAG 1
#define N 20

// This function performs heavy computations,
// its run time depends on x and y values
double heavy(int x, int y) {
	int i, loop = SHORT;
	double sum = 0;

// Super heavy tasks
	if (x < 3 || y < 3)
		loop = LONG;
	// Heavy calculations
	for (i = 0; i < loop * HEAVY; i++)
		sum += cos(exp(sin((double) i / HEAVY)));

	return sum;
}
 
int isSecondaryWorker(int rank){
    return rank > 0;
}

int isPrimaryWorker(int rank){
    return rank == PRIMARY_RANK;
}

void secondaryRoutine(int rank, MPI_Status status) {
    int x, y;
    double result;
    status.MPI_TAG = CALCULATION_TAG;
    MPI_Recv(&x, 1, MPI_INT, PRIMARY_RANK, MPI_ANY_TAG, MPI_COMM_WORLD, &status);
    while (status.MPI_TAG != TERMINATE_TAG) {
        result = 0;
        for (y = 0; y < N; y++) { 
            result += heavy(x, y);
        }
        MPI_Send(&result, 1, MPI_DOUBLE, PRIMARY_RANK, status.MPI_TAG, MPI_COMM_WORLD);
        MPI_Recv(&x, 1, MPI_INT, PRIMARY_RANK, MPI_ANY_TAG, MPI_COMM_WORLD, &status);
    }        
}

void primaryRoutine(int numOfWorkers, MPI_Status status) {
    int x;
    double workerResult;
    double start;
    double end; 
    double result = 0;
    srand(time(0));
	start = MPI_Wtime();
    // Send first task to workers
    for (x = 0; x < numOfWorkers && x < N; x++) {
        MPI_Send(&x, 1, MPI_INT, x + 1, CALCULATION_TAG, MPI_COMM_WORLD);
    }
    // Receive the result from the workers and send the next task
    for (; x < N; x++) {     
        MPI_Recv(&workerResult, 1, MPI_DOUBLE, MPI_ANY_SOURCE, MPI_ANY_TAG, MPI_COMM_WORLD, &status);
        result += workerResult;
        MPI_Send(&x, 1, MPI_INT, status.MPI_SOURCE, CALCULATION_TAG, MPI_COMM_WORLD);
    }
    // Receive final results from workers and terminate
    for(x = 1; x <= numOfWorkers; x++) {
        MPI_Recv(&workerResult, 1, MPI_DOUBLE, MPI_ANY_SOURCE, MPI_ANY_TAG, MPI_COMM_WORLD, &status); 
        result += workerResult;
        MPI_Send(&x, 1, MPI_INT, status.MPI_SOURCE, TERMINATE_TAG, MPI_COMM_WORLD);    
    }
	end = MPI_Wtime();
    printf("Elapsed Time: %f\n", end - start);
    printf("Result: %e\n", result);
}

int main(int argc, char *argv[]) {
    MPI_Init(NULL, NULL);
    int rank;
    int numOfProcesses;
    int x;
    MPI_Status status;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &numOfProcesses);
    if (isSecondaryWorker(rank)) {
        secondaryRoutine(rank, status);
    }
    else if (isPrimaryWorker(rank)) {
        primaryRoutine(numOfProcesses - 1, status);
    }
    MPI_Finalize();
}
