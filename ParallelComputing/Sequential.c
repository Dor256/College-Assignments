#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <time.h>
#include <mpi.h>

#define HEAVY 100000
#define SHORT 1
#define LONG 10

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


int main(int argc, char *argv[]) {
  int x, y;
	int N = 20;
	double result = 0;
	double start = 0;
	double end = 0;
	MPI_Init(NULL, NULL);
	srand(time(0));
	start = MPI_Wtime();
	for (x = 0; x < N; x++) {
		for (y = 0; y < N; y++) {
			result += heavy(x, y);
		}
	}
	end = MPI_Wtime();
	printf("time = %f\n", end - start);
	printf("answer = %e\n", result);
	MPI_Finalize();
}
