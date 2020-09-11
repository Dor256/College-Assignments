#include <mpi.h>
#include <stdio.h>
#include <math.h>
#include <time.h>
#include <stdlib.h>

#define HEAVY 100000
#define SHORT 1
#define LONG 10
#define PRIMARY_RANK 0
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

void secondaryRoutine(int from, int to){
    int x, y;
    double result = 0;
    for (x = from; x < to; x++){
        for (y = 0; y < N; y++) {
            result += heavy(x, y);
        }
    }
    MPI_Send(&result, 1, MPI_DOUBLE, PRIMARY_RANK, 0, MPI_COMM_WORLD);
}

void primaryRoutine(int numOfProcesses){
    int i;
    double workerResult;
    double start;
    double end;
    double result = 0;
    srand(time(0));
	start = MPI_Wtime();
    for(i = 1; i < numOfProcesses; i++){
        MPI_Recv(&workerResult, 1, MPI_DOUBLE, MPI_ANY_SOURCE, MPI_ANY_TAG, MPI_COMM_WORLD,MPI_STATUS_IGNORE);
        result += workerResult;
    }
	end = MPI_Wtime();
    printf("Elapsed Time: %f\n", end - start);
    printf("Result: %e\n", result);
}

int main(int argc, char *argv[]) {
    MPI_Init(NULL, NULL);
    int rank;
    int numOfProcesses;
    int from;
    int to;
    int numOfSplits;
    MPI_Comm_rank(MPI_COMM_WORLD, &rank);
    MPI_Comm_size(MPI_COMM_WORLD, &numOfProcesses);
    if (isSecondaryWorker(rank)) {
        numOfSplits = N / (numOfProcesses - 1);
        to = rank == numOfProcesses - 1 ? N : rank * numOfSplits;
        from = (rank - 1) * numOfSplits;
        secondaryRoutine(from, to);
    }
    else if (isPrimaryWorker(rank)){
        primaryRoutine(numOfProcesses);
    }
    MPI_Finalize();
}
